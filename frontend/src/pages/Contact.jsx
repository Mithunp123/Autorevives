import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { publicService } from '@/services';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const SUBJECTS = [
  'General Inquiry', 'Auction Support', 'Payment Issue',
  'Vehicle Inspection', 'Technical Support', 'Other',
];

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: result } = await publicService.submitContact(data);
      toast.success(result.message || 'Message sent successfully!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — AutoRevive | Get in Touch</title>
        <meta name="description" content="Get in touch with AutoRevive support. Find our office address, phone numbers, and email for assistance with vehicle auctions." />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="bg-[#111111] text-white py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium rounded-full mb-6">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-gray-400">
              Have a question? Our support team is ready to help you. 
              Reach out and we'll respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT INFO CARDS ═══════ */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-location-dot', title: 'Head Office', line1: '123 Auto Marketplace Tower', line2: 'Business Bay, Mumbai 400001' },
              { icon: 'fa-phone', title: 'Phone Support', line1: '+91 98765 43210', line2: 'Mon–Sat, 9 AM – 7 PM IST' },
              { icon: 'fa-envelope', title: 'Email Us', line1: 'support@autorevive.com', line2: 'We respond within 24 hours' },
              { icon: 'fa-clock', title: 'Business Hours', line1: 'Monday – Saturday', line2: '9:00 AM – 7:00 PM IST' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${item.icon} text-orange-500`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#111111] mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.line1}</p>
                  <p className="text-sm text-gray-400">{item.line2}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT FORM & MAP ═══════ */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* ── FORM ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#111111] mb-2">Send us a Message</h2>
              <p className="text-gray-500 mb-8">Fill out the form and we'll get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3.5 border rounded-lg outline-none transition-all ${
                      errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                      })}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3.5 border rounded-lg outline-none transition-all ${
                        errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('mobile', {
                        required: 'Phone number is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
                      })}
                      placeholder="98765 43210"
                      className={`w-full px-4 py-3.5 border rounded-lg outline-none transition-all ${
                        errors.mobile ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                    />
                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                  </div>
                </div>

                {/* State + City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <select
                      {...register('state')}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:border-orange-500 outline-none transition-all"
                    >
                      <option value="">Select State</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      {...register('city')}
                      placeholder="Enter your city"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('subject', { required: 'Please select a subject' })}
                    className={`w-full px-4 py-3.5 border rounded-lg outline-none transition-all ${
                      errors.subject ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="How can we help you today?"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:border-orange-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ── MAP & ADDITIONAL INFO ── */}
            <div className="space-y-6">
              {/* Map */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-[300px]">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-map-location-dot text-2xl text-orange-500"></i>
                    </div>
                    <h3 className="font-semibold text-[#111111] mb-1">Mumbai, Maharashtra</h3>
                    <p className="text-gray-500 text-sm mb-4">123 Auto Marketplace Tower, Business Bay</p>
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-500 font-medium text-sm hover:text-orange-600"
                    >
                      <i className="fas fa-external-link-alt text-xs"></i>
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Help Cards */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-[#111111] mb-4">Need Immediate Help?</h3>
                <div className="space-y-4">
                  {[
                    { icon: 'fa-comments', title: 'Auction Queries', desc: 'Help with bidding, registration, or timelines', contact: 'support@autorevive.com' },
                    { icon: 'fa-credit-card', title: 'Payment Support', desc: 'Questions about deposits, refunds, or payments', contact: '+91 98765 43210' },
                    { icon: 'fa-wrench', title: 'Technical Issues', desc: 'Platform or account problems', contact: 'tech@autorevive.com' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`fas ${item.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#111111] text-sm">{item.title}</h4>
                        <p className="text-gray-500 text-xs mb-1">{item.desc}</p>
                        <span className="text-orange-500 text-xs font-medium">{item.contact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
