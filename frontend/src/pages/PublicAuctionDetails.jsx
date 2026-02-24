import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { auctionService, publicService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl, getImageUrls } from '@/utils';
import api from '@/services/api';

/* Countdown Timer Component */
function Countdown({ hours }) {
  const [secs, setSecs] = useState(hours * 3600);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return (
    <div className="flex gap-2">
      {[{ val: h, label: 'Hours' }, { val: m, label: 'Min' }, { val: s, label: 'Sec' }].map((t, i) => (
        <div key={i} className="text-center">
          <div className="w-14 h-14 bg-[#111111] text-white rounded-lg flex items-center justify-center text-xl font-bold font-mono">
            {t.val}
          </div>
          <p className="text-xs text-gray-500 mt-1">{t.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function PublicAuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await auctionService.getById(id);
        setAuction(data);
        setBids(data.bids || []);
        
        // Fetch similar vehicles
        const homeData = await publicService.getHomeData();
        const vehicles = homeData.data?.products || [];
        setSimilarVehicles(vehicles.filter(v => v.id !== id).slice(0, 3));
      } catch {
        toast.error('Auction not found');
        navigate('/auctions');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const onSubmit = async ({ amount }) => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    try {
      await api.post(`/vehicles/${id}/bid`, { amount: numericAmount });
      toast.success('Bid placed successfully!');
      reset();
      const { data } = await auctionService.getById(id);
      setAuction(data);
      setBids(data.bids || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place bid');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!auction) return null;

  const formatPrice = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;
  
  // Get gallery images from image_path (now supports multiple images)
  const galleryImages = getImageUrls(auction.image_path);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{`${auction.name || 'Auction Details'} — AutoRevive`}</title>
        <meta name="description" content={`Bid on ${auction.name || 'this vehicle'} at AutoRevive. View details and place your bid on this verified pre-owned vehicle.`} />
      </Helmet>

      {/* ═══════ BREADCRUMB ═══════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-[#111111]">Home</Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
            <Link to="/auctions" className="text-gray-500 hover:text-[#111111]">Auctions</Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
            <span className="text-[#111111] font-medium truncate max-w-[200px]">{auction.name}</span>
          </nav>
        </div>
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ═══════ LEFT COLUMN — Images & Details ═══════ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* IMAGE GALLERY */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                {galleryImages.length > 0 ? (
                  <img
                    src={galleryImages[selectedImage]}
                    alt={auction.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-car text-6xl text-gray-300 mb-3"></i>
                      <p className="text-gray-400">No image available</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE AUCTION
                  </span>
                </div>

                {/* Image Navigation */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((selectedImage - 1 + galleryImages.length) % galleryImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <i className="fas fa-chevron-left text-[#111111]"></i>
                    </button>
                    <button
                      onClick={() => setSelectedImage((selectedImage + 1) % galleryImages.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <i className="fas fa-chevron-right text-[#111111]"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Row */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2 p-4 border-t border-gray-100">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-orange-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* VEHICLE INFO HEADER */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                      {auction.category || '4W'}
                    </span>
                    <span className="text-xs text-gray-400">ID: #{auction.id}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] mb-2">{auction.name}</h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-gray-400"></i>
                    {auction.location || 'India'}, {auction.display_state || auction.state || 'Tamil Nadu'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: 'fa-building', label: 'Seller', value: auction.office_name || 'Bank Partner' },
                  { icon: 'fa-calendar', label: 'Listed', value: new Date(auction.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
                  { icon: 'fa-gavel', label: 'Total Bids', value: auction.total_bids || bids.length || 0 },
                  { icon: 'fa-eye', label: 'Views', value: Math.floor(Math.random() * 500) + 100 },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                    <i className={`fas ${stat.icon} text-orange-500 mb-2`}></i>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="font-semibold text-[#111111] text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* VEHICLE SPECIFICATIONS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#111111] mb-4 flex items-center gap-2">
                <i className="fas fa-list-check text-orange-500"></i>
                Vehicle Specifications
              </h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Category', value: auction.category || '4 Wheeler', icon: 'fa-car' },
                  { label: 'Location', value: auction.location || 'India', icon: 'fa-location-dot' },
                  { label: 'State', value: auction.display_state || auction.state || 'Tamil Nadu', icon: 'fa-map' },
                  { label: 'Registration', value: 'Available', icon: 'fa-file-lines' },
                  { label: 'Condition', value: 'Good', icon: 'fa-check-circle' },
                  { label: 'Documents', value: 'Complete', icon: 'fa-folder-open' },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`fas ${spec.icon} text-gray-500`}></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{spec.label}</p>
                      <p className="font-medium text-[#111111] text-sm">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#111111] mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-orange-500"></i>
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {auction.description || 'This verified pre-owned vehicle is available through our trusted banking partner. All documentation is complete and ready for transfer. The vehicle has been inspected and verified by our team. Please review all details before placing your bid.'}
              </p>
            </div>

            {/* BID HISTORY */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                  <i className="fas fa-history text-orange-500"></i>
                  Bid History
                </h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                  {bids.length} Bids
                </span>
              </div>

              {bids.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <i className="fas fa-gavel text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-600 font-medium mb-1">No bids yet</p>
                  <p className="text-gray-400 text-sm">Be the first to place a bid!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {bids.map((b, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        i === 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {b.bidder_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-[#111111]">{b.bidder_name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(b.bid_time || b.created_at).toLocaleString('en-IN', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${i === 0 ? 'text-orange-600' : 'text-[#111111]'}`}>
                          {formatPrice(b.amount)}
                        </p>
                        {i === 0 && (
                          <span className="text-xs font-semibold text-orange-600">Highest Bid</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN — Bid Form ═══════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* PRICE & BID CARD */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-[#111111] text-white p-5">
                  <p className="text-sm text-gray-400 mb-1">Current Highest Bid</p>
                  <p className="text-3xl font-bold">{formatPrice(auction.current_bid || auction.starting_price)}</p>
                </div>

                {/* Timer */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-3">Auction ends in:</p>
                  <Countdown hours={12} />
                </div>

                {/* Price Info */}
                <div className="p-5 space-y-3 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Base Price</span>
                    <span className="font-semibold text-[#111111]">{formatPrice(auction.starting_price)}</span>
                  </div>
                  {auction.quoted_price && Number(auction.quoted_price) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Quoted Price</span>
                      <span className="font-semibold text-orange-600">{formatPrice(auction.quoted_price)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Total Bids</span>
                    <span className="font-semibold text-[#111111]">{auction.total_bids || bids.length || 0}</span>
                  </div>
                </div>

                {/* Bid Form */}
                <div className="p-5">
                  {isAuthenticated ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Bid Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                          <input
                            type="number"
                            step="1"
                            placeholder="Enter amount"
                            className={`w-full pl-10 pr-4 py-3.5 border rounded-lg text-[#111111] font-medium focus:ring-2 outline-none transition-all ${
                              errors.amount
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/20'
                            }`}
                            {...register('amount', {
                              required: 'Bid amount is required',
                              valueAsNumber: true,
                              validate: (val) => {
                                if (!val || isNaN(val)) return 'Enter a valid number';
                                if (val <= Number(auction.current_bid || auction.starting_price))
                                  return `Bid must be more than ${formatPrice(auction.current_bid || auction.starting_price)}`;
                                return true;
                              },
                            })}
                          />
                        </div>
                        {errors.amount && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle"></i> {errors.amount.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                      >
                        <i className="fas fa-gavel"></i>
                        Place Bid
                      </button>

                      <p className="text-xs text-center text-gray-400">
                        By bidding, you agree to our{' '}
                        <Link to="/privacy-policy" className="text-orange-500 hover:underline">terms</Link>
                      </p>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-lock text-3xl text-gray-300 mb-3"></i>
                      <p className="font-medium text-[#111111] mb-1">Login to Bid</p>
                      <p className="text-gray-400 text-sm mb-4">Sign in to place your bid</p>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all"
                      >
                        Login Now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SELLER INFO */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-[#111111] mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center">
                    <i className="fas fa-building text-white"></i>
                  </div>
                  <div>
                    <p className="font-medium text-[#111111]">{auction.office_name || 'Bank Partner'}</p>
                    <p className="text-sm text-gray-400">Verified Seller</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <i className="fas fa-shield-halved"></i>
                  <span>Verified & Trusted Partner</span>
                </div>
              </div>

              {/* HELP */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-[#111111] mb-3">Need Help?</h3>
                <p className="text-sm text-gray-500 mb-4">Our team is here to assist you with any questions</p>
                <Link to="/contact" className="flex items-center justify-center gap-2 py-3 border border-gray-200 bg-white rounded-lg text-[#111111] font-medium hover:bg-gray-50 transition-all">
                  <i className="fas fa-headset"></i>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ SIMILAR VEHICLES ═══════ */}
        {similarVehicles.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#111111]">Similar Vehicles</h2>
              <Link to="/auctions" className="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1">
                View All <i className="fas fa-arrow-right text-sm"></i>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similarVehicles.map((v) => (
                <Link
                  key={v.id}
                  to={`/auctions/${v.id}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {v.image_path ? (
                      <img
                        src={getImageUrls(v.image_path)[0] || null}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-car text-4xl text-gray-300"></i>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">LIVE</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#111111] mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{v.location || 'India'}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Current Bid</p>
                        <p className="font-bold text-[#111111]">{formatPrice(v.current_bid || v.starting_price)}</p>
                      </div>
                      <span className="text-orange-600 text-sm font-medium">Bid Now →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
