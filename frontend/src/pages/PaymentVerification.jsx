import { useState, useEffect } from 'react';
import { PageLoader } from '@/components/ui';
import { featureService } from '@/services';
import { formatCurrency, formatDateTime, getImageUrls } from '@/utils';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getFirstImage = (imagePath) => {
  const urls = getImageUrls(imagePath);
  return urls.length > 0 ? urls[0] : null;
};

const getScreenshotUrl = (path) => {
  if (!path) return null;
  // path is e.g. "payments/pay_1_2.webp"
  return `${API_BASE}/uploads/${path}`;
};

export default function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('verifying');
  const [previewImage, setPreviewImage] = useState(null);
  const [imgLoading, setImgLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await featureService.getPendingPayments({ status: tab });
      setPayments(data.payments || []);
    } catch {
      console.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [tab]);

  const handleVerify = async (txnId, status) => {
    const label = status === 'verified' ? 'verify' : 'reject';
    if (!window.confirm(`Are you sure you want to ${label} this payment?`)) return;
    setActionLoading(prev => ({ ...prev, [txnId]: true }));
    try {
      await featureService.verifyPayment(txnId, { payment_status: status });
      toast.success(`Payment ${status === 'verified' ? 'verified' : 'marked invalid'}!`);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update payment');
    } finally {
      setActionLoading(prev => ({ ...prev, [txnId]: false }));
    }
  };

  const tabs = [
    { key: 'verifying', label: 'Pending', icon: 'fa-clock', color: 'text-blue-600' },
    { key: 'verified', label: 'Verified', icon: 'fa-circle-check', color: 'text-green-600' },
    { key: 'invalid', label: 'Rejected', icon: 'fa-circle-xmark', color: 'text-red-600' },
  ];

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="w-32 h-44 bg-gray-200 rounded-xl" />
        <div className="flex flex-col gap-2 w-28">
          <div className="h-10 bg-gray-200 rounded-xl" />
          <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Verification</h1>
          <p className="page-subtitle">Review and verify user payment screenshots</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 sm:gap-2 bg-white border border-gray-200 rounded-xl p-1.5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key
              ? 'bg-[#0B1628] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <i className={`fas ${t.icon} ${tab === t.key ? 'text-white' : t.color}`}></i>
            {t.label}
            {t.key === 'verifying' && payments.length > 0 && tab === t.key && (
              <span className="ml-1 w-5 h-5 bg-gold-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {payments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <i className="fas fa-receipt text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 font-medium">No {tab} payments</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map(p => {
            const screenshotUrl = getScreenshotUrl(p.payment_screenshot);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 transition-all hover:shadow-sm">
                {/* Mobile: stacked layout, Desktop: row layout */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
                  {/* Left — Vehicle info */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {p.product_image ? (
                        <img src={getFirstImage(p.product_image)} alt={p.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><i className="fas fa-car text-gray-300"></i></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#0B1628] truncate text-sm sm:text-base">{p.product_name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Office: {p.office_name}</p>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                        <p className="text-xs sm:text-sm"><span className="text-gray-400">Winner:</span> <span className="font-semibold text-[#0B1628]">{p.winner_name}</span></p>
                        <p className="text-xs sm:text-sm"><span className="text-gray-400">Email:</span> {p.winner_email}</p>
                        {p.winner_mobile && <p className="text-xs sm:text-sm"><span className="text-gray-400">Mobile:</span> {p.winner_mobile}</p>}
                        <p className="text-xs sm:text-sm"><span className="text-gray-400">Amount:</span> <span className="font-bold text-accent">{formatCurrency(p.amount)}</span></p>
                        <p className="text-xs text-gray-400">{formatDateTime(p.transaction_date)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center — Screenshot */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Proof</p>
                    {screenshotUrl ? (
                      <button
                        onClick={() => setPreviewImage(screenshotUrl)}
                        className="w-32 h-44 sm:w-40 sm:h-56 rounded-xl border-2 border-gray-200 overflow-hidden hover:border-accent transition-colors cursor-pointer relative"
                      >
                        {imgLoading[p.id] !== false && (
                          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center animate-pulse">
                            <i className="fas fa-image text-2xl text-gray-300"></i>
                          </div>
                        )}
                        <img
                          src={screenshotUrl}
                          alt="Payment screenshot"
                          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoading[p.id] === false ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => setImgLoading(prev => ({ ...prev, [p.id]: false }))}
                          onError={() => setImgLoading(prev => ({ ...prev, [p.id]: 'error' }))}
                        />
                      </button>
                    ) : (
                      <div className="w-32 h-44 sm:w-40 sm:h-56 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <p className="text-gray-400 text-xs sm:text-sm text-center">No screenshot</p>
                      </div>
                    )}
                  </div>

                  {/* Right — Actions */}
                  {tab === 'verifying' && (
                    <div className="flex flex-row lg:flex-col gap-2 justify-center lg:min-w-[130px]">
                      <button
                        onClick={() => handleVerify(p.id, 'verified')}
                        disabled={actionLoading[p.id]}
                        className="flex-1 lg:flex-none px-4 sm:px-5 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-60"
                      >
                        {actionLoading[p.id] ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerify(p.id, 'invalid')}
                        disabled={actionLoading[p.id]}
                        className="flex-1 lg:flex-none px-4 sm:px-5 py-2.5 sm:py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all border border-red-200 text-sm disabled:opacity-60"
                      >
                        <i className="fas fa-times"></i> Invalid
                      </button>
                    </div>
                  )}

                  {tab !== 'verifying' && (
                    <div className="flex items-center justify-center lg:min-w-[100px]">
                      <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize ${p.payment_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        <i className={`fas ${p.payment_status === 'verified' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1`}></i>
                        {p.payment_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:text-gray-900 z-10"
            >
              <i className="fas fa-times"></i>
            </button>
            <img src={previewImage} alt="Payment screenshot" className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
