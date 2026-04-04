import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE, ADMIN_PHONE } from "../config";

export default function EventDetails() {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    const [payStatus, setPayStatus] = useState(null); // PENDING | PAID | FAILED
    const [checkoutRequestId, setCheckoutRequestId] = useState(null);

    // Helper to survive Render cold starts
    async function fetchJsonWithRetry(url, { retries = 3, timeoutMs = 15000 } = {}) {
        let lastErr;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const t = setTimeout(() => controller.abort(), timeoutMs);

                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(t);

                if (!res.ok) {
                    if (res.status >= 500 && attempt < retries) {
                        await new Promise((r) => setTimeout(r, 1000 * attempt));
                        continue;
                    }
                    throw new Error(`Request failed (${res.status})`);
                }

                return await res.json();
            } catch (e) {
                lastErr = e;
                if (attempt < retries) {
                    await new Promise((r) => setTimeout(r, 1000 * attempt));
                    continue;
                }
            }
        }
        const err = new Error("Failed to fetch (server may be waking up)");
        err.cause = lastErr;
        throw err;
    }

    const refreshEvent = async () => {
        try {
            const data = await fetchJsonWithRetry(`${API_BASE}/api/events/${id}`, { retries: 4, timeoutMs: 15000 });
            setEvent(data);
        } catch (e) {
            console.error("Could not load event", e);
        }
    };

    useEffect(() => {
        refreshEvent();
    }, [id]);

    // Poll payment status
    useEffect(() => {
        if (!checkoutRequestId) return;
        let cancelled = false;

        const tick = async () => {
            try {
                const data = await fetchJsonWithRetry(`${API_BASE}/api/payments/status/${checkoutRequestId}`, { retries: 3, timeoutMs: 15000 });
                if (cancelled) return;

                const ps = String(data.paymentStatus || "").toUpperCase();
                if (ps === "PAID") {
                    setPayStatus("PAID");
                    setSuccess({ ticketCode: data.ticketCode });
                    setCheckoutRequestId(null);
                    await refreshEvent();
                } else if (ps === "FAILED") {
                    setPayStatus("FAILED");
                    setCheckoutRequestId(null);
                } else {
                    setPayStatus("PENDING");
                }
            } catch (e) {
                // ignore transient errors
            }
        };

        const interval = setInterval(tick, 3000);
        tick();
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [checkoutRequestId]);

    const handleBooking = async () => {
        if (!selectedTicket || selectedTicket.seatsLeft <= 0) return;
        if (!customerName.trim() || !phoneNumber.trim()) return;

        setLoading(true);
        setPayStatus(null);
        setCheckoutRequestId(null);
        setSuccess(null);

        try {
            // --- STEP 1: CREATE BOOKING ---
            const response = await fetch(`${API_BASE}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: customerName.trim(),
                    phoneNumber: phoneNumber.trim(),
                    eventId: event.id,
                    ticketTypeId: selectedTicket.id,
                }),
            });

            // GENTLE JSON PARSING: Fixes the "Unexpected token 'b'" error
            let data;
            const responseText = await response.text();
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                data = { message: responseText }; // Use plain text as message if not JSON
            }

            if (!response.ok) {
                console.error("Booking API error", response.status, data);
                alert(data?.error || data?.message || `Booking failed (${response.status})`);
                setLoading(false);
                return;
            }

            // --- STEP 2: HANDLE PAYMENT ---
            const method = (event.paymentMethod || "TILL").toUpperCase();
            const hasNumber = !!(event.paymentNumber && String(event.paymentNumber).trim());

            if ((method === "PAYBILL" || method === "TILL") && hasNumber) {
                const payRes = await fetch(`${API_BASE}/api/payments/stk-push`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bookingId: data.id, // ID from Step 1
                        phoneNumber: phoneNumber.trim(),
                    }),
                });

                let payData;
                const payText = await payRes.text();
                try {
                    payData = JSON.parse(payText);
                } catch (e) {
                    payData = { message: payText };
                }

                if (!payRes.ok) {
                    console.error("STK API error", payRes.status, payData);
                    alert(payData?.message || payData?.error || `Payment request failed (${payRes.status})`);
                    setLoading(false);
                    return;
                }

                if (payData?.status === "PAID") {
                    setPayStatus("PAID");
                    setSuccess({ ticketCode: payData.ticketCode });
                    await refreshEvent();
                } else {
                    setPayStatus("PENDING");
                    setCheckoutRequestId(payData.checkoutRequestId);
                }
            } else {
                // WHATSAPP FALLBACK
                const message =
                    `Hello Nganya Experience 👋\n\n` +
                    `🎉 Event: ${event.title}\n` +
                    `🎟️ Ticket: ${selectedTicket.name}\n` +
                    `👤 Name: ${customerName}\n` +
                    `📞 Phone: ${phoneNumber}\n` +
                    `🧾 Booking ID: ${data.id}`;

                window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
                setSuccess({ pending: true });
            }

            setCustomerName("");
            setPhoneNumber("");
            setSelectedTicket(null);
        } catch (e) {
            console.error("Booking process crashed", e);
            alert("A network error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!event) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white/70">
                Loading event details...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-gray-200 px-4 pb-10">
            <div className="max-w-5xl mx-auto pt-10">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
                    <div className="relative">
                        <img
                            src={event.posterUrl || "/placeholder.jpg"}
                            alt={event.title}
                            className="w-full h-80 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-black/30 to-transparent" />
                    </div>

                    <div className="p-6 md:p-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">{event.title}</h1>
                        <div className="mt-2 text-white/70">
                            <div>{event.location}</div>
                            <div className="text-sm text-white/50">{event.date} · {event.time}</div>
                        </div>

                        <p className="mt-5 text-white/80 leading-relaxed">{event.description}</p>

                        <h2 className="text-2xl font-bold mt-10 mb-4 text-white">Select Ticket</h2>
                        <div className="space-y-4">
                            {event.tickets?.map((ticket) => {
                                const soldOut = ticket.seatsLeft <= 0;
                                return (
                                    <label
                                        key={ticket.id}
                                        className={`flex justify-between items-center rounded-xl border p-4 transition 
                                            ${soldOut ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-cyan-400/40"}
                                            ${selectedTicket?.id === ticket.id ? "border-cyan-400/50 bg-black/20" : "border-white/10 bg-black/10"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                disabled={soldOut}
                                                checked={selectedTicket?.id === ticket.id}
                                                onChange={() => setSelectedTicket(ticket)}
                                            />
                                            <span className="font-semibold text-white">
                                                {ticket.name} {soldOut && <span className="ml-2 text-red-400 text-xs font-bold">SOLD OUT</span>}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-white">KES {ticket.price}</p>
                                            <p className="text-xs text-white/60">{ticket.seatsLeft} left</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {selectedTicket && !selectedTicket.seatsLeft <= 0 && (
                            <div className="mt-8 space-y-4">
                                <input
                                    placeholder="Your Full Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                                />
                                <input
                                    placeholder="M-Pesa Phone Number (e.g. 0712345678)"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                                />
                                <button
                                    onClick={handleBooking}
                                    disabled={!customerName || !phoneNumber || loading}
                                    className="w-full rounded-xl py-4 font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 disabled:opacity-50 transition-all"
                                >
                                    {loading ? "Processing..." : "Confirm & Pay with M-Pesa"}
                                </button>
                            </div>
                        )}

                        {payStatus === "PENDING" && (
                            <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-center animate-pulse">
                                Waiting for M-Pesa PIN entry on your phone...
                            </div>
                        )}

                        {success && (
                            <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-emerald-200 text-center">
                                <div className="text-xl mb-1">✅ Success!</div>
                                {success.ticketCode ? (
                                    <div>Your Ticket Code: <span className="font-mono font-bold text-white bg-black/40 px-2 py-1 rounded">{success.ticketCode}</span></div>
                                ) : (
                                    <div>Booking created. Please complete payment on your phone.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}