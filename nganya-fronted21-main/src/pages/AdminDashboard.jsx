import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";

export default function AdminDashboard() {
    const [events, setEvents] = useState([]);

    // form state
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [posterFile, setPosterFile] = useState(null);
    const [tickets, setTickets] = useState([{ name: "", price: "", capacity: "" }]);

    // payment config per event
    const [paymentMethod, setPaymentMethod] = useState("TILL");
    const [paymentNumber, setPaymentNumber] = useState("");
    const [paybillAccount, setPaybillAccount] = useState("");

    // UI state
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const fetchEvents = async () => {
        setError("");
        setLoadingEvents(true);
        try {
            const res = await fetch(`${API_BASE}/api/events`);
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setError("Failed to load events. Check backend or network.");
            setEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateTicket = (index, field, value) => {
        const updated = [...tickets];
        updated[index] = { ...updated[index], [field]: value };
        setTickets(updated);
    };

    const addTicket = () => setTickets([...tickets, { name: "", price: "", capacity: "" }]);

    const removeTicket = (index) => {
        if (tickets.length === 1) return;
        setTickets(tickets.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setTitle("");
        setDate("");
        setTime("");
        setLocation("");
        setDescription("");
        setPosterFile(null);
        setTickets([{ name: "", price: "", capacity: "" }]);

        setPaymentMethod("TILL");
        setPaymentNumber("");
        setPaybillAccount("");
    };

    const validTickets = useMemo(() => {
        // keep only filled ticket rows, and ensure price/capacity are numbers
        return tickets
            .filter((t) => (t.name || "").trim() !== "")
            .map((t) => ({
                name: (t.name || "").trim(),
                price: Number(t.price),
                capacity: Number(t.capacity),
            }))
            .filter((t) => t.name && Number.isFinite(t.price) && Number.isFinite(t.capacity));
    }, [tickets]);

    // ✅ FINAL CREATE EVENT (MATCHES BACKEND)
    const createEvent = async () => {
        setError("");

        if (!title.trim() || !date || !location.trim()) {
            alert("Fill required fields: Title, Date, Location");
            return;
        }

        if (validTickets.length === 0) {
            alert("Add at least one valid ticket (name, price, capacity).");
            return;
        }

        setCreating(true);

        try {
            const formData = new FormData();

            const event = {
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                date,
                time,
                status: "UPCOMING",

                paymentMethod,
                paymentNumber: paymentNumber.trim() || null,
                paybillAccount: paybillAccount.trim() || null,
            };

            formData.append("event", new Blob([JSON.stringify(event)], { type: "application/json" }));
            formData.append(
                "tickets",
                new Blob([JSON.stringify(validTickets)], { type: "application/json" })
            );

            if (posterFile) formData.append("poster", posterFile);

            const res = await fetch(`${API_BASE}/api/admin/events`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Create failed: ${res.status}`);
            }

            resetForm();
            fetchEvents();
        } catch (e) {
            console.error(e);
            setError("Failed to create event. Check backend logs / request payload.");
        } finally {
            setCreating(false);
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm("Delete this event?")) return;

        setError("");
        setDeletingId(id);

        try {
            const res = await fetch(`${API_BASE}/api/admin/events/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            fetchEvents();
        } catch (e) {
            console.error(e);
            setError("Failed to delete event.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-white/60 mt-1">
                        Create events, upload posters, and manage listings.
                    </p>
                </div>

                <button
                    onClick={fetchEvents}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-200">
                    {error}
                </div>
            )}

            {/* CREATE EVENT */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.65)] space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl md:text-2xl font-extrabold text-white">Create Event</h2>
                    <span className="text-xs text-white/50">
            Required: Title • Date • Location
          </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        placeholder="Title *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />

                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />

                    <input
                        placeholder="Location *"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white/80 md:col-span-2"
                    />

                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20 md:col-span-2 min-h-[110px]"
                    />

                    {/* PAYMENT CONFIG */}
                    <div className="md:col-span-2 rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
                        <div className="text-white font-bold">Payment for this Event</div>
                        <div className="grid md:grid-cols-3 gap-3">
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                            >
                                <option value="TILL">TILL (Buy Goods)</option>
                                <option value="PAYBILL">PAYBILL (STK Push / Paybill)</option>
                            </select>

                            <input
                                placeholder={paymentMethod === "PAYBILL" ? "Paybill Shortcode (e.g. 247247)" : "Till Number"}
                                value={paymentNumber}
                                onChange={(e) => setPaymentNumber(e.target.value)}
                                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                            />

                            <input
                                placeholder="Paybill Account (optional)"
                                value={paybillAccount}
                                onChange={(e) => setPaybillAccount(e.target.value)}
                                disabled={paymentMethod !== "PAYBILL"}
                                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none disabled:opacity-60"
                            />
                        </div>
                        <div className="text-xs text-white/60">
                            Tip: For automated Daraja STK Push, set paymentMethod=PAYBILL and paymentNumber=your paybill shortcode.
                        </div>
                    </div>
                </div>

                {/* TICKETS */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="font-bold text-white">Ticket Types</h3>
                        <button
                            onClick={addTicket}
                            className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
                        >
                            + Add Ticket
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tickets.map((t, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                            >
                                <input
                                    placeholder="Name (e.g Regular)"
                                    value={t.name}
                                    onChange={(e) => updateTicket(i, "name", e.target.value)}
                                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                                />

                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={t.price}
                                    onChange={(e) => updateTicket(i, "price", e.target.value)}
                                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                                />

                                <input
                                    type="number"
                                    placeholder="Capacity"
                                    value={t.capacity}
                                    onChange={(e) => updateTicket(i, "capacity", e.target.value)}
                                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                                />

                                <button
                                    onClick={() => removeTicket(i)}
                                    disabled={tickets.length === 1}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-white/10 disabled:opacity-40"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-xs text-white/50">
                        Tip: leave unused ticket rows blank — only valid rows are sent to backend.
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={createEvent}
                        disabled={creating}
                        className="rounded-xl px-6 py-3 font-semibold text-white
              bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 disabled:opacity-60"
                    >
                        {creating ? "Creating..." : "Add Event"}
                    </button>

                    <button
                        onClick={resetForm}
                        disabled={creating}
                        className="rounded-xl px-6 py-3 font-semibold text-white/90 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-60"
                    >
                        Clear Form
                    </button>
                </div>
            </div>

            {/* LIST EVENTS */}
            <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-white">Posted Events</h2>

                {loadingEvents && (
                    <div className="text-white/60">Loading events...</div>
                )}

                {!loadingEvents && events.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
                        No events posted yet.
                    </div>
                )}

                <div className="space-y-3">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
                        >
                            <div>
                                <p className="font-extrabold text-white">{event.title}</p>
                                <p className="text-sm text-white/60">
                                    {event.location} · {event.date} {event.time ? `· ${event.time}` : ""}
                                </p>
                            </div>

                            <button
                                onClick={() => deleteEvent(event.id)}
                                disabled={deletingId === event.id}
                                className="rounded-xl px-4 py-2 font-semibold text-white
                  bg-red-600 hover:bg-red-700 disabled:opacity-60"
                            >
                                {deletingId === event.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
