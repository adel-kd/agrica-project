import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "/image.png";

const navItemClasses =
  "px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-slate-800 hover:text-white";

export function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 backdrop-blur-md bg-slate-950/50 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <img src="/image.png" alt="Agrica" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AGRICA</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Making africa greener </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/market" className={navItemClasses}>
              Marketplace
            </NavLink>
            <NavLink to="/ai" className={navItemClasses}>
              AI Agronomist
            </NavLink>

            {user && user.role === 'farmer' && (
              <NavLink to="/farmers" className={navItemClasses}>
                Dashboard
              </NavLink>
            )}

            {!user ? (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/login" className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-1.5 rounded-full bg-primary-600 text-xs font-semibold text-white shadow-lg shadow-primary-900/50 hover:bg-primary-500 transition-all hover:scale-105">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200">{user.fullName}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                  Log out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>© 2026 Agrica. Built for African farmers.</p>
          <div className="flex gap-4">
            <span>Infobip Voice</span>
            <span>Gemini AI</span>
            <span>Hasab STT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

