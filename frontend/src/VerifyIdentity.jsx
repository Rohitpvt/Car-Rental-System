import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyIdentity } from './api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyIdentity = () => {
    const [method, setMethod] = useState('manual');
    const [idNumber, setIdNumber] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(2); // Step 2 is Verify
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.is_verified) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
            } else {
                setPreview(null);
            }
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!/^[0-9]{12}$/.test(idNumber)) {
            toast.error("ID Number must be exactly 12 digits.");
            return;
        }
        submitVerification({ method: 'manual', id_number: idNumber });
    };

    const handleDocumentSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please upload an ID proof.");
            return;
        }
        const formData = new FormData();
        formData.append('method', 'document');
        formData.append('id_proof', file);
        submitVerification(formData);
    };

    const handleDemoLocker = () => {
        setLoading(true);
        toast.loading("Fetching from Digital Locker...", { id: 'locker' });
        
        setTimeout(() => {
            submitVerification({ method: 'demo' });
            toast.dismiss('locker');
        }, 2000);
    };

    const submitVerification = async (payload) => {
        setLoading(true);
        try {
            const data = await verifyIdentity(payload);
            if (data.success) {
                toast.success("Identity verified successfully!");
                localStorage.setItem('user', JSON.stringify({ ...user, ...data.user }));
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                toast.error(data.message || "Verification failed.");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
                        {[
                            { s: 1, n: 'Register' },
                            { s: 2, n: 'Verify' },
                            { s: 3, n: 'Dashboard' }
                        ].map((item) => (
                            <div key={item.s} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= item.s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                                    {step > item.s ? '✓' : item.s}
                                </div>
                                <span className={`mt-2 text-[10px] font-black uppercase tracking-widest ${step >= item.s ? 'text-primary' : 'text-slate-400'}`}>
                                    {item.n}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-text_primary tracking-tight mb-3">Identity Verification</h2>
                            <p className="text-sm text-text_secondary font-medium opacity-70">Complete this one-time step to unlock premium features.</p>
                        </div>

                        {/* Method Selector */}
                        <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10">
                            {['manual', 'document', 'demo'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMethod(m)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${method === m ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {m === 'demo' ? 'Digital Locker' : m}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {method === 'manual' && (
                                <motion.form
                                    key="manual"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleManualSubmit}
                                    className="space-y-6"
                                >
                                    <div className="floating-label-group">
                                        <input
                                            type="text"
                                            value={idNumber}
                                            onChange={(e) => setIdNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                                            placeholder=" "
                                            className="floating-label-input peer"
                                            required
                                        />
                                        <label className="floating-label">12-Digit Aadhaar Number</label>
                                    </div>
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4">
                                        <span className="text-xl">🔒</span>
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            Your ID will be masked (XXXX-XXXX-1234) and stored securely. We do not store your full ID number.
                                        </p>
                                    </div>
                                    <button disabled={loading} type="submit" className="btn-primary w-full py-5 shadow-xl shadow-primary/20">
                                        {loading ? 'Verifying...' : 'Verify Now'}
                                    </button>
                                </motion.form>
                            )}

                            {method === 'document' && (
                                <motion.form
                                    key="document"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleDocumentSubmit}
                                    className="space-y-6"
                                >
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="id_proof"
                                            accept="image/*,.pdf"
                                        />
                                        <label
                                            htmlFor="id_proof"
                                            className="block w-full border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/[0.02] transition-all group-hover:scale-[0.99]"
                                        >
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-xl shadow-md" />
                                            ) : file ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-4xl mb-4">📄</span>
                                                    <p className="text-sm font-bold text-text_primary">{file.name}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📂</div>
                                                    <p className="text-sm font-bold text-text_primary mb-1">Click to upload ID proof</p>
                                                    <p className="text-xs text-text_secondary font-medium uppercase tracking-widest opacity-50">JPG, PNG or PDF (Max 5MB)</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    <button disabled={loading} type="submit" className="btn-primary w-full py-5 shadow-xl shadow-primary/20">
                                        {loading ? 'Processing...' : 'Upload & Verify'}
                                    </button>
                                </motion.form>
                            )}

                            {method === 'demo' && (
                                <motion.div
                                    key="demo"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8 text-center py-4"
                                >
                                    <div className="relative inline-block">
                                        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-2 animate-bounce">📱</div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs border-4 border-white shadow-lg shadow-green-200">✓</div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text_primary mb-2">Simulated Digital Locker</h3>
                                        <p className="text-sm text-text_secondary font-medium max-w-xs mx-auto opacity-70">
                                            Instant verification using our demo DigiLocker integration. No document upload required.
                                        </p>
                                    </div>
                                    <button 
                                        disabled={loading} 
                                        onClick={handleDemoLocker}
                                        className="btn-primary w-full py-5 bg-gradient-to-r from-primary to-indigo-600 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                    >
                                        <span className="text-lg">⚡</span>
                                        {loading ? 'Fetching...' : 'Fetch from Digital Locker (Demo)'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Your privacy is our priority &copy; 2026 CarRental Pro Secure KYC
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyIdentity;
