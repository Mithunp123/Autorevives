import { Helmet } from 'react-helmet-async';

const sections = [
  {
    id: 'introduction',
    icon: 'fa-book-open',
    title: '1. Introduction',
    content: [
      'Welcome to AutoRevive ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.',
      'By using AutoRevive\'s platform and services, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our services.',
    ],
  },
  {
    id: 'information-collected',
    icon: 'fa-database',
    title: '2. Information We Collect',
    content: [
      '**2.1 Personal Information** — We collect personal information that you voluntarily provide when you register on our platform, participate in auctions, submit inquiries, or subscribe to our newsletters.',
      'This may include: Full name and contact details, government-issued identification (Aadhaar, PAN Card), bank account details, business registration details, and photographs for KYC verification.',
      '**2.2 Automatically Collected Information** — When you access our platform, we automatically collect device information, IP address, location data, browsing behavior, and auction participation history.',
    ],
  },
  {
    id: 'use-of-information',
    icon: 'fa-cogs',
    title: '3. How We Use Your Information',
    items: [
      'Provide Services: Process your auction registrations, manage bids, and facilitate transactions',
      'Verify Identity: Complete KYC verification as required by law',
      'Communicate: Send auction updates, bid notifications, and important announcements',
      'Improve Services: Analyze usage patterns to enhance user experience',
      'Ensure Security: Detect and prevent fraud, unauthorized access, and illegal activities',
      'Legal Compliance: Meet regulatory requirements and respond to legal requests',
      'Marketing: Send promotional communications (with your consent)',
    ],
  },
  {
    id: 'information-sharing',
    icon: 'fa-share-nodes',
    title: '4. Information Sharing',
    content: [
      'We may share your information with service providers (payment processing, KYC verification, communication services, cloud hosting), financial institutions (banks and NBFCs who are sellers on our platform), and legal authorities when required by law.',
    ],
    highlight: 'We Never Sell Your Data: AutoRevive does not sell, rent, or trade your personal information to third parties for marketing purposes.',
  },
  {
    id: 'data-security',
    icon: 'fa-lock',
    title: '5. Data Security',
    items: [
      'Encryption: All data transmission uses SSL/TLS encryption',
      'Secure Storage: Data is stored on encrypted servers with restricted access',
      'Access Controls: Only authorized personnel can access personal data',
      'Regular Audits: We conduct periodic security assessments',
      'Incident Response: We have procedures to handle data breaches',
    ],
    content: ['While we strive to protect your information, no method of transmission over the Internet is 100% secure.'],
  },
  {
    id: 'cookies',
    icon: 'fa-cookie-bite',
    title: '6. Cookies & Tracking',
    content: ['We use cookies and similar technologies to keep you logged in, remember your preferences, analyze website traffic, and deliver relevant advertisements. You can control cookies through your browser settings.'],
    table: [
      ['Essential', 'Required for platform functionality'],
      ['Performance', 'Help us understand how visitors use our site'],
      ['Functional', 'Remember your preferences'],
      ['Marketing', 'Track advertising effectiveness'],
    ],
  },
  {
    id: 'your-rights',
    icon: 'fa-user-shield',
    title: '7. Your Rights',
    items: [
      'Access: Request a copy of your personal data',
      'Correction: Request correction of inaccurate data',
      'Deletion: Request deletion of your data (subject to legal retention)',
      'Portability: Request transfer of your data to another service',
      'Objection: Object to processing of your data for marketing',
      'Withdraw Consent: Withdraw previously given consent',
    ],
  },
  {
    id: 'data-retention',
    icon: 'fa-clock-rotate-left',
    title: '8. Data Retention',
    items: [
      'Account Data: As long as your account is active, plus 7 years after closure',
      'Transaction Records: 8 years as per regulatory requirements',
      'KYC Documents: 5 years after relationship ends',
      'Marketing Data: Until you unsubscribe or withdraw consent',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <Helmet>
        <title>Privacy Policy - AutoRevive</title>
        <meta name="description" content="Read AutoRevive's privacy policy to understand how we collect, use, and protect your personal information." />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0f1b3d] to-slate-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-white/50 max-w-xl">How we collect, use, and protect your personal information.</p>
          <p className="mt-2 text-xs text-white/30"><i className="far fa-calendar-alt mr-1"></i> Last updated: January 2025</p>
        </div>
      </section>

      {/* ═══════ CONTENT ═══════ */}
      <div className="bg-slate-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar Nav */}
          <nav className="hidden lg:block sticky top-24 self-start">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h4 className="font-extrabold text-sm text-slate-900 mb-4 font-display">Contents</h4>
              <ul className="space-y-1.5 list-none m-0 p-0">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-blue-50"
                    >
                      <i className={`fas ${s.icon} text-xs text-slate-400 w-4 text-center`}></i>
                      <span className="truncate">{s.title}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#contact" className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-blue-50">
                    <i className="fas fa-envelope text-xs text-slate-400 w-4 text-center"></i>
                    <span>9. Contact Us</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="space-y-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <i className={`fas ${s.icon} text-white text-sm`}></i>
                  </div>
                  <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">{s.title}</h2>
                </div>
                {s.content?.map((p, i) => (
                  <p key={i} className="text-sm text-slate-500 leading-relaxed mb-3">{p}</p>
                ))}
                {s.items && (
                  <ul className="space-y-2.5 mt-4">
                    {s.items.map((it, i) => (
                      <li key={i} className="text-sm text-slate-500 flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="fas fa-check text-blue-500 text-[10px]"></i>
                        </span>
                        <span className="leading-relaxed">{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.highlight && (
                  <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-5 mt-5">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-shield-halved text-white"></i>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{s.highlight}</p>
                  </div>
                )}
                {s.table && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mt-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                          <th className="px-5 py-3 text-left font-bold text-slate-900 text-xs uppercase tracking-wider">Cookie Type</th>
                          <th className="px-5 py-3 text-left font-bold text-slate-900 text-xs uppercase tracking-wider">Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.map(([type, purpose]) => (
                          <tr key={type} className="border-t border-slate-100">
                            <td className="px-5 py-3 text-slate-700 font-semibold">{type}</td>
                            <td className="px-5 py-3 text-slate-500">{purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            {/* Contact Section */}
            <section id="contact" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <i className="fas fa-envelope text-white text-sm"></i>
                </div>
                <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">9. Contact Us</h2>
              </div>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact:
              </p>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 p-6">
                <h4 className="font-extrabold text-slate-900 mb-1 font-display">Data Protection Officer</h4>
                <p className="font-semibold text-sm text-slate-600 mb-4">AutoRevive Private Limited</p>
                <div className="space-y-3 text-sm text-slate-500">
                  <p className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 flex-shrink-0">
                      <i className="fas fa-location-dot text-blue-500 text-xs"></i>
                    </span>
                    123 Business Park, Andheri East, Mumbai - 400069
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 flex-shrink-0">
                      <i className="fas fa-envelope text-blue-500 text-xs"></i>
                    </span>
                    privacy@autorevive.in
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 flex-shrink-0">
                      <i className="fas fa-phone text-blue-500 text-xs"></i>
                    </span>
                    +91 8828820306
                  </p>
                </div>
              </div>
            </section>

            {/* Changes Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <i className="fas fa-pen-to-square text-white text-sm"></i>
                </div>
                <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">10. Changes to This Policy</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes
                by posting a notice on our website or sending you an email. Your continued use of our services
                after any changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
