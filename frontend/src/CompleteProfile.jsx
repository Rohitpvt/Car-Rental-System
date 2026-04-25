import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleAuth } from './api';
import toast from 'react-hot-toast';

const CompleteProfile = () => {
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [tempUser, setTempUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedTempUser = localStorage.getItem('tempGoogleUser');
        if (!savedTempUser) {
            navigate('/login');
            return;
        }
        setTempUser(JSON.parse(savedTempUser));
    }, [navigate]);

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        try {
            const data = await googleAuth({
                ...tempUser,
                role: role
            });

            if (data.success) {
                localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
                localStorage.removeItem('tempGoogleUser');
                toast.success('Account created successfully!');
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Something went wrong.');
            }
        } catch (err) {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!tempUser) return null;

    return (
        <div className="animate-fade-in p-8 max-w-md mx-auto min-h-screen flex flex-col justify-center">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-text_primary tracking-tight mb-2">Almost There!</h2>
                <p className="text-sm text-text_secondary font-medium opacity-70">Please choose your account type to continue.</p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-8">
                <img 
                    src={tempUser.profile_image || 'https://via.placeholder.com/40'} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
                <div>
                    <p className="text-sm font-bold text-text_primary">{tempUser.name}</p>
                    <p className="text-xs text-text_secondary">{tempUser.email}</p>
                </div>
            </div>

            <form onSubmit={handleCompleteProfile} className="space-y-8">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block text-center">I want to</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            type="button"
                            onClick={() => setRole('customer')}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 group ${role === 'customer' ? 'border-primary bg-primary/[0.03] ring-1 ring-primary' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                        >
                            <span className="text-3xl mb-3">👤</span>
                            <span className={`font-black text-sm uppercase tracking-wider ${role === 'customer' ? 'text-primary' : 'text-text_primary'}`}>Customer</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('agency')}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 group ${role === 'agency' ? 'border-primary bg-primary/[0.03] ring-1 ring-primary' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                        >
                            <span className="text-3xl mb-3">🏢</span>
                            <span className={`font-black text-sm uppercase tracking-wider ${role === 'agency' ? 'text-primary' : 'text-text_primary'}`}>Agency</span>
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-xl"
                >
                    {loading ? 'Finalizing...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default CompleteProfile;
