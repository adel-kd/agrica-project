import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

export function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: "",
        phoneNumber: "",
        password: "",
        region: "",
        woreda: "",
        role: "farmer" // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await apiPost("/auth/register", form);
            // Auto login or redirect to login
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("Registration failed. Phone number might be taken.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100">Create an account</h2>
                    <p className="mt-2 text-sm text-slate-400">Join Agrica today</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    <div>
                        <label className="text-xs font-semibold text-slate-300">I am a...</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                        >
                            <option value="farmer">Farmer</option>
                            <option value="buyer">Buyer / Consumer</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-300">Full Name</label>
                        <input
                            name="fullName"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                            value={form.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                        <input
                            name="phoneNumber"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                            placeholder="+251..."
                            value={form.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-300">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-300">Region</label>
                            <input
                                name="region"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                                value={form.region}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-300">Woreda</label>
                            <input
                                name="woreda"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                                value={form.woreda}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && <div className="text-xs text-red-500 text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-500 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <div className="text-center text-xs text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
