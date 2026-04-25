import { Helmet } from 'react-helmet-async'
import { useSettings } from '../../hooks/useSettings'
import './About.css'

const About = () => {
  const { data: site } = useSettings('site')
  const { data: contact } = useSettings('contact')

  return (
    <>
      <Helmet>
        <title>About Us — PNG Toolz</title>
        <meta name="description" content="Learn about PNG Toolz — Papua New Guinea's mobile servicing software rental platform." />
      </Helmet>

      <div className="about">
        <section className="about__hero section">
          <div className="container">
            <span className="eyebrow">About PNG Toolz</span>
            <h1>Built for PNG Technicians</h1>
            <p className="about__lead">
              {site?.aboutText || 'PNG Toolz is Papua New Guinea\'s first dedicated platform for mobile phone technicians.'}
            </p>
          </div>
        </section>

        <section className="about__mission section">
          <div className="container about__grid">
            <div className="about__block">
              <h3>Our Mission</h3>
              <p>To make professional-grade mobile servicing software accessible and affordable for every technician in Papua New Guinea — without the barrier of expensive subscriptions or overseas shipping.</p>
            </div>
            <div className="about__block">
              <h3>Who It's For</h3>
              <p>Mobile phone repair shops, freelance technicians, and anyone who needs occasional access to unlocking, firmware, or IMEI tools without owning a full licence.</p>
            </div>
            <div className="about__block">
              <h3>How We Operate</h3>
              <p>We own and maintain the tool accounts. You rent access for the time you need, pay through local payment methods, and get credentials directly in your dashboard once confirmed.</p>
            </div>
            <div className="about__block">
              <h3>Local First</h3>
              <p>Every price is in Kina. Every payment method is local — BSP, Kina Bank, MoniPlus. No USD, no international transfers, no hassle.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About
