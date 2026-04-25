import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useSettings } from '../../hooks/useSettings'
import './Home.css'

const Home = () => {
  const { data: site } = useSettings('site')
  const { data: contact } = useSettings('contact')
  const { data: seo } = useSettings('seo')
  const location = useLocation()

  // Handle anchor scroll from nav links
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location])

  return (
    <>
      <Helmet>
        <title>{seo?.title || 'PNG Toolz'}</title>
        <meta name="description" content={seo?.description || ''} />
        <meta name="keywords" content={seo?.keywords || ''} />
        <meta property="og:title" content={seo?.title || 'PNG Toolz'} />
        <meta property="og:description" content={seo?.description || ''} />
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "PNG Toolz",
          "description": seo?.description,
          "url": "https://pngtoolz.com",
          "address": { "@type": "PostalAddress", "addressCountry": "PG" },
          "areaServed": "Papua New Guinea",
          "serviceType": "Mobile Phone Servicing Software Rentals",
        })}</script>
      </Helmet>

      {site?.bannerActive && site?.banner && (
        <div className="site-banner">{site.banner}</div>
      )}

      {site?.isVisible_hero !== false && (
        <section id="hero" className="hero section">
          <div className="container hero__inner">
            <div className="hero__content">
              <span className="hero__eyebrow">Papua New Guinea's #1</span>
              <h1 className="hero__title">
                {site?.tagline || 'Professional Mobile Servicing Tools'}
              </h1>
              <p className="hero__subtitle">
                {site?.heroText || 'Rent or buy the software tools you need to repair, unlock and customize mobile devices.'}
              </p>
              <div className="hero__actions">
                <a href="/tools" className="btn btn--primary btn--lg">Browse Tools</a>
                <a href="/how-to-rent" className="btn btn--ghost btn--lg">How It Works</a>
              </div>
            </div>
            <div className="hero__visual">
              <div className="hero__device">
                <div className="hero__screen">
                  <div className="hero__screen-line" />
                  <div className="hero__screen-line hero__screen-line--short" />
                  <div className="hero__screen-line" />
                  <div className="hero__screen-line hero__screen-line--accent" />
                  <div className="hero__screen-line hero__screen-line--short" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {site?.isVisible_features !== false && (
        <section className="features section">
          <div className="container">
            <div className="section-header">
              <h2>Why PNG Toolz</h2>
              <p>Built for PNG technicians, by someone who understands the local market.</p>
            </div>
            <div className="features__grid">
              {FEATURES.map(f => (
                <div key={f.title} className="feature-card">
                  <span className="feature-card__icon">{f.icon}</span>
                  <h4 className="feature-card__title">{f.title}</h4>
                  <p className="feature-card__desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {site?.isVisible_howItWorks !== false && (
        <section className="how-it-works section">
          <div className="container">
            <div className="section-header">
              <h2>How It Works</h2>
              <p>Three steps to get the tool you need.</p>
            </div>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div key={s.title} className="step">
                  <span className="step__number">0{i + 1}</span>
                  <h4 className="step__title">{s.title}</h4>
                  <p className="step__desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {site?.isVisible_contact !== false && (
        <section id="contact" className="contact section">
          <div className="container">
            <div className="section-header">
              <h2>Contact Us</h2>
              <p>Get in touch for support or inquiries.</p>
            </div>
            <div className="contact__grid">
              {contact?.email && (
                <a href={`mailto:${contact.email}`} className="contact-item">
                  <span className="contact-item__label">Email</span>
                  <span className="contact-item__value">{contact.email}</span>
                </a>
              )}
              {contact?.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/\s/g, '')}`} className="contact-item" target="_blank" rel="noreferrer">
                  <span className="contact-item__label">WhatsApp</span>
                  <span className="contact-item__value">{contact.whatsapp}</span>
                </a>
              )}
              {contact?.facebook && (
                <a href={contact.facebook} className="contact-item" target="_blank" rel="noreferrer">
                  <span className="contact-item__label">Facebook</span>
                  <span className="contact-item__value">PNG Toolz</span>
                </a>
              )}
              {contact?.location && (
                <div className="contact-item">
                  <span className="contact-item__label">Location</span>
                  <span className="contact-item__value">{contact.location}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

const FEATURES = [
  { icon: '⚡', title: 'Instant Access', desc: 'Credentials delivered to your dashboard as soon as payment is confirmed.' },
  { icon: '🔒', title: 'Secure & Tracked', desc: 'Every session is logged. Your order history is always available.' },
  { icon: '📱', title: 'PNG Focused', desc: 'Priced in Kina. Payment via local banks and mobile money.' },
  { icon: '🛠', title: 'Pro-Grade Tools', desc: 'The same software used by repair shops across the region.' },
  { icon: '🕐', title: 'Flexible Durations', desc: 'Rent for 6, 12 or 24 hours. Only pay for what you need.' },
  { icon: '💬', title: 'Direct Support', desc: 'Reach us via WhatsApp or email. Real answers, fast.' },
]

const STEPS = [
  { title: 'Browse & Select', desc: 'Find the tool you need, pick your rental duration or buy a subscription.' },
  { title: 'Pay & Submit Proof', desc: 'Pay via bank transfer or mobile money, then submit your payment reference.' },
  { title: 'Get Your Credentials', desc: 'Once confirmed, your username and password appear in your dashboard.' },
]

export default Home
