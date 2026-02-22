export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal via-navy to-steel text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-4">ABOUT US</h1>
          <p className="text-white/80 leading-relaxed">
            AutoRevive is changing the way vehicles are bought and sold through our interactive online
            auction portal. A unique and seamless platform to find all types of vehicles from which to choose.
            A convenient way to place a bid at your own convenience suiting your budget. This platform is
            home to thousands of vehicles at competitive and flexible prices. A trustworthy portal with a
            wide selection of offers, which has something unique for everyone.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'fa-bullseye',
                title: 'Our Mission',
                desc: 'At AutoRevive Auction, we provide you with the best way to auction your pre-owned vehicles. Making the buying and selling process seamless and transparent.',
                color: 'text-accent',
                bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
              },
              {
                icon: 'fa-binoculars',
                title: 'Our Vision',
                desc: "We are changing the way pre-owned vehicles are auctioned. Building India's most trusted digital marketplace for automotive transactions.",
                color: 'text-green-500',
                bg: 'bg-gradient-to-br from-green-100 to-green-50',
              },
              {
                icon: 'fa-heart',
                title: 'Our Values',
                desc: 'Providing you with a unique experience and connecting you with genuine buyers and sellers. Trustworthy with customer focus in mind.',
                color: 'text-primary-500',
                bg: 'bg-gradient-to-br from-primary-100 to-primary-50',
              },
            ].map((v) => (
              <div
                key={v.title}
                className="card rounded-2xl p-8 text-center hover:shadow-elevated transition"
              >
                <div className={`w-14 h-14 ${v.bg} rounded-xl flex items-center justify-center mx-auto mb-5`}>
                  <i className={`fas ${v.icon} text-xl ${v.color}`}></i>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-3">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-12 bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Our Founder & CEO</h2>
          <p className="text-accent font-semibold text-sm mb-6">Leadership Team</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <p className="text-slate-500 leading-relaxed">
              With proven expertise and leadership of several years in the automobile industry, our
              founder is the driving force behind the Company. A passion for excellence, entrepreneurial
              spirit and focused vision, has built a capable team delivering outstanding performance. A
              business leader with a passion for cars will ensure a unique approach, business success, and
              customer delight.
            </p>
            <div className="text-center md:order-first lg:order-last">
              <div className="w-48 h-48 bg-gradient-to-br from-accent to-primary-400 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-user text-7xl text-white/80"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
