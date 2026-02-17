import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../api/eventApi";

export default function Events() {
    const [events, setEvents] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEvents()
            .then(setEvents)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return events;
        return events.filter((e) => {
            return (
                (e.title || "").toLowerCase().includes(query) ||
                (e.location || "").toLowerCase().includes(query)
            );
        });
    }, [events, q]);

    return (
        <div className="bg-[#0B0F1A] text-gray-200 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                            Events
                        </h1>
                        <p className="text-white/60 mt-1">
                            Explore upcoming experiences and book instantly.
                        </p>
                    </div>

                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by title or location..."
                        className="w-full md:w-96 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>

                {loading && (
                    <div className="text-white/60">Loading events...</div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
                        No events found.
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filtered.map((event) => (
                        <Link key={event.id} to={`/events/${event.id}`} className="group">
                            <div
                                className="relative rounded-2xl overflow-hidden
                border border-white/10 bg-white/5
                transition-all duration-300
                hover:-translate-y-2 hover:scale-[1.02]
                hover:shadow-[0_0_50px_rgba(34,211,238,0.15)]"
                            >
                                <div className="relative h-48 md:h-56 overflow-hidden">
                                    <img
                                        src={event.posterUrl || "/placeholder.jpg"}
                                        onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                </div>

                                <div className="p-5 space-y-2">
                                    <h2 className="text-lg font-extrabold text-white">
                                        {event.title}
                                    </h2>

                                    <p className="text-white/70 text-sm">{event.location}</p>
                                    <p className="text-white/50 text-xs">{event.date}</p>

                                    <div className="pt-3 space-y-1">
                                        {event.tickets?.slice(0, 3).map((ticket) => (
                                            <p
                                                key={ticket.id}
                                                className="text-sm flex justify-between text-white/80"
                                            >
                                                <span>{ticket.name}</span>
                                                <span className="text-cyan-300 font-semibold">
                          KES {ticket.price}
                        </span>
                                            </p>
                                        ))}
                                    </div>

                                    <div className="pt-4">
                                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/90">
                                            View details →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
