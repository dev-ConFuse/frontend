const dns = require('dns');
const origLookup = dns.lookup;
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dns.lookup = (h, o, cb) => {
  if (typeof o === 'function') {
    cb = o;
    o = {};
  }
  dns.resolve4(h, (err, addrs) => {
    if (!err && addrs && addrs.length) {
      return o && o.all ? cb(null, addrs.map(a => ({ address: a, family: 4 }))) : cb(null, addrs[0], 4);
    }
    origLookup.call(dns, h, o, cb);
  });
};