import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

export function Login() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Using generic apiPost assuming /api/auth/login exists
            const res = await apiPost("/auth/login", { phoneNumber: phone, password });

            localStorage.setItem("token", "dummy-token-jwt-" + res.user.id);
            localStorage.setItem("user", JSON.stringify(res.user));

            // Redirect based on role
            if (res.user.role === "farmer") {
                navigate("/farmers");
            } else {
                navigate("/market");
            }
        } catch (err) {
            console.error(err);
            setError("Invalid phone number or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100">Welcome back</h2>
                    <p className="mt-2 text-sm text-slate-400">Sign in to your account</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                                placeholder="+251..."
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-300">Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-xs text-red-500 text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-500 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="text-center text-xs text-slate-400">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
