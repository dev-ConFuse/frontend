/**
 * Documentation surface theming: every /docs page (index + [slug] articles)
 * sits on the warm dark-salmon #E9967A backdrop via the scoped .docs-salmon
 * token set, so token-driven children (Navbar, Cards, Buttons, prose) stay
 * readable while the rest of the app keeps its own themes.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <div className="docs-salmon min-h-screen bg-background">{children}</div>;
}