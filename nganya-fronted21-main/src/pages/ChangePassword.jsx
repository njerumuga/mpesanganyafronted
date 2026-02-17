import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert("Fill both fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/auth/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            alert(data?.message || "Done");

            if (data?.status === "success") navigate("/admin");
        } catch (e) {
            console.error(e);
            alert("Failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-4 text-white shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
                <h1 className="text-2xl font-extrabold text-center">
                    Change Admin Password
                </h1>

                <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                />

                <button
                    onClick={changePassword}
                    disabled={loading}
                    className="w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 disabled:opacity-60"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </div>
    );
}
