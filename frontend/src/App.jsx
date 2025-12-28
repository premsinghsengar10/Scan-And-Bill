import React, { useState, useEffect } from 'react';
import { Scan, ShoppingCart, CreditCard, X, Package, CheckCircle2, Info, User, Phone, History, AlertCircle, ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle2 className="text-black" size={20} />,
        error: <AlertCircle className="text-red-600" size={20} />,
        info: <Info className="text-gray-600" size={20} />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl py-4 px-5 shadow-xl"
        >
            {icons[type]}
            <p className="text-sm font-medium text-gray-900">{message}</p>
        </motion.div>
    );
};

// --- Scanner / Selection Component ---
const InventorySelector = ({ onAdd, addToast }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/products');
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            addToast("Failed to load products", "error");
        }
    };

    const handleProductSelect = async (product) => {
        setLoading(true);
        setSelectedProduct(product);
        try {
            const res = await axios.get(`http://localhost:8080/api/products/${product.barcode}/units`);
            setAvailableUnits(res.data);
            setLoading(false);
        } catch (err) {
            addToast("Failed to load units", "error");
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && products.length === 0) return <div className="p-8 text-center text-gray-400">Loading catalog...</div>;

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {!selectedProduct ? (
                    <motion.div
                        key="catalog"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        <div className="search-container">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 text-left">Browse Catalog</h2>
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products or categories..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <Search size={40} className="mx-auto mb-4 opacity-20" />
                                <p>No products found matching "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="product-grid">
                                {filteredProducts.map(p => (
                                    <motion.div
                                        key={p.id}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleProductSelect(p)}
                                        className="glass-card product-card cursor-pointer border-transparent hover:border-black transition-all"
                                    >
                                        <div className="product-image-container">
                                            <img src={p.imageUrl} alt={p.name} className="product-image" />
                                        </div>
                                        <div className="w-full">
                                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</p>
                                            <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                                            <p className="text-sm text-black font-bold">${p.price.toFixed(2)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="units"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5"
                    >
                        <button onClick={() => setSelectedProduct(null)} className="secondary-button flex items-center gap-2 px-4 py-2 text-sm mb-4">
                            <ArrowLeft size={16} /> Back
                        </button>

                        <div className="glass-card flex items-center gap-5 text-left bg-gray-50/50">
                            <img src={selectedProduct.imageUrl} className="w-24 h-24 rounded-xl object-cover shadow-sm" />
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">{selectedProduct.name}</h3>
                                <p className="text-lg text-gray-500 font-medium">${selectedProduct.price.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="pt-4 text-left">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                <Info size={16} /> Select Unit Serial
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                {availableUnits.length === 0 ? (
                                    <div className="col-span-2 text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                                        <p className="text-gray-400 text-sm">Out of stock</p>
                                    </div>
                                ) : (
                                    availableUnits.map(unit => (
                                        <motion.div
                                            key={unit.serialNumber}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onAdd(unit.serialNumber)}
                                            className="border border-gray-200 p-4 rounded-xl cursor-pointer text-center hover:bg-black hover:text-white transition-colors"
                                        >
                                            <p className="font-mono text-xs font-bold uppercase tracking-tight">{unit.serialNumber}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Cart View ---
const CartView = ({ cart, onRemove }) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Your Basket</h2>
            <div className="space-y-3">
                {cart?.items?.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <ShoppingCart size={40} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-400 text-sm">No items in cart</p>
                    </div>
                ) : (
                    cart?.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex-1">
                                <p className="font-bold text-gray-900">{item.productName}</p>
                                <p className="text-[11px] text-gray-400 font-mono font-bold uppercase tracking-tighter">SN: {item.serialNumber}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                                <button
                                    onClick={() => onRemove(item.serialNumber)}
                                    className="p-2 text-gray-300 hover:text-black bg-transparent border-none shadow-none"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {cart?.items?.length > 0 && (
                <div className="glass-card mt-8 flex justify-between items-center bg-gray-50 border-none">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Due</p>
                        <p className="text-3xl font-bold text-black">${cart.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// --- History View ---
const HistoryView = ({ orders }) => {
    return (
        <div className="space-y-6 text-left">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Past Orders</h2>
            {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-20">No transaction logs.</p>
            ) : (
                orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((order) => (
                    <motion.div key={order.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{order.customerName}</p>
                                <p className="text-xs text-gray-400 font-medium">{order.customerMobile}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-300 uppercase">{new Date(order.timestamp).toLocaleDateString()}</p>
                                <p className="text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{order.items.length} Units Purchased</p>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

// --- Main App Component ---
function App() {
    const [activeTab, setActiveTab] = useState('scan');
    const [cart, setCart] = useState(null);
    const [orders, setOrders] = useState([]);
    const [toast, setToast] = useState(null);
    const userId = "user_123";

    useEffect(() => {
        fetchCart();
        fetchOrders();
    }, []);

    const addToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/cart/${userId}`);
            setCart(res.data);
        } catch (err) { }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/orders`);
            setOrders(res.data);
        } catch (err) { }
    };

    const handleAdd = async (serialNumber) => {
        try {
            const res = await axios.post(`http://localhost:8080/api/cart/${userId}/add?serialNumber=${serialNumber}`);
            setCart(res.data);
            addToast(`ID ${serialNumber.split('-').pop()} added to cart`);
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to add", "error");
        }
    };

    const handleRemove = async (serialNumber) => {
        try {
            const res = await axios.delete(`http://localhost:8080/api/cart/${userId}/remove?serialNumber=${serialNumber}`);
            setCart(res.data);
            addToast("Removed from basket");
        } catch (err) { }
    };

    const handleCheckout = async (name, mobile) => {
        try {
            await axios.post(`http://localhost:8080/api/orders/checkout/${userId}?customerName=${name}&customerMobile=${mobile}`);
            await fetchOrders();
            await fetchCart();
            addToast("Order Confirmed");
            setActiveTab('history');
            setCheckoutDetails({ name: '', mobile: '' });
        } catch (err) {
            addToast("Checkout failed", "error");
        }
    };

    const [checkoutDetails, setCheckoutDetails] = useState({ name: '', mobile: '' });

    return (
        <div className="min-h-screen py-10 px-6 max-w-md mx-auto mb-32">
            <header className="mb-12 text-left">
                <h1>SCAN&BILL</h1>
                <p className="text-gray-400 text-sm font-medium">Self-Checkout Point</p>
                <p className="text-[10px] text-gray-300 font-bold tracking-tighter mt-2 uppercase">BY PREM SINGH SENGAR & ANTIGRAVITY</p>
            </header>

            <AnimatePresence>
                {toast && <Toast key="toast" {...toast} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <main className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'scan' && (
                        <InventorySelector key="scan" onAdd={handleAdd} addToast={addToast} />
                    )}
                    {activeTab === 'cart' && (
                        <CartView key="cart" cart={cart} onRemove={handleRemove} />
                    )}
                    {activeTab === 'history' && (
                        <HistoryView key="history" orders={orders} />
                    )}
                    {activeTab === 'pay' && (
                        <div className="space-y-8 text-left">
                            <div className="space-y-2">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Final Step</h2>
                                <p className="text-gray-900 font-bold text-xl">Confirm Purchase</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Johnathan Doe"
                                        value={checkoutDetails.name}
                                        onChange={e => setCheckoutDetails({ ...checkoutDetails, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Mobile Number</label>
                                    <input
                                        type="text"
                                        placeholder="0000 000 000"
                                        value={checkoutDetails.mobile}
                                        onChange={e => setCheckoutDetails({ ...checkoutDetails, mobile: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-400 font-medium">Grand Total</span>
                                    <span className="text-3xl font-bold text-black">${cart?.totalAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                                <button
                                    className="w-full py-4 text-sm uppercase tracking-widest font-bold"
                                    disabled={!checkoutDetails.name || !checkoutDetails.mobile || cart?.totalAmount <= 0}
                                    onClick={() => handleCheckout(checkoutDetails.name, checkoutDetails.mobile)}
                                >
                                    Complete Transaction
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            <nav className="fixed bottom-8 left-6 right-6 max-w-md mx-auto bg-white border border-gray-100 rounded-3xl flex justify-between p-2 shadow-2xl">
                {[
                    { id: 'scan', icon: Scan, label: 'SCAN' },
                    { id: 'cart', icon: ShoppingCart, label: 'CART' },
                    { id: 'pay', icon: CreditCard, label: 'PAY' },
                    { id: 'history', icon: History, label: 'ACTIVITY' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={20} />
                        <span className="text-[9px] font-bold tracking-widest">{tab.label}</span>
                        {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="indicator" />}
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default App;
