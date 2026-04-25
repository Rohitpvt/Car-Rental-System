import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { 
      name: 'Instagram', 
      url: '#',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2Z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5271C13.0901 15.9028 12.2384 16.0314 11.4078 15.8947C10.5771 15.7581 9.80529 15.3629 9.20403 14.7667C8.60277 14.1704 8.19694 13.3916 8.04123 12.5597C7.88552 11.7278 7.98666 10.8711 8.33129 10.1105C8.6759 9.34994 9.2471 8.72145 9.96733 8.31174C10.6876 7.90204 11.5217 7.7299 12.35 7.82C13.2057 7.91054 14.0205 8.27137 14.6738 8.84752C15.327 9.42368 15.7877 10.1856 16 11.02V11.37Z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 6.5H17.51"></path></svg>
    },
    { 
      name: 'LinkedIn', 
      url: 'https://www.linkedin.com/in/rohit-ghosh-06112002rg',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"></path><rect strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x="2" y="9" width="4" height="12"></rect><circle strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" cx="4" cy="4" r="2"></circle></svg>
    },
    { 
      name: 'Twitter', 
      url: '#',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    }
  ];

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Radial Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Column 1: Brand */}
          <div className="space-y-8">
            <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">C</div>
              CarRental<span className="text-primary">Pro</span>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              Drive your journey with ease. Experience the next generation of premium vehicle mobility with our state-of-the-art rental infrastructure.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary hover:border-primary transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8">The Fleet</h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Available Cars', path: '/cars' },
                { name: 'Your Dashboard', path: '/dashboard' },
                { name: 'Marketplace', path: '/cars' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm font-bold text-slate-400 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Personal Details */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8">Direct Channel</h4>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Founder Office</p>
                <p className="text-sm font-bold text-white tracking-tight">Rohit Ghosh</p>
              </div>
              <div className="space-y-3">
                <a href="mailto:rghosh1312@gmail.com" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">rghosh1312@gmail.com</span>
                </a>
                <a href="tel:9667145112" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">+91 96671 45112</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Scroll to top / Quick Contact */}
          <div className="flex flex-col items-start lg:items-end">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 lg:text-right">Navigation</h4>
            <button 
              onClick={scrollToTop}
              className="group flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">Scroll to Top</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
              </div>
            </button>
            <div className="mt-8 lg:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Live Status</p>
              <div className="flex items-center lg:justify-end gap-2 text-sm font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                System Operational
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            &copy; 2026 CarRental Pro &bull; All Rights Reserved
          </p>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">Server Status</a>
            <a href="#" className="hover:text-primary transition-colors">Enterprise</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
