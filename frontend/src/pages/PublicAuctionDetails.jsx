import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { auctionService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function PublicAuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await auctionService.getById(id);
        setAuction(data);
        setBids(data.bids || []);
      } catch {
        toast.error('Auction not found');
        navigate('/public/auctions');
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#4285F4]/20 border-t-[#4285F4] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!auction) return null;

  const formatPrice = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Helmet>
        <title>{`${auction.name || 'Auction Details'} - AutoRevive`}</title>
        <meta name="description" content={`Bid on ${auction.name || 'this vehicle'} at AutoRevive. View details and place your bid on this verified pre-owned vehicle.`} />
      </Helmet>

      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/public/auctions')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Auctions
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[#3367D6]/20 text-[#2851a3] rounded-full text-xs font-bold uppercase tracking-wider border border-[#3367D6]/30">
                  {auction.category || 'Vehicle'}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                  ID: {auction.id.substring(0, 8)}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{auction.name}</h1>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1.5"><i className="fas fa-map-marker-alt"></i> {auction.location || 'All'}, {auction.display_state || auction.state || 'Tamil Nadu'}</span>
                {auction.office_name && <span className="flex items-center gap-1.5"><i className="fas fa-building"></i> {auction.office_name}</span>}
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-slate-400 text-sm font-medium mb-1">Current Bid</p>
              <p className="text-2xl md:text-4xl font-bold text-[#4285F4]">{formatPrice(auction.current_bid || auction.starting_price)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden">
                {auction.image_path ? (
                  <img
                    src={`/api/uploads/${auction.image_path.replace('uploads/', '')}`}
                    alt={auction.name}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
                  />
                ) : null}
                <div className={`w-full h-full items-center justify-center ${auction.image_path ? 'hidden' : 'flex'}`}>
                  <i className="fas fa-car text-6xl text-slate-300"></i>
                </div>
              </div>
            </div>

          {/* Details */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Vehicle Information</h2>
            <p className="text-slate-600 leading-relaxed mb-8">{auction.description || 'No detailed description available for this vehicle.'}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-building"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seller Office</p>
                  <p className="font-semibold text-slate-900">{auction.office_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Listed Date</p>
                  <p className="font-semibold text-slate-900">{new Date(auction.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bidding History */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <i className="fas fa-history text-[#4285F4]"></i>
                Bid History
              </h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold">
                {bids.length} Bids
              </span>
            </div>
            
            {bids.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <i className="fas fa-gavel text-2xl text-slate-300"></i>
                </div>
                <p className="text-slate-500 font-medium">No bids placed yet</p>
                <p className="text-sm text-slate-400 mt-1">Be the first to bid on this vehicle!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {bids.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                        {b.bidder_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{b.bidder_name || 'Anonymous Bidder'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <i className="far fa-clock"></i>
                          {new Date(b.bid_time || b.created_at).toLocaleString('en-IN', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#4285F4] text-lg">{formatPrice(b.amount)}</p>
                      {i === 0 && <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Highest</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Bid Form) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Place Your Bid</h3>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-500">Base Price</span>
                <span className="font-bold text-slate-900">{formatPrice(auction.starting_price)}</span>
              </div>
              {auction.quoted_price && Number(auction.quoted_price) > 0 && (
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-sm font-bold text-amber-700">Quoted Amount</span>
                  <span className="font-bold text-amber-900">{formatPrice(auction.quoted_price)}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-bold text-[#2851a3]">Current Highest</span>
                <span className="font-bold text-xl text-[#3367D6]">{formatPrice(auction.current_bid || auction.starting_price)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <i className="fas fa-users text-slate-400"></i>
                  Total Bids
                </span>
                <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">{auction.total_bids || 0}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Bid Amount</label>
                  <div className="relative">
                    <i className="fas fa-indian-rupee-sign absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="number"
                      step="1"
                      placeholder="Enter your bid amount"
                      className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-[#4285F4]/20 focus:border-[#4285F4] outline-none transition-all ${
                        errors.amount ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200'
                      }`}
                      {...register('amount', {
                        required: 'Bid amount is required',
                        valueAsNumber: true,
                        validate: (val) => {
                          const minBid = Number(auction.current_bid || auction.starting_price) + 1;
                          if (!val || isNaN(val)) return 'Enter a valid number';
                          if (val <= Number(auction.current_bid || auction.starting_price))
                            return `Bid must be more than ${formatPrice(auction.current_bid || auction.starting_price)}`;
                          return true;
                        },
                      })}
                    />
                  </div>
                  {errors.amount && <p className="text-xs font-medium text-red-500 mt-1.5 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i> {errors.amount.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#3367D6] hover:bg-[#2851a3] text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <i className="fas fa-gavel"></i>
                  Place Bid
                </button>

                <p className="text-xs text-center text-slate-500 font-medium">
                  By placing a bid, you agree to our <a href="#" className="text-[#4285F4] hover:underline">terms and conditions</a>
                </p>
              </form>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <i className="fas fa-lock text-slate-400"></i>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-5">Please login to place a bid</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#3367D6] hover:bg-[#2851a3] text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Login to Bid
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
