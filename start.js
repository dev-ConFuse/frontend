require('./preload-dns');
const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const { Pool } = require('pg');

// Merged dev/build bootstrap for the frontend.
// Parses .map.env / .secret.env / .env.local, resolves the `enableDeployedUrls`
// DB toggle, merges the result into the Next.js process env and spawns
// `next dev` (mode dev) or `next build` (mode build).
// Usage: node start.js <dev|build|start>

const mode = process.argv[2] || 'dev';
if (mode !== 'dev' && mode !== 'build' && mode !== 'start') {
    console.error('Usage: node start.js <dev|build|start>');
    process.exit(1);
}

// Load environment variables from custom files
const envMapPath = path.resolve(process.cwd(), '.map.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envSecretPath = path.resolve(process.cwd(), '.secret.env');

const mapEnv = fs.existsSync(envMapPath) ? dotenv.parse(fs.readFileSync(envMapPath)) : {};
const localEnv = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};
const secretEnv = fs.existsSync(envSecretPath) ? dotenv.parse(fs.readFileSync(envSecretPath)) : {};

// The toggle lives in the shared PostgreSQL toggles table; when it is
// unreachable we keep whatever the env files / process env already decided.
async function resolveUseDeployedUrls() {
    let useDeployedUrls = process.env.USE_DEPLOYED_URLS === 'true' ||
                          localEnv.USE_DEPLOYED_URLS === 'true' ||
                          secretEnv.USE_DEPLOYED_URLS === 'true' ||
                          mapEnv.USE_DEPLOYED_URLS === 'true';

    const dbUrl = process.env.DATABASE_URL || secretEnv.DATABASE_URL || localEnv.DATABASE_URL || mapEnv.DATABASE_URL;

    if (dbUrl) {
        const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        try {
            const res = await pool.query("SELECT enabled FROM public.toggles WHERE name = 'enableDeployedUrls'");
            if (res.rows.length > 0) {
                useDeployedUrls = res.rows[0].enabled;
            }
        } catch (err) {
            console.error(`🚀 [start-${mode}] Failed to fetch toggle from DB, falling back to .env:`, err.message);
        } finally {
            await pool.end();
        }
    }

    return useDeployedUrls;
}

// Deployed URLs live in .map.env, localhost overrides in .env.local;
// the toggle decides which side of the merge wins.
function buildEnv(useDeployedUrls) {
    if (useDeployedUrls) {
        console.log(`🚀 DB Toggle (enableDeployedUrls) is ON: Loading custom environment variables, prioritizing .map.env (deployed URLs)`);
        return {
            ...process.env,
            ...localEnv,
            ...secretEnv,
            ...mapEnv,
        };
    }
    console.log(`🚀 DB Toggle (enableDeployedUrls) is OFF: Loading custom environment variables, prioritizing .env.local (localhost URLs)`);
    return {
        ...process.env,
        ...mapEnv,
        ...secretEnv,
        ...localEnv,
    };
}

async function main() {
    const mergedEnv = buildEnv(await resolveUseDeployedUrls());

    if (mode === 'build') {
        const nextProcess = spawn('npx', ['next', 'build'], {
            stdio: 'inherit',
            env: mergedEnv,
            shell: true
        });

        nextProcess.on('close', (code) => {
            process.exit(code);
        });
        return;
    }

    const port = mergedEnv.PORT || 3000;

    let nextProcess;
    if (mode === 'start') {
        nextProcess = spawn('node', ['-r', './preload-dns.js', '.next/standalone/server.js'], {
            stdio: ['inherit', 'pipe', 'pipe'],
            env: { ...mergedEnv, PORT: String(port) },
            shell: true
        });
    } else {
        nextProcess = spawn('npx', ['next', 'dev', '-p', String(port)], {
            stdio: ['inherit', 'pipe', 'pipe'],
            env: { ...mergedEnv, NODE_OPTIONS: `${mergedEnv.NODE_OPTIONS || ''} --require ./preload-dns.js`.trim() },
            shell: true
        });
    }

    const sanitizeLog = (data) => {
        let str = data.toString();
        // Hide large tokens like code=... in OAuth callbacks
        str = str.replace(/([?&](?:code|token|access_token|state|session_state)=)[a-zA-Z0-9\-_.~%]+/g, '$1<hidden>');
        return str;
    };

    nextProcess.stdout.on('data', (data) => {
        process.stdout.write(sanitizeLog(data));
    });

    nextProcess.stderr.on('data', (data) => {
        process.stderr.write(sanitizeLog(data));
    });

    nextProcess.on('close', (code) => {
        process.exit(code);
    });

    // Ensure child process is killed when parent exits
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
        process.on(signal, () => {
            if (!nextProcess.killed) {
                nextProcess.kill(signal);
            }
            process.exit();
        });
    });
}

main();