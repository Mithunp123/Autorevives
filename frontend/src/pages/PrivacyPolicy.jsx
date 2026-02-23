// Font Awesome icons used via CDN

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: [
      'Welcome to AutoRevive ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.',
      'By using AutoRevive\'s platform and services, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our services.',
    ],
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    content: [
      '**2.1 Personal Information** — We collect personal information that you voluntarily provide when you register on our platform, participate in auctions, submit inquiries, or subscribe to our newsletters.',
      'This may include: Full name and contact details, government-issued identification (Aadhaar, PAN Card), bank account details, business registration details, and photographs for KYC verification.',
      '**2.2 Automatically Collected Information** — When you access our platform, we automatically collect device information, IP address, location data, browsing behavior, and auction participation history.',
    ],
  },
  {
    id: 'use-of-information',
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
    title: '4. Information Sharing',
    content: [
      'We may share your information with service providers (payment processing, KYC verification, communication services, cloud hosting), financial institutions (banks and NBFCs who are sellers on our platform), and legal authorities when required by law.',
    ],
    highlight: 'We Never Sell Your Data: AutoRevive does not sell, rent, or trade your personal information to third parties for marketing purposes.',
  },
  {
    id: 'data-security',
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal via-navy to-steel text-white py-12 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-white/80 text-sm">Last updated: January 2025</p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar nav */}
        <nav className="hidden lg:block sticky top-24 self-start">
          <h4 className="font-semibold text-sm text-slate-900 mb-3">Contents</h4>
          <ul className="space-y-2 list-none m-0 p-0">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-slate-400 hover:text-accent transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
            <li><a href="#contact" className="text-sm text-slate-400 hover:text-accent">9. Contact Us</a></li>
          </ul>
        </nav>

        {/* Content */}
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="font-display text-lg font-bold text-slate-900 mb-3">{s.title}</h2>
              {s.content?.map((p, i) => (
                <p key={i} className="text-sm text-slate-500 leading-relaxed mb-3">{p}</p>
              ))}
              {s.items && (
                <ul className="space-y-2 mt-3">
                  {s.items.map((it, i) => (
                    <li key={i} className="text-sm text-slate-500 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              )}
              {s.highlight && (
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                  <i className="fas fa-shield-halved text-lg text-accent flex-shrink-0 mt-0.5"></i>
                  <p className="text-sm text-slate-700 font-medium">{s.highlight}</p>
                </div>
              )}
              {s.table && (
                <div className="card overflow-hidden mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-2.5 text-left font-semibold text-slate-900">Cookie Type</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-slate-900">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.map(([type, purpose]) => (
                        <tr key={type} className="border-t border-slate-50">
                          <td className="px-4 py-2.5 text-slate-700 font-medium">{type}</td>
                          <td className="px-4 py-2.5 text-slate-400">{purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {/* Contact Section */}
          <section id="contact">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3">9. Contact Us</h2>
            <p className="text-sm text-slate-500 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact:
            </p>
            <div className="card p-6">
              <h4 className="font-semibold text-slate-900 mb-1">Data Protection Officer</h4>
              <p className="font-medium text-sm text-slate-700 mb-3">AutoRevive Private Limited</p>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="flex items-center gap-2"><i className="fas fa-location-dot text-sm text-accent"></i> 123 Business Park, Andheri East, Mumbai - 400069</p>
                <p className="flex items-center gap-2"><i className="fas fa-envelope text-sm text-accent"></i> privacy@autorevive.in</p>
                <p className="flex items-center gap-2"><i className="fas fa-phone text-sm text-accent"></i> +91 8828820306</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              by posting a notice on our website or sending you an email. Your continued use of our services
              after any changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
