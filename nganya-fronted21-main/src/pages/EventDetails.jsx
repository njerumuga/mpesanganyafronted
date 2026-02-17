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

  const refreshEvent = async () => {
    const res = await fetch(`${API_BASE}/api/events/${id}`);
    const data = await res.json();
    setEvent(data);
  };

  useEffect(() => {
    refreshEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Poll payment status when we have a checkoutRequestId
  // MUST be declared BEFORE any early returns to keep hook order stable.
  useEffect(() => {
    if (!checkoutRequestId) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/status/${checkoutRequestId}`);
        const data = await res.json();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutRequestId]);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white/70">
        Loading event...
      </div>
    );
  }

  const handleBooking = async () => {
    if (!selectedTicket || selectedTicket.seatsLeft <= 0) return;
    if (!customerName.trim() || !phoneNumber.trim()) return;

    setLoading(true);

    try {
      setPayStatus(null);
      setCheckoutRequestId(null);

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

      const data = await response.json();

      // If this event is PAYBILL -> trigger Daraja STK Push
      if ((event.paymentMethod || "").toUpperCase() === "PAYBILL") {
        const payRes = await fetch(`${API_BASE}/api/payments/stk-push`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: data.id,
            phoneNumber: phoneNumber.trim(),
          }),
        });

        const payData = await payRes.json();

        if (payData?.status === "PAID") {
          setPayStatus("PAID");
          setSuccess({ ticketCode: payData.ticketCode });
          await refreshEvent();
        } else {
          setPayStatus("PENDING");
          setCheckoutRequestId(payData.checkoutRequestId);
        }

        return;
      }

      const message =
        `Hello Nganya Experience 👋\n\n` +
        `🎉 Event: ${event.title}\n` +
        `📍 Location: ${event.location}\n` +
        `📅 Date: ${event.date} ${event.time || ""}\n\n` +
        `🎟️ Ticket: ${selectedTicket.name}\n` +
        `💰 Price: KES ${selectedTicket.price}\n\n` +
        `👤 Name: ${customerName}\n` +
        `📞 Phone: ${phoneNumber}\n\n` +
        `🧾 Booking ID: ${data.id}\n` +
        `💳 Payment Method: ${(event.paymentMethod || "TILL")}\n` +
        `${(event.paymentMethod || "TILL").toUpperCase() === "TILL"
          ? `✅ Pay via Till: ${event.paymentNumber || "(not set)"}`
          : `✅ Pay via Paybill: ${event.paymentNumber || "(not set)"} ACC: ${event.paybillAccount || "(your name/phone)"}`
        }`;

      window.open(
        `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      setSuccess(data);
      await refreshEvent();

      setCustomerName("");
      setPhoneNumber("");
      setSelectedTicket(null);
    } catch (e) {
      console.error("Booking failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-gray-200 px-4 pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_20px_70px_rgba(0,0,0,0.65)]">
          <div className="relative">
            <img
              src={event.posterUrl || "/placeholder.jpg"}
              onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
              alt={event.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-black/30 to-transparent" />
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              {event.title}
            </h1>
            <div className="mt-2 text-white/70">
              <div>{event.location}</div>
              <div className="text-sm text-white/50">
                {event.date} {event.time ? `· ${event.time}` : ""}
              </div>
            </div>

            <p className="mt-5 text-white/80 leading-relaxed">
              {event.description}
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-white">
              Select Ticket
            </h2>

            <div className="space-y-4">
              {event.tickets?.map((ticket) => {
                const soldOut = ticket.seatsLeft <= 0;

                return (
                  <label
                    key={ticket.id}
                    className={`flex justify-between items-center rounded-xl border p-4 transition
                      ${soldOut ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-cyan-400/40"}
                      ${selectedTicket?.id === ticket.id ? "border-cyan-400/50 bg-black/20" : "border-white/10 bg-black/10"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        disabled={soldOut}
                        checked={selectedTicket?.id === ticket.id}
                        onChange={() => setSelectedTicket(ticket)}
                      />
                      <span className="font-semibold text-white">
                        {ticket.name}
                        {soldOut && (
                          <span className="ml-2 text-red-300 font-bold text-sm">
                            SOLD OUT
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-white">KES {ticket.price}</p>
                      <p className="text-sm text-white/60">
                        {ticket.seatsLeft} seats left
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedTicket && selectedTicket.seatsLeft > 0 && (
              <div className="mt-8 space-y-4">
                <input
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />

                <input
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />

                <button
                  onClick={handleBooking}
                  disabled={!customerName || !phoneNumber || loading}
                  className="w-full rounded-xl py-3 font-semibold text-white
                    bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 disabled:opacity-60"
                >
                  {loading
                    ? "Processing..."
                    : (event.paymentMethod || "TILL").toUpperCase() === "PAYBILL"
                      ? "Pay with M-Pesa (STK Push)"
                      : "Book via WhatsApp"}
                </button>

                {(event.paymentMethod || "TILL").toUpperCase() === "PAYBILL" && (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                    <div className="font-semibold text-white">Paybill Payment</div>
                    <div>Paybill: <b>{event.paymentNumber || "(not set)"}</b></div>
                    {event.paybillAccount && (
                      <div>Account: <b>{event.paybillAccount}</b></div>
                    )}
                    {payStatus === "PENDING" && (
                      <div className="mt-2 text-cyan-200 font-semibold">
                        Waiting for STK confirmation... enter your PIN.
                      </div>
                    )}
                    {payStatus === "FAILED" && (
                      <div className="mt-2 text-red-200 font-semibold">
                        Payment failed or cancelled. Try again.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-200 font-semibold text-center">
                ✅ Booking successful <br />
                Ticket Code: <b>{success.ticketCode || "Pending"}</b>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
