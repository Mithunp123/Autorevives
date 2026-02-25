import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { PageLoader, EmptyState } from '@/components/ui';
import { formatCurrency, getImageUrls, logError } from '@/utils';

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/features/wishlist');
            setWishlist(response.data.wishlist || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await api.post('/features/wishlist', { product_id: productId });
            setWishlist((prev) => prev.filter((item) => item.id !== productId));
            toast.success('Removed from wishlist', { id: 'wishlist-remove' });
        } catch (error) {
            logError(error, { errorType: 'wishlist' });
            toast.error('Failed to remove from wishlist', { id: 'wishlist-remove-error' });
        }
    };

    if (loading) return <PageLoader />;

    if (wishlist.length === 0) {
        return (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Wishlist</h1>
                        <p className="page-subtitle">Vehicles you have saved for later</p>
                    </div>
                </div>
                <div className="card bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <EmptyState
                        icon="fa-heart"
                        title="Your wishlist is empty"
                        message="Browse auctions and save vehicles you're interested in."
                        actionText="Browse Auctions"
                        onAction={() => navigate('/auctions')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="page-header border-b border-slate-200 pb-4">
                <div>
                    <h1 className="page-title">My Wishlist</h1>
                    <p className="page-subtitle">Vehicles you have saved for later</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((product) => (
                    <div key={product.id} className="card bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:border-gold-300 transition-colors">
                        <div className="relative aspect-[4/3] bg-slate-100 cursor-pointer" onClick={() => navigate(`/auctions/${product.id}`)}>
                            {(() => {
                                const imgUrl = getImageUrls(product.image_path)[0];
                                return imgUrl ? (
                                    <img
                                        src={imgUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <i className="fas fa-car text-4xl"></i>
                                    </div>
                                );
                            })()}
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-accent hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                                title="Remove from wishlist"
                            >
                                <i className="fas fa-heart text-sm"></i>
                            </button>
                        </div>

                        <div className="p-4 sm:p-5">
                            <h3 className="text-slate-900 font-bold truncate text-base hover:text-gold-600 transition-colors cursor-pointer" onClick={() => navigate(`/auctions/${product.id}`)} title={product.name}>
                                {product.name}
                            </h3>
                            <div className="mt-2 text-sm text-slate-500">
                                <p>Starting Price: <span className="text-slate-800 font-bold">{formatCurrency(product.starting_price)}</span></p>
                            </div>
                            <button
                                onClick={() => navigate(`/auctions/${product.id}`)}
                                className="mt-4 w-full py-2.5 bg-slate-50 hover:bg-gold-50 text-slate-700 hover:text-gold-700 rounded-xl text-sm font-semibold transition-colors border border-slate-200 hover:border-gold-200"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
