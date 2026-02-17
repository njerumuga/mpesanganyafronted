import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import HireNganya from "./pages/Hire";

// 👤 USER AUTH
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// 🔐 ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import AdminNganya from "./pages/AdminNganya";
import AdminLogin from "./pages/AdminLogin";
import ChangePassword from "./pages/ChangePassword.jsx";

function App() {
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
            <Navbar />

            {/* ✅ Global spacing for fixed navbar */}
            <main className="pt-24">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/hire" element={<HireNganya />} />

                    {/* 👤 USER AUTH */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* 🔐 ADMIN */}
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin/change-password" element={<ChangePassword />} />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/nganya"
                        element={
                            <ProtectedRoute>
                                <AdminNganya />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
