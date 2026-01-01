import React, { useState, useEffect } from 'react';
import { Store, Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import InventorySelector from '../components/InventorySelector';
import CartView from '../components/CartView';
import HistoryView from '../components/HistoryView';

import AdminDashboard from './AdminDashboard';

const Dashboard = ({ user, handleLogout, cart, orders, fetchCart, fetchOrders, activeTab, setActiveTab, handleAdd, handleRemove, handleCheckout, checkoutDetails, setCheckoutDetails, addToast }) => {
    const [stores, setStores] = useState([]);
    const [adminProducts, setAdminProducts] = useState([]);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [storeForm, setStoreForm] = useState({ name: '', location: '', adminUsername: '', adminPassword: '' });
    const [productForm, setProductForm] = useState({ barcode: '', name: '', price: '', category: 'Electronics', imageUrl: '', basePrice: '', initialStock: 10 });
    const [selectedStoreId, setSelectedStoreId] = useState(null);

    useEffect(() => {
        if (user.role === 'SUPER_ADMIN' && activeTab === 'admin') {
            fetchStores();
        } else if (user.role === 'ADMIN' && activeTab === 'admin') {
            fetchAdminProducts();
        }
    }, [user, activeTab]);

    // ... existing fetching logic ...

    const fetchStores = async () => {
        try {
            const res = await axios.get('/api/auth/stores');
            setStores(res.data);
        } catch (err) { }
    };

    const fetchAdminProducts = async () => {
        try {
            const res = await axios.get(`/api/products?storeId=${user.storeId}`);
            setAdminProducts(res.data);
        } catch (err) { }
    };

    // ... handleCreateStore, handleAddProduct ...

    const handleCreateStore = async () => {
        try {
            await axios.post('/api/auth/register-store', storeForm);
            addToast("Node Provisioned Successfully");
            setShowStoreModal(false);
            setStoreForm({ name: '', location: '', adminUsername: '', adminPassword: '' });
            fetchStores();
        } catch (err) {
            addToast("Failed to provision node", "error");
        }
    };

    const handleAddProduct = async () => {
        try {
            const payload = { ...productForm, price: parseFloat(productForm.price), basePrice: parseFloat(productForm.basePrice), storeId: user.storeId };
            await axios.post('/api/products', payload);
            addToast("Asset Cataloged Successfully");
            setShowProductModal(false);
            setProductForm({ barcode: '', name: '', price: '', category: 'Electronics', imageUrl: '', basePrice: '', initialStock: 10 });
            fetchAdminProducts();
        } catch (err) {
            addToast("Failed to catalog asset", "error");
        }
    };

    return (
        <div className="app-container">
            <Navbar
                user={user}
                cart={cart}
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    if (tab === 'admin') setSelectedStoreId(null); // Reset when switching tabs
                }}
                handleLogout={handleLogout}
            />

            <main className="min-h-[70vh]">
                <AnimatePresence mode="wait">
                    {user.role === 'SUPER_ADMIN' ? (
                        activeTab === 'admin' && (
                            selectedStoreId ? (
                                <AdminDashboard
                                    user={user}
                                    storeId={selectedStoreId}
                                    onBack={() => setSelectedStoreId(null)}
                                    handleLogout={handleLogout}
                                    addToast={addToast}
                                />
                            ) : (
                                <div className="max-w-4xl mx-auto py-10 px-6">
                                    <div className="flex justify-between items-end mb-16">
                                        <div>
                                            <h1 className="text-5xl font-black">Ecosystem</h1>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Active Node Infrastructure</p>
                                        </div>
                                        <button onClick={() => setShowStoreModal(true)} className="py-4 px-8 rounded-2xl flex items-center gap-3">
                                            <Plus size={18} /> Provision Store
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {stores.map(store => (
                                            <div key={store.id} className="glass-card p-12 bg-white rounded-[40px] border border-gray-50 flex flex-col items-center text-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                                                    <Store className="text-black" size={32} />
                                                </div>
                                                <h3 className="text-xl font-black tracking-tight mb-2">{store.name}</h3>
                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">{store.location}</p>
                                                <div className="flex gap-4 w-full">
                                                    <button onClick={() => setSelectedStoreId(store.id)} className="flex-1 py-3 px-0 bg-gray-50 text-black text-[10px] uppercase font-black tracking-widest rounded-xl hover:bg-black hover:text-white transition-all shadow-none">Inspect</button>
                                                    <button className="flex-1 py-3 px-0 bg-red-50 text-red-600 text-[10px] uppercase font-black tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-none border-none">Decommission</button>
                                                </div>
                                            </div>
                                        ))}
                                        <div onClick={() => setShowStoreModal(true)} className="glass-card p-12 bg-white/50 rounded-[40px] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center h-[320px] cursor-pointer hover:bg-gray-50 transition-all">
                                            <Plus className="text-gray-300 mb-4" size={48} />
                                            <p className="text-gray-300 font-bold uppercase tracking-[0.2em] text-[10px]">Add New Node Infrastructure</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        )
                    ) : (
                        <>
                            {activeTab === 'scan' && <InventorySelector key="scan" onAdd={handleAdd} addToast={addToast} storeId={user.storeId} />}
                            {activeTab === 'cart' && <CartView key="cart" cart={cart} onRemove={handleRemove} />}
                            {activeTab === 'history' && <HistoryView key="history" orders={orders} />}
                            {activeTab === 'pay' && (
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-16 text-left py-10">
                                    <div className="space-y-3">
                                        <h1 className="text-5xl font-black">Checkout</h1>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Settle your balance</p>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Customer Identifier</label>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={checkoutDetails.name}
                                                onChange={e => setCheckoutDetails({ ...checkoutDetails, name: e.target.value })}
                                                className="bg-white border-2 border-gray-50 focus:border-black p-6 rounded-[24px]"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Anchor</label>
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                value={checkoutDetails.mobile}
                                                onChange={e => setCheckoutDetails({ ...checkoutDetails, mobile: e.target.value })}
                                                className="bg-white border-2 border-gray-50 focus:border-black p-6 rounded-[24px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-16 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Due</p>
                                            <p className="text-4xl font-black">${cart?.totalAmount?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <button
                                            className="px-12 py-5 text-xs font-black uppercase tracking-[0.2em] rounded-3xl"
                                            disabled={!checkoutDetails.name || !checkoutDetails.mobile || cart?.totalAmount <= 0}
                                            onClick={handleCheckout}
                                        >
                                            Authorize
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'admin' && (
                                <div className="max-w-5xl mx-auto py-10 px-6">
                                    <div className="flex justify-between items-end mb-16">
                                        <div>
                                            <h1 className="text-5xl font-black">Inventory Admin</h1>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Manage Store Assets</p>
                                        </div>
                                        <button onClick={() => setShowProductModal(true)} className="py-4 px-8 rounded-2xl flex items-center gap-3">
                                            <Plus size={18} /> New Product
                                        </button>
                                    </div>
                                    <div className="glass-card overflow-hidden border-none shadow-sm rounded-[48px]">
                                        <table className="w-full text-left bg-white">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                                                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Valuation</th>
                                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {adminProducts.map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-gray-900">{p.name}</p>
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.barcode}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                                                        </td>
                                                        <td className="px-10 py-8 text-right font-black text-gray-900">${p.price.toFixed(2)}</td>
                                                        <td className="px-10 py-8 text-right">
                                                            <button className="p-3 bg-gray-50 text-gray-400 hover:text-black rounded-xl shadow-none border-none">
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </main>

            {/* Creation Modals */}
            <Modal isOpen={showStoreModal} onClose={() => setShowStoreModal(false)} title="Provision Node" subtitle="Expand System Infrastructure">
                <div className="space-y-6">
                    <input type="text" placeholder="Store Name" className="modal-input" value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
                    <input type="text" placeholder="Physical Coordinates (Location)" className="modal-input" value={storeForm.location} onChange={e => setStoreForm({ ...storeForm, location: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Admin Username" className="modal-input" value={storeForm.adminUsername} onChange={e => setStoreForm({ ...storeForm, adminUsername: e.target.value })} />
                        <input type="password" placeholder="Admin Access Key" className="modal-input" value={storeForm.adminPassword} onChange={e => setStoreForm({ ...storeForm, adminPassword: e.target.value })} />
                    </div>
                    <button onClick={handleCreateStore} className="w-full py-6 mt-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-3xl">Initialize Provisioning</button>
                </div>
            </Modal>

            <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="Catalog Asset" subtitle="New Inventory Manifest">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Barcode ID" className="modal-input" value={productForm.barcode} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })} />
                        <select className="modal-input" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                            <option>Electronics</option>
                            <option>Apparel</option>
                            <option>Home</option>
                            <option>Stationery</option>
                            <option>Accessories</option>
                        </select>
                    </div>
                    <input type="text" placeholder="Display Designation" className="modal-input" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Listing Value ($)" className="modal-input" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                        <input type="number" placeholder="Procurement Cost ($)" className="modal-input" value={productForm.basePrice} onChange={e => setProductForm({ ...productForm, basePrice: e.target.value })} />
                    </div>
                    <input type="text" placeholder="Visual Asset URI (Image URL)" className="modal-input" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
                    <input type="number" placeholder="Initial Allocation Stock" className="modal-input" value={productForm.initialStock} onChange={e => setProductForm({ ...productForm, initialStock: parseInt(e.target.value) })} />
                    <button onClick={handleAddProduct} className="w-full py-6 mt-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-3xl">Execute Cataloging</button>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
