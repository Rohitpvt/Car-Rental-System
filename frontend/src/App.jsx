import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Register from './Register';
import CompleteProfile from './CompleteProfile';
import Dashboard from './Dashboard';
import AvailableCars from './AvailableCars';
import Footer from './Footer';
import VerifyIdentity from './VerifyIdentity';
import { auth } from './firebase';
import { Navigate } from 'react-router-dom';

const Navbar = () => {
 const location = useLocation();
 const navigate = useNavigate();
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isProfileOpen, setIsProfileOpen] = useState(false);
 const profileRef = useRef(null);

 const userString = localStorage.getItem('user');
 const user = userString ? JSON.parse(userString) : null;

 const handleLogout = () => {
 auth.signOut();
 localStorage.removeItem('user');
 localStorage.removeItem('token');
 setIsProfileOpen(false);
 navigate('/login');
 };

 // Close profile dropdown when clicking outside
 useEffect(() => {
 const handleClickOutside = (event) => {
 if (profileRef.current && !profileRef.current.contains(event.target)) {
 setIsProfileOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 // Close mobile menu on route change
 useEffect(() => {
 setIsMobileMenuOpen(false);
 }, [location.pathname]);

 const navLinks = [
 { name: 'Home', path: '/' },
 { name: 'Available Fleet', path: '/cars' },
 ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
 ];

 const isActive = (path) => location.pathname === path;

 return (
 <header className="sticky top-0 z-header w-full bg-white/80 border-b border-slate-100 transition-all duration-200">
 <div className="max-w-7xl mx-auto px-6 lg:px-8">
 <div className="flex justify-between items-center h-20">
 {/* Left: Logo */}
 <div className="flex-shrink-0 flex items-center">
 <Link to="/" className="text-xl font-bold text-text_primary tracking-tight">
 CarRental<span className="text-primary">Pro</span>
 </Link>
 </div>

 {/* Center: Navigation (Desktop) */}
 <nav className="hidden md:flex space-x-8">
 {navLinks.map((link) => (
 <Link
 key={link.path}
 to={link.path}
 className={`text-sm font-semibold transition-all duration-200 relative group px-2 py-2 ${isActive(link.path) ? 'text-primary' : 'text-text_secondary hover:text-primary'}`}
 >
 {link.name}
 <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-primary transform origin-left transition-transform duration-200 ease-out ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
 </Link>
 ))}
 </nav>

 {/* Right: Auth Buttons / Profile */}
 <div className="hidden md:flex items-center space-x-4">
 {user ? (
 <div className="relative" ref={profileRef}>
 <button
 onClick={() => setIsProfileOpen(!isProfileOpen)}
 className="flex items-center space-x-2 focus:outline-none"
 >
 <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm hover:shadow-md transition-all">
 {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
 </div>
 </button>

 {/* Profile Dropdown */}
 {isProfileOpen && (
 <div className="profile-dropdown top-full shadow-md">
 <div className="px-6 py-4 border-b border-slate-50 mb-2">
 <p className="text-xs font-black text-text_primary tracking-tight truncate">{user.name}</p>
 <p className="text-[10px] font-bold text-text_secondary uppercase tracking-widest truncate">{user.email}</p>
 </div>
 <Link to="/dashboard" className="block px-6 py-4 text-xs font-black text-text_secondary hover:bg-slate-50 hover:text-primary transition-all uppercase tracking-widest">
 Dashboard
 </Link>
 <button
 onClick={handleLogout}
 className="w-full text-left px-6 py-4 text-xs font-black text-red-500 hover:bg-red-50 flex items-center gap-2 transition-all uppercase tracking-widest"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
 Sign Out
 </button>
 </div>
 )}
 </div>
 ) : (
 <>
 <Link to="/login" className="text-sm font-semibold text-text_secondary hover:text-primary transition-colors">Log in</Link>
 <Link to="/register" className="btn-primary py-2 px-4 text-sm shadow-sm hover:shadow-md">Get Started</Link>
 </>
 )}
 </div>

 {/* Mobile Menu Button */}
 <div className="flex items-center md:hidden">
 <button
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="text-text_secondary hover:text-primary focus:outline-none p-2"
 >
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 {isMobileMenuOpen ? (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
 ) : (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
 )}
 </svg>
 </button>
 </div>
 </div>
 </div>

 {/* Mobile Menu Dropdown */}
 {isMobileMenuOpen && (
 <div className="md:hidden bg-white border-b border-slate-200 animate-in slide-in-from-top-4 duration-200 z-dropdown absolute w-full shadow-md">
 <div className="px-4 pt-2 pb-6 space-y-1">
 {navLinks.map((link) => (
 <Link
 key={link.path}
 to={link.path}
 className={`block px-4 py-4 rounded-xl text-base font-semibold transition-colors ${isActive(link.path) ? 'bg-blue-50 text-primary' : 'text-text_secondary hover:bg-slate-50 hover:text-primary'}`}
 >
 {link.name}
 </Link>
 ))}
 
 <div className="mt-6 pt-6 border-t border-slate-100 px-4">
 {user ? (
 <div>
 <div className="flex items-center gap-4 mb-6">
 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
 {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
 </div>
 <div>
 <div className="text-sm font-bold text-text_primary">{user.name}</div>
 <div className="text-xs text-text_secondary">{user.email}</div>
 </div>
 </div>
 <button
 onClick={handleLogout}
 className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-red-100 text-error hover:bg-red-50 font-bold transition-all"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
 Log out entirely
 </button>
 </div>
 ) : (
 <div className="flex flex-col gap-4">
 <Link to="/login" className="w-full btn-outline text-center py-4">Log in</Link>
 <Link to="/register" className="w-full btn-primary text-center py-4">Get Started</Link>
 </div>
 )}
 </div>
 </div>
 </div>
 )}
 </header>
 );
};

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleStartJourney = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
 <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
 {/* Refined Gradient Blobs */}
 <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 "></div>
 <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/5 "></div>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-slate-50/50 -z-10"></div>

 <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 relative z-10 w-full pt-8 pb-8">
 <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
 
 {/* Left: Text Content */}
 <div className="flex-[1.2] text-center lg:text-left focus:outline-none">
 <div className="inline-flex items-center gap-4 px-6 py-4 mb-8 text-[10px] font-black tracking-[0.2em] text-primary uppercase bg-blue-50/50 rounded-full border border-blue-100/30 shadow-sm">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
 </span>
 Premium Rental System
 </div>
 
 <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black text-text_primary mb-8 tracking-tighter leading-[1] transition-all">
 Unlock the <br className="hidden lg:block" />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Perfect Drive.</span>
 </h1>
 
 <p className="text-lg md:text-xl text-text_secondary mb-8 max-w-xl mx-auto lg:mx-2 font-medium leading-relaxed opacity-80">
 Experience the future of mobility with our curated fleet of premium vehicles. Simple, elegant, and always ready for your next journey.
 </p>
 
 <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-8">
              <button onClick={handleStartJourney} className="w-full sm:w-auto btn-primary py-6 px-8 text-base shadow-lg group flex items-center justify-center">
                {user ? 'Go to Dashboard' : 'Start Journey'}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </button>
 <Link to="/cars" className="w-full sm:w-auto btn-outline py-6 px-8 text-base flex items-center justify-center">
 Explore Fleet
 </Link>
 </div>

 {/* Trust Badges */}
 <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-100 w-full sm:w-auto">
 <div className="flex flex-col items-center lg:items-start text-[10px] font-black text-text_secondary tracking-[0.2em] uppercase">
 <span className="text-3xl text-text_primary font-black tracking-tighter normal-case mb-2">1.2k+</span>
 Pristine Fleet
 </div>
 <div className="flex flex-col items-center lg:items-start text-[10px] font-black text-text_secondary tracking-[0.2em] uppercase">
 <span className="text-3xl text-text_primary font-black tracking-tighter normal-case mb-2">15k+</span>
 Happy Pilots
 </div>
 <div className="flex flex-col items-center lg:items-start text-[10px] font-black text-text_secondary tracking-[0.2em] uppercase">
 <span className="text-3xl text-text_primary font-black tracking-tighter normal-case mb-2">4.9/5</span>
 Top Service
 </div>
 </div>
 </div>

 {/* Right: Image Hero */}
 <div className="flex-1 w-full relative flex items-center justify-center group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl blur-3xl -z-10 "></div>
 <img 
 src="/hero-car.png" 
 alt="Luxury Car" 
 className="w-full max-w-4xl xl:max-w-7xl lg:max-w-none lg:scale-[1.65] object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.1)] relative z-10 hover:scale-110 lg:hover:scale-[1.75] transition-all duration-300 ease-out"
 loading="lazy"
 />
 </div>
 </div>
 </div>
 </div>
  );
};

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-text_primary font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 w-full relative z-base">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const AuthLayout = ({ children }) => (
 <div className="min-h-screen grid lg:grid-cols-2 bg-white selection:bg-primary/10 font-sans">
 {/* Left Column: Branding/Illustration */}
 <div className="hidden lg:flex flex-col justify-between p-8 bg-white relative overflow-hidden border-r border-slate-50">
 {/* Soft Background Gradient */}
 <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-secondary/[0.02] z-0" />
 
 {/* Blurred Shapes */}
 <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full " />
 <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full " />
 
 <div className="relative z-10">
 <Link to="/" className="text-2xl font-black text-text_primary tracking-tighter hover:opacity-70 transition-opacity flex items-center gap-4">
 <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ">C</div>
 CarRental<span className="text-primary font-bold">Pro</span>
 </Link>
 </div>
 
 <div className="relative z-10">
 <h2 className="text-5xl font-black text-text_primary leading-[1.1] mb-6 tracking-tight">
 Modernizing <span className="text-primary">mobility</span> for everyone.
 </h2>
 <p className="text-lg text-text_secondary font-medium leading-relaxed max-w-sm opacity-60">
 Join 10k+ users managing their fleet and travel with the most advanced rental infrastructure.
 </p>
 </div>
 
 <div className="relative z-10 flex gap-6 text-[10px] font-bold text-text_secondary uppercase tracking-[0.2em] opacity-40">
 <span>&copy; 2026 CarRental Pro</span>
 <span>Enterprise Security</span>
 </div>
 </div>
 
 {/* Right Column: Form Panel */}
 <div className="flex flex-col justify-center items-center p-8 sm:p-8 lg:p-8 relative bg-white min-h-screen overflow-y-auto">
 <div className="w-full max-w-[420px] mx-auto">
 <div className="lg:hidden mb-8 text-center">
 <Link to="/" className="text-2xl font-black text-text_primary tracking-tighter">
 CarRental<span className="text-primary font-bold">Pro</span>
 </Link>
 </div>
 {children}
 </div>
 </div>
 </div>
);

import { motion, AnimatePresence } from 'framer-motion';

const PageWrapper = ({ children }) => (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3, ease: 'easeOut' }}
 className="w-full h-full"
 >
 {children}
 </motion.div>
);

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireVerification && !user.is_verified) {
    return <Navigate to="/verify-identity" replace />;
  }

  return children;
};

const AppWrapper = () => {
 const location = useLocation();
 const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/complete-profile';

 return isAuthPage ? (
 <AuthLayout>
 <AnimatePresence mode="wait">
 <Routes location={location} key={location.pathname}>
 <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
 <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
 <Route path="/complete-profile" element={<PageWrapper><CompleteProfile /></PageWrapper>} />
 </Routes>
 </AnimatePresence>
 </AuthLayout>
 ) : (
 <MainLayout>
 <AnimatePresence mode="wait">
 <Routes location={location} key={location.pathname}>
 <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
 <Route path="/cars" element={<PageWrapper><AvailableCars /></PageWrapper>} />
 <Route path="/verify-identity" element={<ProtectedRoute requireVerification={false}><PageWrapper><VerifyIdentity /></PageWrapper></ProtectedRoute>} />
 <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
 </Routes>
 </AnimatePresence>
 </MainLayout>
 );
};

function App() {
 return (
 <Router>
 <Toaster 
 position="bottom-right" 
 toastOptions={{ 
 duration: 4000,
 className: "glass-modal !bg-white/90 ! !text-text_primary !border-white/20 !shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] !rounded-2xl !font-bold !px-6 !py-4 !text-xs !tracking-tight !z-[9999]",
 success: { 
 iconTheme: { primary: '#3B82F6', secondary: '#fff' },
 className: "!border-b-4 !border-b-primary"
 },
 error: { 
 iconTheme: { primary: '#EF4444', secondary: '#fff' },
 className: "!border-b-4 !border-b-red-500"
 }
 }} 
 />
 <AppWrapper />
 </Router>
 );
}

export default App;
