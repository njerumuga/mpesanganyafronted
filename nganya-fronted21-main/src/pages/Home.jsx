import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
    const [show, setShow] = useState(false);
    const [showAdminBtn, setShowAdminBtn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setShow(true), 200);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        let keySequence = [];
        const secretCode = ["a", "d", "m", "i", "n"];

        const handleKeyDown = (e) => {
            keySequence.push(e.key.toLowerCase());
            if (keySequence.length > secretCode.length) keySequence.shift();

            if (keySequence.join("") === secretCode.join("")) {
                setShowAdminBtn(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="bg-[#0B0F1A] text-white min-h-screen relative">
            {/* HERO */}
            <section
                className="min-h-[calc(100vh-96px)] flex items-center justify-center text-center px-6 bg-cover bg-center relative"
                style={{ backgroundImage: "url('/hero-nganya.jpg')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#0B0F1A]" />

                <div
                    className={`relative max-w-4xl transition-all duration-1000 ease-out ${
                        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                        🔥 Nairobi nightlife • Matatu culture • Events & Hire
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-5">
                        NGANYA <span className="text-purple-400">EXPERIENCE</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/70 mb-8">
                        Premium matatu culture. Hire legendary nganyas. Feel the vibe.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/hire"
                            className="rounded-xl px-8 py-3 font-semibold text-white
                bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 transition"
                        >
                            Book a Nganya
                        </Link>

                        <Link
                            to="/events"
                            className="rounded-xl px-8 py-3 font-semibold border border-white/15 text-white/90
                hover:bg-white/10 transition"
                        >
                            Explore Events
                        </Link>
                    </div>
                </div>
            </section>

            <WhyChooseNganya />

            {/* Hidden Admin Button */}
            {showAdminBtn && (
                <button
                    onClick={() => navigate("/admin-login")}
                    className="fixed bottom-4 right-4 rounded-xl bg-red-600 text-white px-4 py-2 shadow-lg z-50"
                >
                    Admin
                </button>
            )}
        </div>
    );
}

function WhyChooseNganya() {
    return (
        <section className="py-20 px-6 bg-[#0B0F1A]">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14">
                Why Choose <span className="text-purple-400">Nganya</span>?
            </h2>

            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
                <div className="rounded-2xl p-8 text-center border border-white/10 bg-white/5 backdrop-blur hover:border-cyan-400/40 transition">
                    <h3 className="text-xl font-bold mb-4 text-cyan-200">
                        Legendary Culture
                    </h3>
                    <p className="text-white/70">
                        Authentic matatu art, sound systems, lights, and vibes — straight
                        from the streets.
                    </p>
                </div>

                <div className="rounded-2xl p-8 text-center border border-white/10 bg-white/5 backdrop-blur hover:border-cyan-400/40 transition">
                    <h3 className="text-xl font-bold mb-4 text-cyan-200">Premium Hire</h3>
                    <p className="text-white/70">
                        Weddings, shoots, parties, road trips — hire nganyas built to turn
                        heads.
                    </p>
                </div>

                <div className="rounded-2xl p-8 text-center border border-white/10 bg-white/5 backdrop-blur hover:border-cyan-400/40 transition">
                    <h3 className="text-xl font-bold mb-4 text-cyan-200">
                        Trusted & Safe
                    </h3>
                    <p className="text-white/70">
                        Verified owners, professional drivers, and smooth bookings via
                        WhatsApp.
                    </p>
                </div>
            </div>
        </section>
    );
}
