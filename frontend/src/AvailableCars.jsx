import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars, bookCar, getCarBookings } from './api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components (DECOUPLED FROM MAIN RENDER FOR STABILITY) ---

const SkeletonCard = memo(() => (
  <div className="marketplace-card skeleton-shimmer border-none h-[420px]">
    <div className="aspect-[4/3] bg-slate-200/30" />
    <div className="p-8 space-y-6">
      <div className="h-7 bg-slate-200/40 w-3/4 rounded-xl" />
      <div className="h-4 bg-slate-200/40 w-1/2 rounded-xl" />
      <div className="flex gap-4 pt-2">
        <div className="h-10 bg-slate-200/40 flex-1 rounded-xl" />
        <div className="h-10 bg-slate-200/40 flex-1 rounded-xl" />
      </div>
      <div className="h-14 bg-slate-200/40 w-full rounded-2xl mt-6" />
    </div>
  </div>
));

const EmptyState = memo(({ onReset }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in bg-slate-50/50 border border-dashed border-slate-200 rounded-[40px] px-8 w-full">
    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center text-5xl mb-8 border border-slate-100 rotate-3">🔍</div>
    <h3 className="text-4xl font-black text-text_primary tracking-tighter mb-4">No Vehicles Found</h3>
    <p className="text-base text-text_secondary max-w-sm mx-auto mb-12 font-medium leading-relaxed opacity-60">
      We couldn't identify any matches for your current parameters. <br className="hidden md:block"/>
      <span className="text-primary font-bold">Suggestions:</span> Try increasing your price ceiling or expanding the registration year span.
    </p>
    <button onClick={onReset} className="btn-primary px-10 py-5 rounded-3xl flex items-center gap-4 group transition-all active:scale-95 shadow-xl">
      <span className="font-black uppercase tracking-widest text-[10px]">Clear All Nodes & Restart</span>
      <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    </button>
  </div>
));

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-6 last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text_secondary group-hover:text-primary transition-colors">{title}</span>
        <svg className={`w-4 h-4 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarContent = memo(({ 
  localSearch, setLocalSearch,
  localPriceMin, setLocalPriceMin,
  localPriceMax, setLocalPriceMax,
  localYearMin, setLocalYearMin,
  localYearMax, setLocalYearMax,
  filters, updateFilter 
}) => (
  <div className="space-y-4">
    <FilterSection title="Global Identity">
      <div className="relative group">
        <input 
          type="text" 
          placeholder="Model, Make, Plate..." 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-10 py-3 text-xs font-bold text-text_primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
        />
        {localSearch && <button onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">✕</button>}
      </div>
    </FilterSection>

    <FilterSection title="Fuel Modality">
      <div className="grid grid-cols-2 gap-2">
        {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => (
          <button 
            key={f}
            onClick={() => updateFilter('fuel_type', filters.fuel_type === f ? '' : f)}
            className={`text-[9px] font-black uppercase tracking-widest py-3 rounded-lg border transition-all ${filters.fuel_type === f ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-primary/30'}`}
          >
            {f}
          </button>
        ))}
      </div>
    </FilterSection>

    <FilterSection title="Capacity">
      <div className="flex gap-2">
        {['2', '4', '5', '7'].map(s => (
          <button 
            key={s}
            onClick={() => updateFilter('seating', filters.seating === s ? '' : s)}
            className={`flex-1 text-[9px] font-black py-3 rounded-lg border transition-all ${filters.seating === s ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-100 hover:border-primary'}`}
          >
            {s}
          </button>
        ))}
      </div>
    </FilterSection>

    <FilterSection title="Fiscal Range (₹)">
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder="Min" 
          value={localPriceMin} 
          onChange={e => setLocalPriceMin(e.target.value)} 
          className="w-1/2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
        />
        <input 
          type="number" 
          placeholder="Max" 
          value={localPriceMax} 
          onChange={e => setLocalPriceMax(e.target.value)} 
          className="w-1/2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
        />
      </div>
    </FilterSection>

    <FilterSection title="Year Span">
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder="From" 
          value={localYearMin} 
          onChange={e => setLocalYearMin(e.target.value)} 
          className="w-1/2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
        />
        <input 
          type="number" 
          placeholder="To" 
          value={localYearMax} 
          onChange={e => setLocalYearMax(e.target.value)} 
          className="w-1/2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
        />
      </div>
    </FilterSection>

    <FilterSection title="Advanced">
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between group cursor-pointer" 
          onClick={() => updateFilter('has_images', !filters.has_images)}
          role="switch"
          aria-checked={filters.has_images}
          aria-label="Filter by vehicles with images"
        >
          <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-text_primary transition-colors">Has Images</span>
          <div className={`w-9 h-5 rounded-full transition-all duration-300 relative ${filters.has_images ? 'bg-primary' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm ${filters.has_images ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>
        <div 
          className="flex items-center justify-between group cursor-pointer" 
          onClick={() => updateFilter('verified', !filters.verified)}
          role="switch"
          aria-checked={filters.verified}
          aria-label="Filter by verified vehicles only"
        >
          <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-text_primary transition-colors">Verified Only</span>
          <div className={`w-9 h-5 rounded-full transition-all duration-300 relative ${filters.verified ? 'bg-primary' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm ${filters.verified ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>
    </FilterSection>
  </div>
));

const ActiveChips = memo(({ filters, removeFilter, resetFilters }) => {
  const activeKeys = Object.entries(filters).filter(([k, v]) => v !== '' && v !== false && k !== 'sort_by');
  if (activeKeys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-8 items-center">
      <span className="text-[10px] font-black uppercase text-slate-400 mr-2">Active:</span>
      {activeKeys.map(([k, v]) => (
        <button 
          key={k} 
          onClick={() => removeFilter(k)}
          className="flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-primary/10 transition-colors"
        >
          <span className="opacity-60">{k.replace('_', ' ')}:</span> {String(v)}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      ))}
      <button onClick={resetFilters} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase ml-2 tracking-widest">Clear All</button>
    </div>
  );
});

// --- Main Application Component ---

const AvailableCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingCar, setBookingCar] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [bookingData, setBookingData] = useState({ days: 1, start_date: new Date() });

  // Unified Filter State
  const [filters, setFilters] = useState({
    search: '',
    fuel_type: '',
    make: '',
    price_min: '',
    price_max: '',
    year_min: '',
    year_max: '',
    seating: '',
    has_images: false,
    verified: false,
    sort_by: ''
  });

  // Local Input States (to prevent focus loss during debounced update)
  const [localSearch, setLocalSearch] = useState('');
  const [localPriceMin, setLocalPriceMin] = useState('');
  const [localPriceMax, setLocalPriceMax] = useState('');
  const [localYearMin, setLocalYearMin] = useState('');
  const [localYearMax, setLocalYearMax] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) setUser(JSON.parse(loggedInUser));
  }, []);

  // Fetch cars from backend
  const fetchAvailableCars = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const data = await getCars(currentFilters);
      if (data?.success) {
        setCars(data.records);
        setTotalCount(data.total_count);
      }
    } catch (err) {
      toast.error("Failed to sync fleet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced input sync
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ 
        ...prev, 
        search: localSearch,
        price_min: localPriceMin,
        price_max: localPriceMax,
        year_min: localYearMin,
        year_max: localYearMax
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, localPriceMin, localPriceMax, localYearMin, localYearMax]);

  // Trigger fetch when filters change
  useEffect(() => {
    fetchAvailableCars(filters);
  }, [filters, fetchAvailableCars]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '', fuel_type: '', make: '', price_min: '', price_max: '',
      year_min: '', year_max: '', seating: '', has_images: false, verified: false, sort_by: ''
    });
    setLocalSearch('');
    setLocalPriceMin('');
    setLocalPriceMax('');
    setLocalYearMin('');
    setLocalYearMax('');
  }, []);

  const removeFilter = useCallback((key) => {
    if (key === 'search') setLocalSearch('');
    if (key === 'price_min') setLocalPriceMin('');
    if (key === 'price_max') setLocalPriceMax('');
    if (key === 'year_min') setLocalYearMin('');
    if (key === 'year_max') setLocalYearMax('');
    setFilters(prev => ({ ...prev, [key]: typeof prev[key] === 'boolean' ? false : '' }));
  }, []);

  const handleBookingClick = async (car) => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'customer') { toast.error("Agencies cannot book."); return; }
    
    setBookingCar(car);
    const data = await getCarBookings(car.id);
    if (data?.success) {
      const disabledDates = [];
      data.bookings.forEach(b => {
        const start = new Date(b.start_date);
        start.setHours(0, 0, 0, 0);
        for (let i = 0; i < b.days; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          disabledDates.push(d);
        }
      });
      setBookedDates(disabledDates);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setProcessing(true);
    const requestedStart = new Date(bookingData.start_date);
    requestedStart.setHours(0, 0, 0, 0);
    const startString = requestedStart.toISOString().split('T')[0];

    const data = await bookCar({
      car_id: bookingCar.id,
      start_date: startString,
      days: parseInt(bookingData.days)
    });
    setProcessing(false);
    
    if (data?.success) {
      toast.success("Reservation authorized!");
      setBookingCar(null);
      fetchAvailableCars(filters);
    } else {
      toast.error(data?.message || "Booking failed.");
    }
  };

  const sidebarProps = {
    localSearch, setLocalSearch,
    localPriceMin, setLocalPriceMin,
    localPriceMax, setLocalPriceMax,
    localYearMin, setLocalYearMin,
    localYearMax, setLocalYearMax,
    filters, updateFilter
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-8 pb-12">
      {/* Page Header */}
      <div className="pt-12 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-4 px-4 py-2 text-[10px] font-black tracking-[0.2em] text-primary uppercase bg-blue-50/50 rounded-full border border-blue-100/30">
            Intelligent Search Engine
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-text_primary tracking-tighter leading-none">
            {loading ? 'Scanning...' : 'Master Fleet'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-text_secondary font-bold opacity-60">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            {totalCount} {totalCount === 1 ? 'Vehicle' : 'Vehicles'} Identified and Verified
          </div>
        </div>
        
        <div className="flex items-center gap-4">
  
          <select 
            value={filters.sort_by}
            onChange={(e) => updateFilter('sort_by', e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-[10px] font-black text-text_primary outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer transition-all hover:bg-white uppercase tracking-widest shadow-sm"
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          <button 
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden btn-primary p-4 rounded-2xl shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </div>

      <div className="flex gap-12 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[100px] h-fit bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
           <SidebarContent {...sidebarProps} />
           <button onClick={resetFilters} className="w-full mt-8 py-4 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl">Clear All Nodes</button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-h-[600px]">
          <ActiveChips filters={filters} removeFilter={removeFilter} resetFilters={resetFilters} />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : cars.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <motion.div 
              initial="hidden" animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {cars.map(car => (
                <motion.div 
                  key={car.id} 
                  variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                  whileHover={{ y: -8 }}
                  className=" marketplace-card group rounded-3xl overflow-hidden border border-slate-100 bg-white"
                >
                  <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                     {car.images && car.images.length > 0 ? (
                        <img 
                          src={car.images[0].startsWith('http') ? car.images[0] : `http://localhost:8000/uploads/images/${car.images[0]}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={car.model} 
                        />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-7xl grayscale opacity-20">🚗</div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${car.is_available ? 'bg-white text-primary border-blue-100' : 'bg-slate-900 text-white border-slate-800'}`}>
                        {car.is_available ? 'Available' : 'Reserved'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                       <div>
                         <h3 className="text-lg font-black text-text_primary leading-tight tracking-tight mb-1">{car.make} {car.model}</h3>
                         <p className="text-[9px] font-black uppercase tracking-widest text-text_secondary opacity-50">{car.agency_name}</p>
                       </div>
                       <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-50 text-[9px] font-black">4.9 ★</div>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-6">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                          <span className="text-[9px] font-bold text-text_primary">{car.fuel_type || 'EV'}</span>
                       </div>
                       <div className="w-px h-6 bg-slate-100" />
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Model</span>
                          <span className="text-[9px] font-bold text-text_primary">{car.registration_year}</span>
                       </div>
                       <div className="w-px h-6 bg-slate-100" />
                       <div className="flex flex-col gap-0.5 truncate flex-1">
                          <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Zone</span>
                          <span className="text-[9px] font-bold text-text_primary truncate">{car.parking_location}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-2xl font-black text-text_primary tracking-tighter">₹{car.rent_per_day}</p>
                         <p className="text-[8px] font-black text-text_secondary uppercase tracking-widest opacity-40">Day Rate</p>
                       </div>
                       <button onClick={() => handleBookingClick(car)} className="btn-primary rounded-xl px-6 py-4 text-[9px] font-black uppercase tracking-widest active:scale-95 shadow-md">Book</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-2xl p-6 overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-text_primary tracking-tighter uppercase tracking-widest">Filters</h2>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">✕</button>
              </div>
              <SidebarContent {...sidebarProps} />
              <button onClick={() => setIsFilterDrawerOpen(false)} className="w-full mt-10 btn-primary py-5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Apply</button>
              <button onClick={() => { resetFilters(); setIsFilterDrawerOpen(false); }} className="w-full mt-4 py-3 text-[9px] font-black text-red-500 uppercase tracking-widest">Clear All</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingCar && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
             >
               <button onClick={() => setBookingCar(null)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">✕</button>
               
               <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
                  <div className="mb-10">
                     <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-2">Step 01 / Config</p>
                     <h2 className="text-3xl font-black text-text_primary tracking-tighter leading-[1.1]">Reservation <br/> Architecture</h2>
                  </div>
                  
                  <div className="space-y-10">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Commencement</label>
                        <DatePicker 
                          selected={bookingData.start_date}
                          onChange={(date) => setBookingData({...bookingData, start_date: date})}
                          excludeDates={bookedDates}
                          minDate={new Date()}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-5 text-xs font-black text-text_primary outline-none focus:ring-2 focus:ring-primary/10"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Duration (Days)</label>
                        <input 
                          type="number" min="1" value={bookingData.days} 
                          onChange={(e) => setBookingData({...bookingData, days: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-5 text-xs font-black text-text_primary outline-none focus:ring-2 focus:ring-primary/10"
                        />
                     </div>
                  </div>
               </div>

               <div className="w-full md:w-[350px] bg-slate-50 p-10 flex flex-col border-l border-slate-100">
                  <div className="mb-10">
                     <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-2">Step 02 / Invoice</p>
                     <h3 className="text-xl font-black text-text_primary tracking-tighter">Valuation</h3>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                     <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-3xl">🚗</div>
                        <div>
                           <p className="text-sm font-black text-text_primary leading-tight truncate w-32">{bookingCar.make} {bookingCar.model}</p>
                           <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">{bookingCar.vehicle_number}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-3 py-6 border-y border-dashed border-slate-200">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400"><span>Daily Valuation</span><span>₹{bookingCar.rent_per_day}</span></div>
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400"><span>Cycle Count</span><span>{bookingData.days} Days</span></div>
                     </div>
                     
                     <div className="flex flex-col items-end gap-1 pt-2">
                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">Final Authorized</p>
                        <p className="text-5xl font-black text-text_primary tracking-tighter">₹{bookingCar.rent_per_day * (bookingData.days || 1)}</p>
                     </div>
                  </div>

                  <button 
                    onClick={handleConfirmBooking}
                    disabled={processing}
                    className="w-full btn-primary py-5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-10 flex items-center justify-center gap-3"
                  >
                    {processing ? 'Processing...' : 'Finalize Reservation'}
                  </button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvailableCars;
