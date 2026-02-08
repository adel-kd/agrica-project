import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const navItemClasses =
  "px-3 py-2 text-sm font-medium rounded-full transition-colors hover:bg-emerald-50 text-gray-700 hover:text-emerald-700";

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-gray-200 backdrop-blur-md bg-white/70 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 overflow-hidden rounded-xl border border-emerald-100 shadow-sm shadow-emerald-500/10 group-hover:shadow-emerald-500/20 transition-all">
              <img src="/image.png" alt="Agrica" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg tracking-wide text-emerald-600">AGRICA</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Making africa greener</span>
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

            <a
              href="/demo/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              Demo IVR
            </a>

            {!user ? (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/login" className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-1.5 rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all hover:scale-105">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-gray-800">{user.fullName}</span>
                  <span className="text-[10px] text-gray-500 capitalize">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:text-emerald-700 transition-colors">
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

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
