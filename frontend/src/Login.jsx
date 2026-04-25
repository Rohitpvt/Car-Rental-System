import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, googleAuth } from './api';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
      const data = await loginUser({ email, password });
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        if (data.type === 'USER_NOT_FOUND') {
          toast.error('Account not found. Please sign up first.');
          setTimeout(() => navigate('/register'), 1200);
        } else if (data.type === 'INVALID_PASSWORD') {
          toast.error('Incorrect password');
          setPassword('');
        } else {
          toast.error(data.message || 'Something went wrong. Please try again.');
        }
      }
    } catch (err) {
      toast.error('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            profile_image: user.photoURL
        };

        const data = await googleAuth(userData);

        if (data.success) {
            localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
            toast.success('Login successful!');
            navigate('/dashboard');
        } else if (data.type === 'ROLE_REQUIRED') {
            localStorage.setItem('tempGoogleUser', JSON.stringify(userData));
            toast('Please select an account type to continue', { icon: '👋' });
            navigate('/complete-profile');
        } else {
            toast.error(data.message || 'Google Auth failed on server.');
        }

    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            toast.error('Google Sign-in failed. Please try again.');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-text_primary tracking-tight mb-2">Welcome Back</h2>
        <p className="text-sm text-text_secondary font-medium opacity-70">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="floating-label-group">
          <input 
            id="email" 
            type="email" 
            required 
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="floating-label-input peer" 
          />
          <label className="floating-label" htmlFor="email">Email Address</label>
        </div>

        <div className="floating-label-group relative">
          <input 
            id="password" 
            type={showPassword ? 'text' : 'password'} 
            required 
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="floating-label-input pr-12 peer" 
          />
          <label className="floating-label" htmlFor="password">Password</label>
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors focus:outline-none"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>

        <div className="flex justify-end pt-1">
          <Link to="#" className="text-xs font-bold text-primary hover:opacity-80 transition-opacity uppercase tracking-widest">
            Forgot Password?
          </Link>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/10"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className="bg-white px-4 text-slate-400 font-bold">Or continue with</span></div>
        </div>

        <button 
          type="button"
          disabled={loading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl bg-white text-sm font-bold text-text_primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </form>

      <div className="mt-12 text-center text-sm">
        <p className="text-slate-400 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
