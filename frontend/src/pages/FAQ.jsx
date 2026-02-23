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
  { key: 'auctions', label: 'Auctions' },
  { key: 'payments', label: 'Fees & Payments' },
  { key: 'post', label: 'Post Auctions' },
];

export default function FAQ() {
  const [activeTab, setActiveTab] = useState('auctions');
  const [openIndex, setOpenIndex] = useState(null);

  const items = FAQ_DATA[activeTab] || [];

  return (
    <div>
      <Helmet>
        <title>FAQ - AutoRevive</title>
        <meta name="description" content="Find answers to frequently asked questions about AutoRevive's vehicle auctions, payments, and post-auction process." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": Object.values(FAQ_DATA).flat().map(item => ({
              "@type": "Question",
              "name": item.q,
              "acceptedAnswer": { "@type": "Answer", "text": item.a }
            }))
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal via-navy to-steel text-white py-12 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">FAQs</h1>
      </section>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setOpenIndex(null); }}
              className={`flex-1 sm:flex-initial px-6 py-3.5 border rounded-xl font-display text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === t.key
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <h4 className="text-sm font-medium text-slate-900 pr-4">{item.q}</h4>
                <i
                  className={`fas fa-chevron-down text-sm text-slate-300 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === idx ? 'max-h-60' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 pt-0 border-t border-slate-50">
                  <p className="text-sm text-slate-500 leading-relaxed pt-4">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
