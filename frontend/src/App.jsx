import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios for Production/Development
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

console.log("------------------------------------------");
console.log("🚀 SCAN & BILL - ENVIRONMENT DEBUG");
console.log("------------------------------------------");
console.log("Current Mode:", import.meta.env.MODE);
// console.log("API Base URL:", axios.defaults.baseURL);
// console.log("------------------------------------------");
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Toast from './components/Toast';
import SecurityGate from './components/SecurityGate';

// Pages
import LoginView from './pages/LoginView';
import SignupView from './pages/SignupView';
import Dashboard from './pages/Dashboard';

import AdminDashboard from './pages/AdminDashboard'; // Import

function App() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('scan');
    const [cart, setCart] = useState(null);
    const [orders, setOrders] = useState([]);
    const [toast, setToast] = useState(null);
    const [checkoutDetails, setCheckoutDetails] = useState({ name: '', mobile: '' });
    const [isAdminVerified, setIsAdminVerified] = useState(false);
    const [showSecurityGate, setShowSecurityGate] = useState(false);

    // change
    useEffect(() => {
        // Critical Check: Ensure API URL is set in Production
        if (import.meta.env.PROD && !axios.defaults.baseURL) {
            addToast("CRITICAL: Backend URL missing! Check Netlify Settings.", "error");
            console.error("VITE_API_BASE_URL is missing. API calls will fail.");
        }

        const savedUser = sessionStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const addToast = (message, type = 'success') => setToast({ message, type });

    const handleSetActiveTab = (tab) => {
        if (tab === 'admin' && !isAdminVerified) {
            setShowSecurityGate(true);
            return;
        }
        setActiveTab(tab);
    };

    const handleVerifyAdmin = (password) => {
        if (password === user.password) {
            setIsAdminVerified(true);
            setShowSecurityGate(false);
            setActiveTab('admin');
            addToast("Identity Confirmed", "success");
        } else {
            addToast("Invalid Authorization", "error");
        }
    };

    useEffect(() => {
        if (user && user.role !== 'SUPER_ADMIN') {
            fetchCart();
            fetchOrders();
        }
    }, [user, activeTab]);

    const fetchCart = async () => {
        if (!user || !user.storeId) return;
        try {
            const res = await axios.get(`/api/cart/${user.id}?storeId=${user.storeId}`);
            setCart(res.data);
        } catch (err) { }
    };

    const fetchOrders = async () => {
        if (!user || !user.storeId) return;
        try {
            const res = await axios.get(`/api/orders?storeId=${user.storeId}`);
            setOrders(res.data);
        } catch (err) { }
    };

    const handleLogin = (userData) => {
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        addToast(`Welcome back, ${userData.username}`);
        setActiveTab(userData.role === 'SUPER_ADMIN' ? 'admin' : 'scan');
    };

    const handleLogout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        setCart(null);
        setOrders([]);
        setIsAdminVerified(false);
        addToast("Session Terminated");
    };

    const handleAdd = async (serialNumber) => {
        try {
            const res = await axios.post(`/api/cart/${user.id}/add?serialNumber=${serialNumber}&storeId=${user.storeId}`);
            setCart(res.data);
            addToast(`Acquired: ${serialNumber.split('-').pop()}`);
        } catch (err) {
            addToast(err.response?.data?.message || "Error", "error");
        }
    };

    const handleRemove = async (serialNumber) => {
        try {
            const res = await axios.delete(`/api/cart/${user.id}/remove?serialNumber=${serialNumber}&storeId=${user.storeId}`);
            setCart(res.data);
            addToast("Unit Released");
        } catch (err) { }
    };

    const handleCheckout = async () => {
        try {
            const idempotencyKey = crypto.randomUUID();
            await axios.post(`/api/orders/checkout/${user.id}?customerName=${checkoutDetails.name}&customerMobile=${checkoutDetails.mobile}&storeId=${user.storeId}&idempotencyKey=${idempotencyKey}`);
            await fetchOrders();
            await fetchCart();
            addToast("Transaction Confirmed");
            setActiveTab('history');
            setCheckoutDetails({ name: '', mobile: '' });
        } catch (err) {
            addToast(err.response?.data || "Failed to authorize", "error");
        }
    };


    return (
        <BrowserRouter>
            <AnimatePresence>
                {toast && <Toast key="toast" {...toast} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <Routes>
                <Route path="/login" element={!user ? <LoginView onLogin={handleLogin} /> : <Navigate to={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? "/admin" : "/"} />} />
                <Route path="/signup" element={!user ? <SignupView onSignup={() => addToast("Store Registered Successfully")} /> : <Navigate to="/" />} />

                {/* Admin Route */}
                <Route path="/admin" element={user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ?
                    <AdminDashboard user={user} handleLogout={handleLogout} addToast={addToast} />
                    : <Navigate to="/" />
                } />

                {/* Customer Route */}
                <Route path="/" element={user ?
                    <Dashboard
                        user={user}
                        handleLogout={handleLogout}
                        cart={cart}
                        orders={orders}
                        fetchCart={fetchCart}
                        fetchOrders={fetchOrders}
                        activeTab={activeTab}
                        setActiveTab={handleSetActiveTab}
                        handleAdd={handleAdd}
                        handleRemove={handleRemove}
                        handleCheckout={handleCheckout}
                        checkoutDetails={checkoutDetails}
                        setCheckoutDetails={setCheckoutDetails}
                        addToast={addToast}
                    /> :
                    <Navigate to="/login" />
                } />
            </Routes>

            <SecurityGate
                isOpen={showSecurityGate}
                onVerify={handleVerifyAdmin}
                onClose={() => setShowSecurityGate(false)}
            />
        </BrowserRouter>
    );
}

export default App;
