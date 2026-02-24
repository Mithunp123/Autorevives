import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const FAQ_DATA = {
  auctions: [
    { q: 'What is AutoRevive Auction into?', a: 'AutoRevive is an online vehicle auction platform that connects buyers with quality pre-owned vehicles from banks, NBFCs, and fleet operators. We facilitate transparent bidding and secure transactions.' },
    { q: 'What are types of vehicles available?', a: 'We offer a wide range of vehicles including 2-wheelers (motorcycles, scooters), 3-wheelers (auto rickshaws), 4-wheelers (cars, SUVs), and commercial vehicles (trucks, buses).' },
    { q: 'Who can purchase vehicles from our platform?', a: 'Any individual or business entity with valid KYC documents can register and participate in our auctions. We welcome dealers, end-users, and fleet operators.' },
    { q: 'What is the registration process?', a: 'Registration is simple: Sign up with your details, verify your mobile number, upload KYC documents (Aadhaar, PAN), and complete the verification. Once approved, you can start bidding.' },
    { q: 'How does the refundable security deposit (RSD) work?', a: "RSD is a security deposit required to participate in auctions. It's fully refundable if you don't win the bid or can be adjusted against your purchase if you win." },
    { q: 'How do you activate your ID?', a: "After registration, your account is activated once your KYC documents are verified. This usually takes 24-48 hours. You'll receive an email/SMS confirmation." },
    { q: 'How can a buyer cancel bids placed in an auction?', a: 'Bids can be cancelled before the auction ends by contacting our support team. However, winning bids are binding and cannot be cancelled without penalties.' },
  ],
  payments: [
    { q: 'What are the payment methods accepted?', a: "We accept payments via NEFT, RTGS, UPI, Debit Cards, Credit Cards, and Net Banking. All payments must be made from the registered buyer's account." },
    { q: 'What fees are applicable?', a: 'A buyer\'s premium of 1-2% is applicable on the hammer price. GST and other statutory charges are additional. Detailed fee structure is available during registration.' },
    { q: 'When is payment due after winning?', a: 'Full payment is due within 7 working days of winning the auction. Failure to pay may result in forfeiture of security deposit and blacklisting from future auctions.' },
  ],
  post: [
    { q: 'How do I collect the vehicle after winning?', a: "After payment confirmation, you'll receive a release order. Present this at the vehicle yard along with valid ID to collect your vehicle within the specified timeframe (usually 7-15 days)." },
    { q: 'What documents will I receive?', a: 'You\'ll receive the RC Transfer Form, NOC from the previous owner/financer, Invoice, and Release Order. Some vehicles may have hypothecation removal certificates if applicable.' },
    { q: 'Is there any warranty on purchased vehicles?', a: 'All vehicles are sold on "as-is-where-is" basis. We encourage buyers to thoroughly inspect vehicles before bidding. Inspection reports are provided for reference.' },
  ],
};

const TABS = [
  { key: 'auctions', label: 'Auctions', icon: 'fa-gavel' },
  { key: 'payments', label: 'Fees & Payments', icon: 'fa-credit-card' },
  { key: 'post', label: 'Post Auctions', icon: 'fa-truck-fast' },
];

export default function FAQ() {
  const [activeTab, setActiveTab] = useState('auctions');
  const [openIndex, setOpenIndex] = useState(null);

  const items = FAQ_DATA[activeTab] || [];

  return (
    <>
      <Helmet>
        <title>FAQ - AutoRevive | Frequently Asked Questions</title>
        <meta name="description" content="Find answers to frequently asked questions about AutoRevive's vehicle auctions, payments, and post-auction process." />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: Object.values(FAQ_DATA).flat().map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          })}
        </script>
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-[#111111] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
            <i className="fas fa-circle-question text-orange-500 text-xs"></i>
            <span className="text-sm font-medium text-white/70">Support Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-400 max-w-xl">Everything you need to know about buying vehicles through AutoRevive.</p>
        </div>
      </section>

      {/* ═══════ FAQ CONTENT ═══════ */}
      <section className="bg-gray-50 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Category Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center mb-10">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setOpenIndex(null); }}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === t.key
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600'
                }`}
              >
                <i className={`fas ${t.icon} text-xs ${activeTab === t.key ? 'text-orange-400' : ''}`}></i>
                {t.label}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {items.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                    isOpen ? 'border-orange-300 shadow-lg shadow-orange-500/5' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 text-left group"
                  >
                    <div className="flex items-center gap-4 pr-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isOpen ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500'
                      }`}>
                        <span className="text-xs font-bold">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className={`text-sm sm:text-base font-semibold transition-colors ${
                        isOpen ? 'text-[#111111]' : 'text-[#111111] group-hover:text-orange-600'
                      }`}>
                        {item.q}
                      </h3>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-orange-50 rotate-180' : 'bg-gray-50 group-hover:bg-orange-50'
                    }`}>
                      <i className={`fas fa-chevron-down text-xs transition-colors ${
                        isOpen ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-500'
                      }`}></i>
                    </div>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                      <div className="pl-12 border-l-2 border-orange-200 ml-0">
                        <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom helper */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-14 h-14 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-headset text-xl text-orange-500"></i>
              </div>
              <h3 className="text-lg font-bold text-[#111111] mb-2">Still Have Questions?</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">Our friendly support team is always ready to help you.</p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all"
              >
                <i className="fas fa-message text-xs"></i> Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
