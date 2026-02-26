import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { featureService } from '@/services';
import { PageLoader } from '@/components/ui';
import { formatCurrency, formatDateTime, getImageUrls } from '@/utils';
import toast from 'react-hot-toast';

const UPI_ID = 'autorevive2026@fbl';

const getFirstImage = (imagePath) => {
  const urls = getImageUrls(imagePath);
  return urls.length > 0 ? urls[0] : null;
};

const paymentStatusBadge = {
  pending: { label: 'Not Paid', class: 'bg-yellow-100 text-yellow-700', icon: 'fa-clock' },
  verifying: { label: 'Verifying', class: 'bg-blue-100 text-blue-700', icon: 'fa-spinner fa-spin' },
  verified: { label: 'Verified', class: 'bg-green-100 text-green-700', icon: 'fa-circle-check' },
  invalid: { label: 'Rejected', class: 'bg-red-100 text-red-700', icon: 'fa-circle-xmark' },
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/features/transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (txn) => {
    setPayModal(txn);
    setScreenshot(null);
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);

      await featureService.submitPayment(payModal.id, formData);
      toast.success('Payment submitted for verification!');
      setPayModal(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit payment');
    } finally {
      setUploading(false);
    }
  };

  const getUpiQrUrl = (amount) => {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=AutoRevive&am=${amount}&cu=INR&tn=Auction%20Payment`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Vehicles you have won and corresponding payment status</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-14 text-center shadow-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center border border-slate-100">
            <i className="fas fa-inbox text-xl sm:text-2xl text-slate-300"></i>
          </div>
          <p className="text-slate-400 text-sm font-medium">No transactions found.</p>
        </div>
      ) : (
        <>
          {/* ===== MOBILE CARD VIEW ===== */}
          <div className="lg:hidden space-y-3">
            {transactions.map(txn => {
              const info = paymentStatusBadge[txn.payment_status] || paymentStatusBadge.pending;
              const canPay = !txn.payment_status || txn.payment_status === 'pending' || txn.payment_status === 'invalid';

              return (
                <div key={txn.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                  {/* Vehicle Row */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex-shrink-0 overflow-hidden">
                      {txn.product_image ? (
                        <img src={getFirstImage(txn.product_image)} alt={txn.product_name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><i className="fas fa-car text-sm text-slate-300"></i></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{txn.product_name}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(txn.transaction_date)}</p>
                    </div>
                  </div>

                  {/* Amount + Status Row */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Winning Bid</p>
                      <p className="font-bold text-accent text-base">{formatCurrency(txn.amount)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full capitalize ${txn.status === 'won' ? 'bg-success/10 text-success' :
                        txn.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Button / Badge */}
                  <div className="pt-2 border-t border-slate-100">
                    {canPay ? (
                      <button
                        onClick={() => openPayModal(txn)}
                        className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <i className="fas fa-qrcode"></i>
                        {txn.payment_status === 'invalid' ? 'Retry Payment' : 'Pay Now'}
                      </button>
                    ) : (
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 ${info.class}`}>
                          <i className={`fas ${info.icon} text-[10px]`}></i>
                          {info.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== DESKTOP TABLE VIEW ===== */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="font-bold px-6 py-4 w-[28%]">Vehicle</th>
                    <th className="font-bold px-6 py-4 w-[18%]">Winning Bid</th>
                    <th className="font-bold px-6 py-4 w-[22%]">Date</th>
                    <th className="font-bold px-6 py-4 w-[14%]">Status</th>
                    <th className="font-bold px-6 py-4 w-[18%]">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(txn => {
                    const info = paymentStatusBadge[txn.payment_status] || paymentStatusBadge.pending;
                    const canPay = !txn.payment_status || txn.payment_status === 'pending' || txn.payment_status === 'invalid';

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {txn.product_image ? (
                                <img src={getFirstImage(txn.product_image)} alt={txn.product_name} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                <i className="fas fa-car text-sm text-slate-300"></i>
                              )}
                            </div>
                            <span className="font-semibold text-slate-900">{txn.product_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold font-display text-accent">{formatCurrency(txn.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-500 text-sm font-medium">{formatDateTime(txn.transaction_date)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${txn.status === 'won' ? 'bg-success/10 text-success' :
                            txn.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {canPay ? (
                            <button
                              onClick={() => openPayModal(txn)}
                              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all hover:-translate-y-0.5 shadow-sm"
                            >
                              <i className="fas fa-qrcode"></i>
                              {txn.payment_status === 'invalid' ? 'Retry Payment' : 'Pay Now'}
                            </button>
                          ) : (
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit ${info.class}`}>
                              <i className={`fas ${info.icon} text-[10px]`}></i>
                              {info.label}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ====== UPI PAYMENT MODAL ====== */}
      {payModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !uploading && setPayModal(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1628]">Complete Payment</h3>
                <p className="text-xs sm:text-sm text-gray-400">{payModal.product_name}</p>
              </div>
              <button onClick={() => !uploading && setPayModal(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
              {/* Amount */}
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Amount to Pay</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#0B1628]">{formatCurrency(payModal.amount)}</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 sm:p-4 shadow-sm">
                  <img
                    src={getUpiQrUrl(payModal.amount)}
                    alt="UPI QR Code"
                    className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[10px] sm:text-xs text-gray-400">Scan with any UPI app</p>
                  <p className="text-xs sm:text-sm font-mono font-bold text-[#0B1628] mt-1 bg-gray-50 px-4 py-2 rounded-lg select-all">
                    {UPI_ID}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 sm:pt-5 space-y-4">
                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Payment Screenshot</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50/30 transition-all"
                  >
                    {screenshot ? (
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img src={URL.createObjectURL(screenshot)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs sm:text-sm font-semibold text-[#0B1628] truncate max-w-[160px] sm:max-w-[200px]">{screenshot.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400">{(screenshot.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setScreenshot(null); }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt text-2xl sm:text-3xl text-gray-300 mb-2"></i>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Click to upload screenshot</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">JPG, PNG or WEBP</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setScreenshot(e.target.files[0] || null)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => !uploading && setPayModal(null)}
                className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all text-sm"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={uploading || !screenshot}
                className="flex-1 py-2.5 sm:py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {uploading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Submit Payment</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
