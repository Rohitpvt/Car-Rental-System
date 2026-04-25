import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars, addCar, updateCar, getBookedCars, getCarBookings } from './api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AddCar from './AddCar';

const Dashboard = () => {
 const navigate = useNavigate();
 const [user, setUser] = useState(null);
 const [cars, setCars] = useState([]);
 const [bookings, setBookings] = useState([]);
 const [loadingCars, setLoadingCars] = useState(true);
 const [loadingBookings, setLoadingBookings] = useState(false);
 const [currentView, setCurrentView] = useState('overview'); 
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [profileOpen, setProfileOpen] = useState(false);
 
 // Agency state
 const [showAddForm, setShowAddForm] = useState(false);

 useEffect(() => {
 const loggedInUser = localStorage.getItem('user');
 if (!loggedInUser) {
 navigate('/login');
 } else {
 setUser(JSON.parse(loggedInUser));
 fetchData();
 }
 }, [navigate]);

 const fetchData = async () => {
 setLoadingCars(true);
 setLoadingBookings(true);
 const [carsData, bookingsData] = await Promise.all([getCars(), getBookedCars()]);
 setLoadingCars(false);
 setLoadingBookings(false);

 if (carsData?.success) setCars(carsData.records);
 if (bookingsData?.success) setBookings(bookingsData.records);
 };

 const stats = useMemo(() => {
 const fleet = user?.role === 'agency' ? cars.filter(c => c.agency_id == user.id) : cars;
 const myBookings = bookings;
 const totalRevenue = myBookings.reduce((acc, b) => acc + (Number(b.rent_per_day) * Number(b.days)), 0);

 return {
 totalCars: fleet.length,
 activeBookings: myBookings.length,
 revenue: totalRevenue
 };
 }, [cars, bookings, user]);

 const handleLogout = () => {
 localStorage.removeItem('user');
 navigate('/login');
 toast.success("Logged out successfully");
 };

 if (!user) return null;

 const NavItem = ({ id, label, icon }) => (
 <div 
 onClick={() => { setCurrentView(id); setIsSidebarOpen(false); }}
 className={`sidebar-item flex items-center gap-6 px-8 py-6 text-xs font-black transition-all duration-200 hover:bg-slate-800/80 hover:text-white border-l-4 border-transparent cursor-pointer uppercase tracking-[0.2em] ${currentView === id ? 'sidebar-item-active opacity-100 bg-slate-800 text-white border-primary shadow-lg ' : 'opacity-50'}`}
 >
 <div className={`${currentView === id ? 'text-primary scale-110' : 'text-slate-500'} transition-all duration-200`}>
 {icon}
 </div>
 <span>{label}</span>
 {currentView === id && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
 </div>
 );

 return (
 <div className="flex h-screen bg-slate-50 overflow-hidden">
 {/* Sidebar Overlay (Mobile) */}
 {isSidebarOpen && (
 <div 
 className="fixed inset-0 bg-slate-900/60 z-[60] xl:hidden animate-fade-in"
 onClick={() => setIsSidebarOpen(false)}
 />
 )}

 {/* Sidebar Navigation */}
 <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-slate-950 text-slate-300 transform transition-transform duration-200 ease-out xl:relative xl:translate-x-0 border-r border-slate-900 shadow-lg xl: ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
 <div className="flex flex-col h-full">
 <div className="p-8 border-b border-slate-900/50">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ">C</div>
 <span className="text-xl font-black text-white tracking-tighter">CarRental <span className="text-primary italic">Pro</span></span>
 </div>
 </div>

 <nav className="flex-1 py-8 overflow-y-auto no-scrollbar">
 <div className="px-8 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Infrastructure</div>
 <NavItem id="overview" label="Overview" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
 <NavItem id="fleet" label="Fleet Asset" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
 <NavItem id="bookings" label="Logistics" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
 <div className="px-8 mb-6 mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Preferences</div>
 <NavItem id="settings" label="Settings" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
 </nav>

 <div className="p-8 border-t border-slate-900 bg-slate-950/80">
 <div className="flex items-center gap-4 group">
 <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-white uppercase group-hover:border-primary/50 transition-all">{user.name.substring(0,2)}</div>
 <div className="overflow-hidden">
 <p className="text-sm font-black text-white truncate tracking-tight">{user.name}</p>
 <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] truncate">{user.role}</p>
 </div>
 </div>
 <button onClick={handleLogout} className="w-full mt-8 shadow-lg flex items-center justify-center gap-4 py-4 bg-red-500/5 text-red-500 border border-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:shadow-md hover: transition-all active:scale-95">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4-4H3" /></svg>
 <span>Sign Out</span>
 </button>
 </div>
 </div>
 </aside>

 <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto relative">
 <header className="sticky top-0 z-50 bg-white/80 border-b border-slate-100 px-8 h-20 flex items-center shadow-sm ">
 <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between">
 <div className="flex items-center gap-6">
 <button 
 onClick={() => setIsSidebarOpen(true)}
 className="xl:hidden p-4 text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 active:scale-95"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
 </button>
 <div>
 <h2 className="text-2xl font-black text-text_primary tracking-tighter">
 {currentView === 'overview' ? 'Dashboard' : 
 currentView === 'fleet' ? 'Fleet Ecosystem' : 
 currentView === 'bookings' ? 'Logistics Engine' : 'System Context'}
 </h2>
 <div className="flex items-center gap-4 text-[10px] font-black text-text_secondary uppercase tracking-[0.25em] mt-2 opacity-60">
 Workspace
 <div className="w-1 h-1 bg-slate-300 rounded-full" />
 <span className="text-primary tracking-widest">{user.role} Identity</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4 relative">
 <div 
 className="flex items-center gap-4 cursor-pointer group"
 onClick={() => setProfileOpen(!profileOpen)}
 >
 <div className="text-right hidden sm:block">
 <p className="text-xs font-black text-text_primary">{user.name}</p>
 <p className="text-[9px] font-bold text-text_secondary uppercase tracking-widest">{user.email}</p>
 </div>
 <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-primary shadow-sm group-hover:border-primary/50 transition-all">
 {user.name.charAt(0)}
 </div>
 </div>
 {profileOpen && (
 <div className="profile-dropdown top-full shadow-lg">
 <div className="px-4 py-4 border-b border-slate-50">
 <p className="text-xs font-bold text-text_primary">{user.name}</p>
 <p className="text-[10px] text-text_secondary truncate">{user.email}</p>
 </div>
 <div className="py-2">
 <button onClick={() => setCurrentView('settings')} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
 Settings
 </button>
 </div>
 <div className="border-t border-slate-50 pt-2">
 <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4-4H3" /></svg>
 Logout
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </header>

 <div className="p-8 max-w-screen-2xl mx-auto w-full min-h-[calc(100vh-80px)]">
 <AnimatePresence mode="wait">
 {currentView === 'overview' && (
 <motion.div 
 key="overview"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.4, ease: "easeOut" }}
 className="space-y-10"
 >
 <section>
 <h1 className="text-3xl font-black text-text_primary tracking-tight mb-2">Welcome Back, <span className="text-primary italic">{user.name.split(' ')[0]}</span>.</h1>
 <p className="text-sm font-black text-text_secondary leading-relaxed max-w-2xl opacity-60">Architecting premium mobility experiences from your {user.role} control center.</p>
 </section>

 <motion.div 
 variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
 initial="hidden" animate="show"
 className="grid grid-cols-1 md:grid-cols-3 gap-8"
 >
 <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -8 }} className="stat-card p-8 border-none bg-white shadow-md relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-200" />
 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary mb-6 opacity-60">Current Fleet Asset</p>
 <div className="flex items-end justify-between relative z-10">
 <div>
 <h3 className="text-5xl font-black text-text_primary tracking-tighter">{stats.totalCars}</h3>
 <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">Verified Units</p>
 </div>
 <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg ">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
 </div>
 </div>
 </motion.div>
 <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -8 }} className="stat-card p-8 border-none bg-white shadow-md relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-200" />
 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary mb-6 opacity-60">System Throughput</p>
 <div className="flex items-end justify-between relative z-10">
 <div>
 <h3 className="text-5xl font-black text-text_primary tracking-tighter">{stats.activeBookings}</h3>
 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">Active Cycles</p>
 </div>
 <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg ">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
 </div>
 </div>
 </motion.div>
 <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -8 }} className="stat-card p-8 border-none bg-white shadow-md relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-200" />
 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary mb-6 opacity-60">Net Capitalized</p>
 <div className="flex items-end justify-between relative z-10">
 <div>
 <h3 className="text-5xl font-black text-text_primary tracking-tighter">₹{stats.revenue}</h3>
 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-2">Guaranteed INR</p>
 </div>
 <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg ">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>
 </div>
 </div>
 </motion.div>
 </motion.div>

 <section>
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-xl font-black text-text_primary tracking-tighter italic">Recent Activity Stream</h3>
 <button onClick={() => setCurrentView('bookings')} className="text-[10px] font-black text-primary hover:underline underline-offset-4 uppercase tracking-[0.2em] opacity-80">Full Audit Log</button>
 </div>
 <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-md ">
 <div className="overflow-x-auto no-scrollbar">
 <table className="w-full table-zebra">
 <thead className="bg-slate-50/80 border-b border-slate-100/50">
 <tr>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary text-left opacity-60">Asset Identity</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary text-left opacity-60">Operations Period</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary text-left opacity-60">Fiscal Value</th>
 <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary text-right opacity-60">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50/50">
 {bookings.slice(0, 5).map(b => (
 <tr key={b.booking_id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-8 py-6">
 <p className="text-sm font-black text-text_primary tracking-tight">{b.model}</p>
 <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mt-2">{b.vehicle_number}</p>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-4">
 <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-text_primary">{new Date(b.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
 <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m4-4H3" /></svg>
 <div className="text-[10px] font-black text-text_secondary uppercase tracking-widest">{b.days} Cycles</div>
 </div>
 </td>
 <td className="px-8 py-6 text-sm font-black text-text_primary tracking-tight">₹{b.rent_per_day * b.days}</td>
 <td className="px-8 py-6 text-right">
 <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-emerald-100/50">Operational</span>
 </td>
 </tr>
 ))}
 {bookings.length === 0 && (
 <tr><td colSpan="4" className="px-8 py-8 text-center text-text_secondary font-black uppercase tracking-widest text-[10px] opacity-40">No records found.</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </section>
 </motion.div>
 )}

 {currentView === 'fleet' && (
 <motion.div 
 key="fleet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
 className="space-y-8"
 >
 <div className="flex justify-between items-center mb-8">
 <div>
 <h2 className="text-3xl font-black text-text_primary tracking-tighter italic">Fleet Control Center</h2>
 <p className="text-[10px] font-black text-text_secondary uppercase tracking-[0.4em] mt-2 opacity-60">Asset Modulation</p>
 </div>
 {user.role === 'agency' && (
 <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary rounded-2xl px-8 py-6 flex items-center gap-4 transition-all active:scale-95">
 <svg className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
 <span className="text-[11px] font-black uppercase tracking-[0.25em]">{showAddForm ? 'Close' : 'Register Asset'}</span>
 </button>
 )}
 </div>

 {showAddForm && user.role?.toLowerCase().trim() === 'agency' && (
 <div className="animate-scale-in mb-8">
   <AddCar onSuccess={() => { setShowAddForm(false); fetchData(); }} onCancel={() => setShowAddForm(false)} />
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {loadingCars ? [1,2,3].map(i => <div key={i} className="h-64 skeleton-shimmer rounded-xl" />) : 
 cars.filter(c => user.role?.toLowerCase().trim() === 'agency' ? c.agency_id == user.id : true).map(car => (
 <div key={car.id} className="bg-white border border-slate-100 rounded-xl p-8 shadow-md transition-all group overflow-hidden">
 <div className="flex justify-between items-start mb-8">
 <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden rounded-2xl mb-8 group-hover:shadow-inner transition-all">
  {car.images && car.images.length > 0 ? (
    <img src={car.images[0].startsWith('http') ? car.images[0] : `http://localhost:8000/uploads/images/${car.images[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={car.model} />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>
  )}
 </div>
 <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border ${car.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{car.is_available ? 'Available' : 'Engaged'}</span>
 </div>
 <h4 className="text-2xl font-black text-text_primary mb-2 truncate">{car.model}</h4>
 <p className="text-[10px] font-black text-primary uppercase mb-8">{car.vehicle_number}</p>
 <div className="grid grid-cols-2 gap-4 mb-8">
 <div className="bg-slate-50 rounded-2xl p-4"><p className="text-[9px] font-black uppercase opacity-50">Payload</p><p className="text-base font-black">{car.seating_capacity}</p></div>
 <div className="bg-slate-50 rounded-2xl p-4"><p className="text-[9px] font-black uppercase opacity-50">Valuation</p><p className="text-base font-black">₹{car.rent_per_day}</p></div>
 </div>
 {user.role === 'agency' && (
 <button onClick={() => { setShowAddForm(true); }} className="w-full py-6 bg-slate-50 border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Modulate (Requires new UI)</button>
 )}
 </div>
 ))
 }
 </div>
 </motion.div>
 )}

 {currentView === 'bookings' && (
 <motion.div key="bookings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
 <h2 className="text-3xl font-black text-text_primary tracking-tighter italic">Logistics Engine</h2>
 <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-md ">
 {loadingBookings ? <div className="p-8 text-center skeleton-shimmer">Loading dataset...</div> : (
 <table className="w-full table-zebra">
 <thead className="bg-slate-50/80 border-b">
 <tr>
 <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-text_secondary text-left">UID</th>
 <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-text_secondary text-left">Asset</th>
 <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-text_secondary text-center">Timeline</th>
 <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-text_secondary text-center">Fiscal</th>
 {user.role === 'agency' && <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-text_secondary text-right">Client</th>}
 </tr>
 </thead>
 <tbody className="divide-y">
 {bookings.map(b => (
 <tr key={b.booking_id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-8 py-8 text-xs font-black text-slate-400">#{b.booking_id}</td>
 <td className="px-8 py-8"><p className="text-base font-black tracking-tight">{b.model}</p><p className="text-[10px] font-black text-primary uppercase">{b.vehicle_number}</p></td>
 <td className="px-8 py-8 text-center"><span className="text-sm font-black">{b.days} Cycles</span></td>
 <td className="px-8 py-8 text-center"><div className="bg-primary text-white px-6 py-2 rounded-2xl font-black">₹{b.rent_per_day * b.days}</div></td>
 {user.role === 'agency' && <td className="px-8 py-8 text-right"><p className="text-sm font-black">{b.customer_name}</p></td>}
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </motion.div>
 )}

 {currentView === 'settings' && (
 <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
 <div className="w-24 h-24 bg-primary/5 rounded-xl flex items-center justify-center text-4xl mb-8 border border-primary/10">⚙️</div>
 <h2 className="text-3xl font-black text-text_primary tracking-tighter mb-4 italic">Security & Profile</h2>
 <p className="text-sm font-black text-text_secondary max-w-sm leading-relaxed mb-8 opacity-60">Calibration in progress. Profile updates and security protocols will be accessible soon.</p>
 <button onClick={() => setCurrentView('overview')} className="btn-primary rounded-xl px-8 py-4 text-[10px] font-black uppercase tracking-widest">Return to Hub</button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </main>
 </div>
 );
};

export default Dashboard;
