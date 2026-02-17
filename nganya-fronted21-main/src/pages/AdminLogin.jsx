import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        setError("");
        if (!password.trim()) {
            setError("Password cannot be empty");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: password.trim() }),
            });

            const data = await res.json();

            if (data?.success) {
                localStorage.setItem("isAdmin", "true");
                navigate("/admin");
            } else {
                setError("Wrong password");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") login();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-8 space-y-5">
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-extrabold text-white">Admin Login</h1>
                    <p className="text-sm text-white/60">
                        Enter admin password to access dashboard
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm text-white/70">Admin Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
                    />
                </div>

                <button
                    onClick={login}
                    disabled={loading}
                    className="w-full rounded-xl py-3 font-semibold text-white transition
            bg-gradient-to-r from-purple-600 to-cyan-500
            hover:brightness-110 active:brightness-95
            disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <button
                    className="w-full text-sm text-cyan-300 hover:text-cyan-200 hover:underline"
                    onClick={() => navigate("/admin/change-password")}
                >
                    Change Password
                </button>

                <button
                    className="w-full text-sm text-white/60 hover:text-white hover:underline"
                    onClick={() => navigate("/")}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
