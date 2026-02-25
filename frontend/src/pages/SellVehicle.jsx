import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const STEPS = [
  { id: 1, title: 'Vehicle Details', icon: 'fa-car' },
  { id: 2, title: 'Upload Photos', icon: 'fa-camera' },
  { id: 3, title: 'Pricing', icon: 'fa-indian-rupee-sign' },
  { id: 4, title: 'Review & Submit', icon: 'fa-check' },
];

const CATEGORIES = [
  { value: '2W', label: '2 Wheeler', icon: 'fa-motorcycle' },
  { value: '3W', label: '3 Wheeler', icon: 'fa-truck-pickup' },
  { value: '4W', label: '4 Wheeler', icon: 'fa-car' },
  { value: 'CV', label: 'Commercial', icon: 'fa-truck' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function SellVehicle() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      category: '4W',
      state: 'Tamil Nadu',
    }
  });

  const watchedValues = watch();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (data) => {
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Vehicle submitted successfully! Our team will review and contact you shortly.');
      setIsSubmitting(false);
      navigate('/');
    }, 2000);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-3xl text-gold-500"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1628] mb-3">Login Required</h1>
          <p className="text-gray-500 mb-8">Please sign in to your account to list your vehicle for auction.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-all"
          >
            Login to Continue <i className="fas fa-arrow-right text-sm"></i>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Sell Your Vehicle — AutoRevive</title>
        <meta name="description" content="List your vehicle for auction on AutoRevive. Reach thousands of verified buyers across India." />
      </Helmet>

      {/* ═══════ HEADER ═══════ */}
      <section className="bg-[#0B1628] text-white py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <i className="fas fa-arrow-left text-xs"></i>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Sell Your Vehicle</h1>
          <p className="text-gray-400 max-w-lg">List your vehicle on India's trusted auction platform. Reach thousands of verified buyers.</p>
        </div>
      </section>

      {/* ═══════ PROGRESS STEPS ═══════ */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 overflow-x-auto">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step > s.id ? 'bg-green-500 text-white' :
                    step === s.id ? 'bg-gold-500 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.id ? <i className="fas fa-check"></i> : <i className={`fas ${s.icon}`}></i>}
                  </div>
                  <span className={`text-sm font-medium whitespace-nowrap hidden sm:block ${
                    step === s.id ? 'text-[#0B1628]' : 'text-gray-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-12 lg:w-24 h-0.5 mx-4 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ FORM CONTENT ═══════ */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* ─── STEP 1: Vehicle Details ─── */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-[#0B1628] mb-6">Vehicle Details</h2>
              
              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Vehicle Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat.value}
                      className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        watchedValues.category === cat.value
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={cat.value}
                        {...register('category', { required: true })}
                        className="sr-only"
                      />
                      <i className={`fas ${cat.icon} text-2xl mb-2 ${
                        watchedValues.category === cat.value ? 'text-gold-500' : 'text-gray-400'
                      }`}></i>
                      <span className={`text-sm font-medium ${
                        watchedValues.category === cat.value ? 'text-[#0B1628]' : 'text-gray-600'
                      }`}>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vehicle Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name / Model *</label>
                <input
                  type="text"
                  placeholder="e.g., Maruti Swift VXi 2020"
                  className={`w-full px-4 py-3.5 border rounded-lg outline-none transition-all ${
                    errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gold-500'
                  }`}
                  {...register('name', { required: 'Vehicle name is required' })}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input
                    type="text"
                    placeholder="e.g., TN 09 AB 1234"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:border-gold-500 outline-none transition-all"
                    {...register('registration')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year of Manufacture</label>
                  <select
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:border-gold-500 outline-none transition-all"
                    {...register('year')}
                  >
                    {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:border-gold-500 outline-none transition-all"
                    {...register('state', { required: true })}
                  >
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City / Location *</label>
                  <input
                    type="text"
                    placeholder="e.g., Chennai"
                    className={`w-full px-4 py-3.5 border rounded-lg outline-none transition-all ${
                      errors.location ? 'border-red-300' : 'border-gray-200 focus:border-gold-500'
                    }`}
                    {...register('location', { required: 'Location is required' })}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your vehicle condition, features, service history, etc."
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:border-gold-500 outline-none transition-all resize-none"
                  {...register('description')}
                ></textarea>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Upload Photos ─── */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-[#0B1628] mb-2">Upload Photos</h2>
              <p className="text-gray-500 text-sm mb-6">Add up to 6 photos of your vehicle. Good photos help attract more buyers.</p>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gold-400 transition-colors mb-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cloud-arrow-up text-2xl text-gold-500"></i>
                  </div>
                  <p className="font-medium text-[#0B1628] mb-1">Click to upload images</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB each (Max 6 images)</p>
                </label>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                      <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <i className="fas fa-times text-sm"></i>
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-gold-500 text-white text-xs font-medium rounded">
                          Main Photo
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-gold-50 rounded-lg">
                <h4 className="font-medium text-gold-900 mb-2 flex items-center gap-2">
                  <i className="fas fa-lightbulb text-gold-500"></i>
                  Photo Tips
                </h4>
                <ul className="text-sm text-gold-700 space-y-1">
                  <li>• Take photos in good lighting</li>
                  <li>• Include exterior from all angles</li>
                  <li>• Show interior, dashboard, and odometer</li>
                  <li>• Capture any damages clearly</li>
                </ul>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Pricing ─── */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-[#0B1628] mb-2">Set Your Price</h2>
              <p className="text-gray-500 text-sm mb-6">Set a competitive starting price to attract more bidders.</p>
              
              {/* Expected Price */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    placeholder="Enter expected price"
                    className={`w-full pl-10 pr-4 py-3.5 border rounded-lg outline-none transition-all ${
                      errors.expectedPrice ? 'border-red-300' : 'border-gray-200 focus:border-gold-500'
                    }`}
                    {...register('expectedPrice', { required: 'Expected price is required' })}
                  />
                </div>
                {errors.expectedPrice && <p className="text-red-500 text-sm mt-1">{errors.expectedPrice.message}</p>}
                <p className="text-gray-400 text-sm mt-2">This is the price you expect to get for your vehicle</p>
              </div>

              {/* Minimum Price */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Acceptable Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    placeholder="Enter minimum price"
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-lg focus:border-gold-500 outline-none transition-all"
                    {...register('minimumPrice')}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">Optional: The lowest price you're willing to accept</p>
              </div>

              {/* Pricing Guide */}
              <div className="p-5 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-[#0B1628] mb-3">Pricing Guidelines</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                    <span>Research similar vehicles in your area for competitive pricing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                    <span>Consider vehicle age, condition, and mileage</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                    <span>Competitive starting prices attract more bidders</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Review & Submit ─── */}
          {step === 4 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-bold text-[#0B1628] mb-6">Review Your Listing</h2>
              
              {/* Summary */}
              <div className="space-y-6 mb-8">
                {/* Vehicle Info */}
                <div className="p-5 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-[#0B1628] mb-4 flex items-center gap-2">
                    <i className="fas fa-car text-gold-500"></i>
                    Vehicle Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Vehicle Name</p>
                      <p className="font-medium text-[#0B1628]">{watchedValues.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Category</p>
                      <p className="font-medium text-[#0B1628]">{CATEGORIES.find(c => c.value === watchedValues.category)?.label || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Location</p>
                      <p className="font-medium text-[#0B1628]">{watchedValues.location}, {watchedValues.state}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Registration</p>
                      <p className="font-medium text-[#0B1628]">{watchedValues.registration || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div className="p-5 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-[#0B1628] mb-4 flex items-center gap-2">
                    <i className="fas fa-camera text-gold-500"></i>
                    Photos ({images.length})
                  </h3>
                  {images.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <img key={idx} src={img.preview} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No photos uploaded</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="p-5 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-[#0B1628] mb-4 flex items-center gap-2">
                    <i className="fas fa-indian-rupee-sign text-gold-500"></i>
                    Pricing
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Expected Price</p>
                      <p className="font-medium text-[#0B1628]">₹{Number(watchedValues.expectedPrice || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Minimum Price</p>
                      <p className="font-medium text-[#0B1628]">₹{Number(watchedValues.minimumPrice || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="p-5 border border-gray-200 rounded-xl mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 text-gold-500 border-gray-300 rounded focus:ring-gold-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-600">
                    I confirm that all information provided is accurate. I agree to the{' '}
                    <Link to="/privacy-policy" className="text-gold-500 hover:underline">Terms & Conditions</Link> and{' '}
                    <Link to="/privacy-policy" className="text-gold-500 hover:underline">Privacy Policy</Link>.
                    I understand that AutoRevive may verify the details before listing.
                  </span>
                </label>
              </div>

              {/* Info Notice */}
              <div className="p-4 bg-gold-50 rounded-lg flex items-start gap-3">
                <i className="fas fa-info-circle text-gold-500 mt-0.5"></i>
                <p className="text-sm text-gold-700">
                  After submission, our team will review your listing and contact you within 24-48 hours for verification.
                </p>
              </div>
            </div>
          )}

          {/* ═══════ NAVIGATION BUTTONS ═══════ */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all"
              >
                <i className="fas fa-arrow-left text-sm"></i>
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-all"
              >
                Continue
                <i className="fas fa-arrow-right text-sm"></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !termsAccepted}
                className="flex items-center gap-2 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Submit Listing
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ═══════ WHY SELL WITH US ═══════ */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0B1628] text-center mb-10">Why Sell With AutoRevive?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-users', title: 'Thousands of Buyers', desc: 'Access verified buyers from across India looking for quality vehicles' },
              { icon: 'fa-shield-halved', title: 'Secure Transactions', desc: 'Safe and transparent payment processing with full documentation' },
              { icon: 'fa-bolt', title: 'Quick Process', desc: 'List your vehicle in minutes and get bids within hours' },
              { icon: 'fa-headset', title: 'Full Support', desc: 'Dedicated support team to help you throughout the process' },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${item.icon} text-xl text-gold-500`}></i>
                </div>
                <h3 className="font-semibold text-[#0B1628] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
