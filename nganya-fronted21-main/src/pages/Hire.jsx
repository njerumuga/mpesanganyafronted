import { useEffect, useState } from "react";
import { API_BASE, ADMIN_PHONE } from "../config";

export default function Hire() {
    const [nganyas, setNganyas] = useState([]);
    const [selected, setSelected] = useState(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        fetch(`${API_BASE}/api/nganyas`)
            .then((res) => res.json())
            .then(setNganyas)
            .catch(() => setNganyas([]));
    }, []);

    const hireNow = () => {
        if (!selected || !name || !phone || !date) {
            alert("Please fill all fields");
            return;
        }

        const message =
            `Hello Nganya Experience 👋\n\n` +
            `🚐 Nganya Hire Request\n\n` +
            `🚌 Nganya: ${selected.name}\n` +
            `📏 Size: ${selected.size}\n` +
            `📅 Date: ${date}\n\n` +
            `👤 Name: ${name}\n` +
            `📞 Phone: ${phone}`;

        window.open(
            `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`,
            "_blank"
        );

        setSelected(null);
        setName("");
        setPhone("");
        setDate("");
    };

    const resolveImage = (url) => url || "/placeholder.jpg";

    return (
        <div className="bg-[#0B0F1A] text-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold">Hire a Nganya</h1>
                    <p className="text-white/60 mt-1">
                        Pick a ride, choose a date, and confirm via WhatsApp.
                    </p>
                </div>

                {/* LIST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {nganyas.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => setSelected(n)}
                            className={`group relative cursor-pointer rounded-2xl overflow-hidden
                border border-white/10 bg-white/5 backdrop-blur-xl
                transition-all duration-500
                hover:-translate-y-2 hover:scale-[1.02]
                hover:shadow-[0_0_50px_rgba(168,85,247,0.25)]
                ${selected?.id === n.id ? "ring-2 ring-cyan-400/60" : ""}`}
                        >
                            <img
                                src={resolveImage(n.imageUrl)}
                                onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                                alt={n.name}
                                className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <div className="p-6">
                                <h3 className="text-xl font-extrabold">{n.name}</h3>
                                <p className="text-white/60 mt-1">Size: {n.size}</p>

                                {selected?.id === n.id && (
                                    <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-200">
                    Selected
                  </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FORM */}
                {selected && (
                    <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-4 shadow-[0_20px_70px_rgba(0,0,0,0.65)]">
                        <h2 className="text-xl font-bold">
                            Hire <span className="text-cyan-300">{selected.name}</span>
                        </h2>

                        <input
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                        />

                        <input
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                        />

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                        />

                        <button
                            onClick={hireNow}
                            className="w-full rounded-xl py-3 font-semibold text-white
                bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 transition"
                        >
                            Hire via WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
