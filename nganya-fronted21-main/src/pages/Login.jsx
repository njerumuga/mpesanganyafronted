import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { setAuth } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });
      setAuth({ token: data.token, email: data.email || email.trim() });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-[#0B0F1A] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)] text-white">
        <h1 className="text-2xl font-extrabold text-center">Welcome back</h1>
        <p className="text-white/60 text-sm text-center mt-1">
          Login to book tickets and manage your orders.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-white/70">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-cyan-300 hover:text-cyan-200 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
