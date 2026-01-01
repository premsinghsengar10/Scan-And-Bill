import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingBag, ClipboardList, Plus, Search, Trash2, Edit2, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const AdminDashboard = ({ user, handleLogout, addToast, storeId, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);

    // Use passed storeId or fall back to user's storeId
    const effectiveStoreId = storeId || user.storeId;

    // Forms
    const [productForm, setProductForm] = useState({
        barcode: '', name: '', price: '', category: 'Electronics', imageUrl: '', basePrice: '', initialStock: 10, taxRate: 18.0, costPrice: 0
    });
    const [inventoryForm, setInventoryForm] = useState({ barcode: '', quantity: 5 });

    useEffect(() => {
        if (effectiveStoreId) {
            fetchStats();
            fetchProducts();
            fetchOrders();
        }
    }, [effectiveStoreId]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`/api/admin/stats?storeId=${effectiveStoreId}`);
            setStats(res.data);
        } catch (err) { }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`/api/products?storeId=${effectiveStoreId}`);
            setProducts(res.data);
        } catch (err) { }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`/api/admin/orders?storeId=${effectiveStoreId}`);
            setOrders(res.data);
        } catch (err) { }
    };

    const handleAddProduct = async () => {
        try {
            const payload = {
                ...productForm,
                price: parseFloat(productForm.price),
                basePrice: parseFloat(productForm.basePrice),
                taxRate: parseFloat(productForm.taxRate),
                costPrice: parseFloat(productForm.costPrice),
                storeId: effectiveStoreId
            };
            await axios.post(`/api/admin/products?initialStock=${productForm.initialStock}`, payload);
            addToast("Product Cataloged Successfully");
            setShowProductModal(false);
            fetchProducts();
        } catch (err) {
            addToast("Failed to add product", "error");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm("Are you sure? This will delete the product catalog entry.")) return;
        try {
            await axios.delete(`/api/admin/products/${id}`);
            addToast("Product Deleted");
            fetchProducts();
        } catch (err) {
            addToast("Failed to delete", "error");
        }
    };

    const handleAddInventory = async () => {
        try {
            await axios.post(`/api/admin/inventory/add?barcode=${inventoryForm.barcode}&quantity=${inventoryForm.quantity}&storeId=${effectiveStoreId}`);
            addToast("Inventory Stock Added");
            setShowInventoryModal(false);
        } catch (err) {
            addToast("Failed to add stock", "error");
        }
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 border-r border-gray-100 p-8 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight">Admin</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.username}</p>
                        </div>
                    </div>
                    {onBack && (
                        <button onClick={onBack} className="w-full flex items-center gap-3 px-6 py-4 mb-4 text-xs font-black uppercase tracking-widest bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">
                            ← Back to Ecosystem
                        </button>
                    )}
                    <nav className="space-y-2">
                        <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                        <SidebarItem id="products" icon={Package} label="Products" />
                        <SidebarItem id="inventory" icon={ClipboardList} label="Inventory" />
                        <SidebarItem id="orders" icon={ShoppingBag} label="Orders" />
                    </nav>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50/30 p-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl space-y-12">
                            <div>
                                <h1 className="text-5xl font-black mb-2">Dashboard</h1>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Real-time Analytics</p>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="glass-card p-10 bg-white rounded-[40px] border border-gray-100">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Total Revenue</p>
                                    <p className="text-6xl font-black">${stats.totalRevenue.toFixed(2)}</p>
                                </div>
                                <div className="glass-card p-10 bg-white rounded-[40px] border border-gray-100">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Total Orders Processed</p>
                                    <p className="text-6xl font-black">{stats.totalOrders}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'products' && (
                        <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-12">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-5xl font-black mb-2">Products</h1>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Catalog Management</p>
                                </div>
                                <button onClick={() => setShowProductModal(true)} className="py-4 px-8 bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:bg-gray-800 transition-all">
                                    <Plus size={16} /> Add Product
                                </button>
                            </div>
                            <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Price</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                                                            <img src={p.imageUrl || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-sm">{p.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.barcode}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black">${p.price.toFixed(2)}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'inventory' && (
                        <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-12">
                            <div>
                                <h1 className="text-5xl font-black mb-2">Inventory</h1>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Stock Level Operations</p>
                            </div>
                            <div className="bg-white p-12 rounded-[40px] border border-gray-100">
                                <h3 className="text-xl font-black mb-8">Add Stock Units</h3>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <select
                                        className="modal-input"
                                        value={inventoryForm.barcode}
                                        onChange={e => setInventoryForm({ ...inventoryForm, barcode: e.target.value })}
                                    >
                                        <option value="">Select Product...</option>
                                        {products.map(p => <option key={p.id} value={p.barcode}>{p.name} ({p.barcode})</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        className="modal-input"
                                        value={inventoryForm.quantity}
                                        onChange={e => setInventoryForm({ ...inventoryForm, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <button onClick={handleAddInventory} disabled={!inventoryForm.barcode} className="w-full py-5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-3xl hover:bg-gray-800 transition-all disabled:opacity-50">
                                    Generate & Add Stock
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-12">
                            <div>
                                <h1 className="text-5xl font-black mb-2">Orders</h1>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Transaction History</p>
                            </div>
                            <div className="space-y-4">
                                {orders.length === 0 ? <p className="text-gray-400 text-sm font-bold">No orders found.</p> : orders.map(order => (
                                    <div key={order.id} className="bg-white p-8 rounded-[32px] border border-gray-100 flex justify-between items-center hover:shadow-sm transition-shadow">
                                        <div>
                                            <p className="font-black text-lg mb-1">{order.customerName}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{order.customerMobile} • {new Date(order.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-2xl">${order.totalAmount.toFixed(2)}</p>
                                            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-lg inline-block mt-2">PAID</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Product Modal */}
            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="New Product" subtitle="Add to Catalog">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Barcode" className="modal-input" value={productForm.barcode} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })} />
                        <select className="modal-input" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                            <option>Electronics</option>
                            <option>Apparel</option>
                            <option>Home</option>
                            <option>Stationery</option>
                        </select>
                    </div>
                    <input type="text" placeholder="Product Name" className="modal-input" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                    <input type="text" placeholder="Image URL" className="modal-input" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />

                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Price ($)" className="modal-input" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                        <input type="number" placeholder="Cost ($)" className="modal-input" value={productForm.costPrice} onChange={e => setProductForm({ ...productForm, costPrice: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Tax Rate (%)" className="modal-input" value={productForm.taxRate} onChange={e => setProductForm({ ...productForm, taxRate: e.target.value })} />
                        <input type="number" placeholder="Initial Stock" className="modal-input" value={productForm.initialStock} onChange={e => setProductForm({ ...productForm, initialStock: e.target.value })} />
                    </div>

                    <button onClick={handleAddProduct} className="w-full py-6 mt-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-gray-800">Save Product</button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
