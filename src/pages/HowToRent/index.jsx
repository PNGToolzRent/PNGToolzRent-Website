import { Helmet } from 'react-helmet-async'
import { useSettings } from '../../hooks/useSettings'
import './HowToRent.css'

const HowToRent = () => {
  const { data: payment } = useSettings('payment')

  return (
    <>
      <Helmet>
        <title>How to Rent — PNG Toolz</title>
        <meta name="description" content="Step by step guide on how to rent mobile servicing tools on PNG Toolz. Pay via local PNG banks and mobile money." />
      </Helmet>

      <div className="how-to-rent">
        <section className="section">
          <div className="container">
            <span className="eyebrow">Getting Started</span>
            <h1>How to Rent or Buy</h1>
            <p className="how-to-rent__lead">Everything you need to know to place your first order.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="how-to-rent__section-title">Rental Process</h2>
            <div className="process-steps">
              {RENT_STEPS.map((s, i) => (
                <div key={i} className="process-step">
                  <div className="process-step__num">0{i + 1}</div>
                  <div className="process-step__body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="how-to-rent__section-title">Buy a Subscription</h2>
            <div className="process-steps">
              {BUY_STEPS.map((s, i) => (
                <div key={i} className="process-step">
                  <div className="process-step__num">0{i + 1}</div>
                  <div className="process-step__body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="how-to-rent__section-title">Payment Methods</h2>
            <p className="how-to-rent__payment-note">
              Account details and transfer instructions are shown only during checkout, once you have selected a tool and are ready to pay.
            </p>
            <div className="payment-methods payment-methods--public">
              {(payment?.methods || []).filter(m => m.active).map(m => (
                <div key={m.id} className="payment-method payment-method--public">
                  <h4 className="payment-method__name">{m.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="how-to-rent__section-title">FAQ</h2>
            <div className="faq">
              {FAQ.map((q, i) => (
                <div key={i} className="faq__item">
                  <h4 className="faq__question">{q.q}</h4>
                  <p className="faq__answer">{q.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

const RENT_STEPS = [
  { title: 'Create an Account', desc: 'Register with your name and email. Takes 30 seconds. Required to track your order and view credentials.' },
  { title: 'Browse & Select a Tool', desc: 'Go to Available Tools, pick the tool you need, and choose your rental duration — 6, 12 or 24 hours.' },
  { title: 'Check Slot Availability', desc: 'If a slot is available, you can proceed. If all slots are taken, you\'ll see when the next one is free.' },
  { title: 'Submit Your Order', desc: 'Choose your payment method and provide your preferred password. Your slot is held for a limited time.' },
  { title: 'Pay & Submit Proof', desc: 'Make your payment via bank transfer or mobile money, then upload your screenshot and reference number.' },
  { title: 'Get Your Credentials', desc: 'Once we verify your payment, your username and password will appear in your dashboard.' },
]

const BUY_STEPS = [
  { title: 'Create an Account', desc: 'Register with your name and email so we can process your order.' },
  { title: 'Select a Tool to Buy', desc: 'Browse Available Tools, find a tool with a Buy option, and submit your order.' },
  { title: 'Pay & Submit Proof', desc: 'Pay the full subscription price and upload your payment proof.' },
  { title: 'We Purchase for You', desc: 'We use your account email to purchase the subscription directly from the provider on your behalf.' },
  { title: 'Order Marked Complete', desc: 'Once purchased, your dashboard will show the order as completed. The subscription is linked to your email.' },
]

const FAQ = [
  { q: 'How long does approval take?', a: 'Usually within a few hours during business hours. We verify your payment manually and confirm as soon as possible.' },
  { q: 'What if my rental expires before I\'m done?', a: 'You can request an extension from your dashboard at any time during your active rental. Extensions follow the same payment flow.' },
  { q: 'What if all slots are taken?', a: 'The tool page will show the next available time. Slots auto-release after each session plus a cooldown period.' },
  { q: 'Can I cancel my booking?', a: 'Pending bookings can be cancelled by contacting us. Once we\'ve confirmed your payment and activated your access, cancellations are at our discretion.' },
  { q: 'What devices are supported?', a: 'Each tool page lists the supported devices and models. Check the tool description before booking.' },
  { q: 'Do you offer refunds?', a: 'We handle cancellations and refunds on a case-by-case basis. Contact us directly via WhatsApp or email.' },
]

export default HowToRent
