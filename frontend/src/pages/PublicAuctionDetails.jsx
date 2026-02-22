import { useState, useEffect } from 'react';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!auction) return null;

  const formatPrice = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/public/auctions')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-accent mb-6"
      >
        <i className="fas fa-chevron-left text-xs"></i>
        Back to Auctions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="card p-4 rounded-xl">
            <div className="relative h-96 bg-slate-100 rounded-lg overflow-hidden">
              {auction.image_path ? (
                <img
                  src={`/api/uploads/${auction.image_path.replace('uploads/', '')}`}
                  alt={auction.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-full h-full items-center justify-center ${auction.image_path ? 'hidden' : 'flex'}`}>
                <i className="fas fa-car text-6xl text-slate-200"></i>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card p-6">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 mb-2">{auction.name}</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{auction.description || 'No description available.'}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <i className="fas fa-user text-sm text-accent"></i>
                <span>Seller: {auction.office_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <i className="fas fa-calendar text-sm text-accent"></i>
                <span>Listed: {new Date(auction.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Bidding History */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fas fa-arrow-trend-up text-accent"></i>
              Bidding History ({bids.length})
            </h3>
            {bids.length === 0 ? (
              <p className="text-center text-slate-300 py-8 text-sm">No bids yet. Be the first to bid!</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {bids.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary-400 text-white rounded-full flex items-center justify-center font-semibold text-xs">
                        {b.bidder_name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-medium text-slate-900">{b.bidder_name || 'Anonymous'}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">{formatPrice(b.amount)}</p>
                      <p className="text-xs text-slate-300">{new Date(b.bid_time || b.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Bid Form) */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h3 className="font-semibold text-slate-900 mb-5">Place Your Bid</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-400">Base Price</span>
                <span className="font-semibold text-slate-900">{formatPrice(auction.starting_price)}</span>
              </div>
              {auction.quoted_price && Number(auction.quoted_price) > 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-amber-700">Quoted Amount</span>
                  <span className="font-semibold text-amber-800">{formatPrice(auction.quoted_price)}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-accent/20 rounded-lg">
                <span className="text-sm font-medium text-accent">Current Highest</span>
                <span className="font-bold text-lg text-accent">{formatPrice(auction.current_bid || auction.starting_price)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg text-sm">
                <span className="text-slate-400 flex items-center gap-1">
                  <i className="fas fa-gavel text-xs text-primary-500"></i>
                  Total Bids
                </span>
                <span className="font-semibold text-slate-900">{auction.total_bids || 0}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your Bid Amount</label>
                  <div className="relative">
                    <i className="fas fa-indian-rupee-sign absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-300"></i>
                    <input
                      type="number"
                      step="1"
                      placeholder="Enter your bid amount"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none ${
                        errors.amount ? 'border-red-300' : 'border-slate-200'
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
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-primary-500 text-white py-3 rounded-xl font-semibold shadow-button hover:shadow-glow transition"
                >
                  <i className="fas fa-gavel text-sm"></i>
                  Place Bid
                </button>

                <p className="text-xs text-center text-slate-300">
                  By placing a bid, you agree to our terms and conditions
                </p>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-400 mb-4">Please login to place a bid</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-accent to-primary-500 text-white py-3 rounded-xl font-semibold shadow-button hover:shadow-glow transition"
                >
                  Login to Bid
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
