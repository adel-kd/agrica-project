import { Link, NavLink } from "react-router-dom";

const navItemClasses =
  "px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-slate-800 hover:text-white";

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
              A
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm tracking-wide">AGRICA</span>
              <span className="text-[11px] text-slate-400">AI for African farmers</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/market" className={navItemClasses}>
              Marketplace
            </NavLink>
            <NavLink to="/farmers" className={navItemClasses}>
              Farmer dashboard
            </NavLink>
            <NavLink to="/ai" className={navItemClasses}>
              AI agronomist
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </main>

      <footer className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p>Built for African farmers – IVR + web + AI.</p>
          <p>Backend: Node.js, Express, MongoDB · AI: Gemini, Hasab, Africa&apos;s Talking</p>
        </div>
      </footer>
    </div>
  );
}

