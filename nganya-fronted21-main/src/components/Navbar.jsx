import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/nganya-logo.png";
import { clearAuth, getUserEmail, isLoggedIn } from "../utils/auth";

export default function Navbar() {
    const location = useLocation();
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const [menuOpen, setMenuOpen] = useState(false);

    const loggedIn = isLoggedIn();
    const userEmail = getUserEmail();

    const isHome = location.pathname === "/";

    const adminLogout = () => {
        localStorage.removeItem("isAdmin");
        window.location.href = "/";
    };

    const userLogout = () => {
        clearAuth();
        window.location.href = "/";
    };

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const linkBase =
        "text-sm font-semibold text-gray-200/90 hover:text-white transition";
    const active =
        "text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition";

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isHome
                    ? "bg-[#0B0F1A]/70 backdrop-blur-md"
                    : "bg-[#0B0F1A] shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
            }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-4">
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
                        <img
                            src={logo}
                            alt="Nganya Experience"
                            className="h-9 w-auto object-contain"
                        />
                    </div>
                    <div className="hidden sm:block leading-tight">
                        <div className="text-white font-extrabold tracking-wide">
                            NGANYA<span className="text-purple-400">.</span>
                        </div>
                        <div className="text-[11px] text-white/60">Experience</div>
                    </div>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className={isActive("/") ? active : linkBase}>
                        Home
                    </Link>
                    <Link
                        to="/events"
                        className={isActive("/events") ? active : linkBase}
                    >
                        Events
                    </Link>

                    {/* USER AUTH */}
                    {!loggedIn ? (
                        <>
                            <Link
                                to="/login"
                                className={isActive("/login") ? active : linkBase}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold
                border border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 transition"
                            >
                                Sign up
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="hidden lg:inline text-xs text-white/50">
                                {userEmail || "Logged in"}
                            </span>
                            <button
                                onClick={userLogout}
                                className="text-sm font-semibold text-red-300 hover:text-red-200 transition"
                            >
                                Logout
                            </button>
                        </>
                    )}

                    {/* ADMIN */}
                    {isAdmin && (
                        <>
                            <Link
                                to="/admin"
                                className={isActive("/admin") ? active : linkBase}
                            >
                                Admin
                            </Link>
                            <Link
                                to="/admin/nganya"
                                className={isActive("/admin/nganya") ? active : linkBase}
                            >
                                Admin Nganyas
                            </Link>
                            <button
                                onClick={adminLogout}
                                className="text-sm font-semibold text-red-300 hover:text-red-200 transition"
                            >
                                Admin Logout
                            </button>
                        </>
                    )}
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/hire"
                        className="hidden sm:inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold text-white
              bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 transition"
                    >
                        Hire Nganya
                    </Link>

                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="md:hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                        aria-label="Open menu"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {menuOpen && (
                <div className="md:hidden border-t border-white/10 bg-[#0B0F1A] px-4 py-5 space-y-3">
                    <Link to="/" className="block text-white/90 font-semibold">
                        Home
                    </Link>
                    <Link to="/events" className="block text-white/90 font-semibold">
                        Events
                    </Link>

                    <Link
                        to="/hire"
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white
              bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 transition"
                    >
                        Hire Nganya
                    </Link>

                    {!loggedIn ? (
                        <div className="pt-2 space-y-3">
                            <Link to="/login" className="block text-white/90 font-semibold">
                                Login
                            </Link>
                            <Link to="/signup" className="block text-cyan-200 font-semibold">
                                Sign up
                            </Link>
                        </div>
                    ) : (
                        <div className="pt-2 space-y-2">
                            <div className="text-xs text-white/50">
                                {userEmail || "Logged in"}
                            </div>
                            <button
                                onClick={userLogout}
                                className="block text-red-300 font-semibold"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="pt-2 space-y-3">
                            <Link to="/admin" className="block text-cyan-200 font-semibold">
                                Admin
                            </Link>
                            <Link to="/admin/nganya" className="block text-cyan-200 font-semibold">
                                Admin Nganyas
                            </Link>
                            <button
                                onClick={adminLogout}
                                className="block text-red-300 font-semibold"
                            >
                                Admin Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
