import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { addCar } from './api';

const AddCar = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    fuel_type: 'Petrol',
    vehicle_number: '',
    registration_year: new Date().getFullYear(),
    seating_capacity: '',
    parking_location: '',
    rent_per_day: ''
  });

  const [documents, setDocuments] = useState({
    rc_file: null,
    insurance_file: null,
    puc_file: null
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (files[0].type !== 'application/pdf') {
        toast.error('Only PDF documents are allowed.');
        return;
      }
      setDocuments({ ...documents, [name]: files[0] });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per vehicle.');
      return;
    }

    const validImages = [];
    const previews = [];

    files.forEach(file => {
      const isImg = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      if (isImg) {
        if (file.size <= 5 * 1024 * 1024) {
          validImages.push(file);
          previews.push(URL.createObjectURL(file));
        } else {
          toast.error(`${file.name} exceeds 5MB limit.`);
        }
      } else {
        toast.error(`${file.name} is not a valid image format (JPG/PNG).`);
      }
    });

    setImages(prev => [...prev, ...validImages]);
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const currentYear = new Date().getFullYear();
    if (currentYear - formData.registration_year >= 7) {
      toast.error('Vehicle cannot be older than 7 years.');
      return false;
    }
    if (formData.rent_per_day <= 0) {
      toast.error('Rent must be a positive number.');
      return false;
    }
    if (!documents.rc_file || !documents.insurance_file || !documents.puc_file) {
      toast.error('All legal documents (RC, Insurance, PUC) are required.');
      return false;
    }
    if (images.length < 2) {
      toast.error('Please upload at least 2 images of the vehicle.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const data = new FormData();
    
    // Append Text
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Append Docs
    data.append('rc_file', documents.rc_file);
    data.append('insurance_file', documents.insurance_file);
    data.append('puc_file', documents.puc_file);
    
    // Append Images
    images.forEach(img => {
      data.append('images[]', img);
    });

    try {
      const response = await addCar(data);
      if (response && response.success) {
        toast.success(response.message || 'Vehicle onboarded successfully.');
        onSuccess();
      } else {
        toast.error(response?.message || 'Failed to onboard vehicle.');
      }
    } catch (err) {
      toast.error('Network error during upload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ title, num }) => (
    <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
       <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">{num}</span>
       <h3 className="text-xl font-black text-text_primary">{title}</h3>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-100">
      <div className="flex justify-between items-center bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
         <div>
            <h2 className="text-2xl font-black text-text_primary">Register Asset</h2>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Fleet Integration Wizard</p>
         </div>
         <button type="button" onClick={onCancel} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-colors border border-slate-200">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
      </div>

      <div className="space-y-12">
        {/* Section 1: Details */}
        <section>
          <SectionHeader title="Vehicle Specification" num="1" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Make</label>
               <input required name="make" value={formData.make} onChange={handleTextChange} placeholder="e.g. Toyota" className="form-input" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Model</label>
               <input required name="model" value={formData.model} onChange={handleTextChange} placeholder="e.g. Camry XLE" className="form-input" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Fuel Type</label>
               <select required name="fuel_type" value={formData.fuel_type} onChange={handleTextChange} className="form-input">
                 <option value="Petrol">Petrol</option>
                 <option value="Diesel">Diesel</option>
                 <option value="Electric">Electric</option>
                 <option value="Hybrid">Hybrid</option>
               </select>
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Registry Plate</label>
               <input required name="vehicle_number" value={formData.vehicle_number} onChange={handleTextChange} placeholder="XX-00-XX-0000" className="form-input uppercase" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Reg. Year</label>
               <input required type="number" name="registration_year" value={formData.registration_year} onChange={handleTextChange} placeholder="YYYY" className="form-input" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Capacity</label>
               <input required type="number" min="1" name="seating_capacity" value={formData.seating_capacity} onChange={handleTextChange} placeholder="Seats" className="form-input" />
            </div>
          </div>
        </section>

        {/* Section 2: Ops */}
        <section>
          <SectionHeader title="Operational Parameters" num="2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Initial Parking Zone</label>
               <input required name="parking_location" value={formData.parking_location} onChange={handleTextChange} placeholder="Depot or GPS coords" className="form-input" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Base Value (₹/Day)</label>
               <input required type="number" min="1" name="rent_per_day" value={formData.rent_per_day} onChange={handleTextChange} placeholder="1000" className="form-input" />
            </div>
          </div>
        </section>

        {/* Section 3: Legal */}
        <section>
          <SectionHeader title="Legal Identity (PDF Only)" num="3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">RC Document</label>
               <input required type="file" name="rc_file" accept=".pdf" onChange={handleDocChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
               {documents.rc_file && <span className="text-[10px] text-emerald-600 font-bold break-words">{documents.rc_file.name}</span>}
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">Insurance Policy</label>
               <input required type="file" name="insurance_file" accept=".pdf" onChange={handleDocChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
               {documents.insurance_file && <span className="text-[10px] text-emerald-600 font-bold break-words">{documents.insurance_file.name}</span>}
            </div>
            <div className="flex flex-col gap-2">
               <label className="form-label mb-0">PUC Emissions</label>
               <input required type="file" name="puc_file" accept=".pdf" onChange={handleDocChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
               {documents.puc_file && <span className="text-[10px] text-emerald-600 font-bold break-words">{documents.puc_file.name}</span>}
            </div>
          </div>
        </section>

        {/* Section 4: Imagery */}
        <section>
          <div className="flex justify-between items-end mb-8">
             <div>
                <SectionHeader title="Asset Imagery" num="4" />
             </div>
             <div className="mb-4 text-right">
                <span className={`text-xs font-black uppercase tracking-[0.2em] ${images.length < 2 ? 'text-red-500' : 'text-slate-400'}`}>
                   {images.length}/5 Imagery Points
                </span>
                {images.length < 2 && <p className="text-[8px] font-black uppercase text-red-500/60 mt-1">Min. 2 Required</p>}
             </div>
          </div>

          <div className={`bg-slate-50 border border-dashed rounded-xl p-8 text-center transition-all relative ${images.length < 2 ? 'border-red-200' : 'border-slate-300 hover:border-primary/50'}`}>
             <input 
               type="file" 
               multiple 
               accept="image/jpeg, image/png, image/jpg" 
               onChange={handleImageChange} 
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               disabled={images.length >= 5}
             />
             <div className="flex flex-col items-center justify-center gap-2">
                <svg className={`w-8 h-8 ${images.length < 2 ? 'text-red-300' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-sm font-black text-slate-500 uppercase tracking-tighter">
                   {images.length >= 5 ? 'Imagery Capacity Full' : 'Authorize Vehicle Photos'}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest opacity-60">JPG, PNG up to 5MB node limit</p>
             </div>
          </div>
          
          {imagePreviews.length > 0 && (
            <div className="flex gap-4 mt-8 overflow-x-auto pb-4 no-scrollbar">
               {imagePreviews.map((src, i) => (
                 <div key={i} className="relative w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white shadow-xl rotate-1 hover:rotate-0 transition-transform">
                    <img src={src} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-lg active:scale-95 transition-transform">✕</button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                       <span className="text-[7px] font-black text-white uppercase tracking-widest">P-{i+1}</span>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </section>
      </div>

      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
         <button type="button" onClick={onCancel} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 tracking-[0.2em] transition-colors order-2 md:order-1">VOID INTEGRATION</button>
         <button 
           disabled={isSubmitting || images.length < 2} 
           type="submit" 
           className={`btn-primary flex items-center gap-3 px-10 py-5 rounded-2xl order-1 md:order-2 transition-all ${images.length < 2 ? 'opacity-40 cursor-not-allowed scale-95 grayscale' : 'shadow-xl active:scale-95'}`}
         >
            {isSubmitting && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
            <span className="text-[10px] font-black tracking-[0.2em]">{isSubmitting ? 'UPLOADING ASSET...' : 'VALIDATE & AUTHORIZE'}</span>
         </button>
      </div>
    </form>
  );
};

export default AddCar;
