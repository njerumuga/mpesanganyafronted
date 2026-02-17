import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export default function AdminNganya() {
    const [nganyas, setNganyas] = useState([]);
    const [name, setName] = useState("");
    const [size, setSize] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchNganyas = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/nganyas`);
            setNganyas(await res.json());
        } catch (e) {
            console.error(e);
            setNganyas([]);
        }
    };

    useEffect(() => {
        fetchNganyas();
    }, []);

    const createNganya = async () => {
        if (!name.trim() || !size.trim()) return alert("Name & size required");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("size", size.trim());
            if (image) formData.append("image", image);

            await fetch(`${API_BASE}/api/admin/nganyas`, {
                method: "POST",
                body: formData,
            });

            setName("");
            setSize("");
            setImage(null);
            fetchNganyas();
        } finally {
            setLoading(false);
        }
    };

    const deleteNganya = async (id) => {
        if (!window.confirm("Delete this Nganya?")) return;
        await fetch(`${API_BASE}/api/admin/nganyas/${id}`, { method: "DELETE" });
        fetchNganyas();
    };

    const resolveImage = (url) => url || "/placeholder.jpg";

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
            <div>
                <h1 className="text-3xl font-extrabold text-white">Admin – Nganyas</h1>
                <p className="text-white/60 text-sm mt-1">
                    Manage the hire fleet (images and details).
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    <input
                        placeholder="Nganya Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <input
                        placeholder="Size (e.g 33 Seater)"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white/80"
                    />
                </div>

                <button
                    onClick={createNganya}
                    disabled={loading}
                    className="rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 disabled:opacity-60"
                >
                    {loading ? "Adding..." : "Add Nganya"}
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nganyas.map((n) => (
                    <div
                        key={n.id}
                        className="rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                    >
                        <img
                            src={resolveImage(n.imageUrl)}
                            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                            className="h-52 w-full object-cover"
                            alt={n.name}
                        />
                        <div className="p-5 space-y-2">
                            <h3 className="font-bold text-white">{n.name}</h3>
                            <p className="text-white/70 text-sm">Size: {n.size}</p>

                            <button
                                onClick={() => deleteNganya(n.id)}
                                className="text-red-300 hover:text-red-200 font-semibold text-sm"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
