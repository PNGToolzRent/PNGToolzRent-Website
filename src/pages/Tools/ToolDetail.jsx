import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useToolBySlug } from '../../hooks/useTools'
import { useAuth } from '../../context/AuthContext'
import { getSlotsByTool } from '../../firebase/firestore'
import { formatDate } from '../../utils/dates'
import { IconExternalLink } from '../../components/ui/Icons'
import ReviewSection from '../../components/tools/ReviewSection'
import './Tools.css'

const ToolDetail = () => {
  const { slug } = useParams()
  const { tool, loading } = useToolBySlug(slug)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [slots, setSlots] = useState([])
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (tool?.id) getSlotsByTool(tool.id).then(setSlots)
  }, [tool?.id])

  if (loading) return <div className="page-loading">Loading...</div>
  if (!tool) return <div className="page-empty container section"><h2>Tool not found.</h2></div>

  const availableSlots = slots.filter(s => s.status === 'available')
  const canRent = tool.type?.includes('rent')
  const canBuy = tool.type?.includes('buy')
  const hasSubscriptionTiers = tool.subscriptionTiers?.length > 0

  const handleOrder = (type) => {
    if (!isAuthenticated) {
      navigate(`/auth?mode=register&redirect=/tools/${slug}&orderType=${type}`)
    } else {
      navigate(`/dashboard/orders/new?tool=${tool.id}&type=${type}`)
    }
  }

  return (
    <>
      <Helmet>
        <title>{tool.name} — PNG Toolz</title>
        <meta name="description" content={tool.description?.slice(0, 155)} />
      </Helmet>

      <div className="tool-detail">
        <div className="container">
          <div className="tool-detail__layout">
            {/* Left */}
            <div className="tool-detail__left">
              <div className="tool-detail__gallery">
                <div className="tool-detail__main-image">
                  {tool.images?.[activeImage]
                    ? <img src={tool.images[activeImage]} alt={tool.name} />
                    : <div className="tool-detail__no-image"><span style={{fontFamily:'var(--font-mono)',color:'var(--text-muted)',fontSize:'var(--text-sm)'}}>No image</span></div>
                  }
                </div>
                {tool.images?.length > 1 && (
                  <div className="tool-detail__thumbs">
                    {tool.images.map((img, i) => (
                      <button key={i} className={`tool-detail__thumb ${activeImage === i ? 'tool-detail__thumb--active' : ''}`} onClick={() => setActiveImage(i)}>
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="tool-detail__info">
                <h3>Supported Devices</h3>
                <p>{tool.supportedDevices || 'See official documentation for supported devices.'}</p>
              </div>

              <div className="tool-detail__info">
                <h3>Description</h3>
                <p>{tool.description}</p>
              </div>
            </div>

            {/* Right — booking panel */}
            <div className="tool-detail__right">
              <div className="tool-detail__tags">
                {canRent && <span className="tool-tag tool-tag--rent">Rental</span>}
                {canBuy && <span className="tool-tag tool-tag--buy">License</span>}
              </div>

              <h1 className="tool-detail__name">{tool.name}</h1>

              {/* Official site */}
              {tool.officialSiteEnabled && tool.officialSiteUrl && (
                <a href={tool.officialSiteUrl} target="_blank" rel="noreferrer" className="official-site-btn">
                  <IconExternalLink size={13} />
                  Visit Official Site
                </a>
              )}

              {/* Slot availability */}
              {canRent && (
                <div className="slot-status">
                  <span className="slot-status__label">Slot Availability</span>
                  <div className="slot-status__slots">
                    {slots.length === 0 && <p className="slot-status__none">No slots configured.</p>}
                    {slots.map(slot => <SlotIndicator key={slot.id} slot={slot} />)}
                  </div>
                </div>
              )}

              {/* Rent section */}
              {canRent && (
                <div className="tool-detail__pricing">
                  <h3>Rental Pricing</h3>
                  <div className="pricing-options">
                    {(tool.rentPricing || []).map(p => (
                      <div key={p.hours} className="pricing-option">
                        <span className="pricing-option__label">{p.label}</span>
                        <span className="pricing-option__price">K{p.price}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn--primary btn--lg btn--full"
                    onClick={() => handleOrder('rent')}
                    disabled={availableSlots.length === 0}
                  >
                    {availableSlots.length === 0 ? 'No Slots Available' : 'Rent This Tool'}
                  </button>
                  {availableSlots.length === 0 && slots.length > 0 && (
                    <p className="tool-detail__unavailable-note">All slots are currently in use. Check back soon.</p>
                  )}
                </div>
              )}

              {/* Buy / License section */}
              {canBuy && (
                <div className="tool-detail__buy">
                  <h3>License Purchase</h3>
                  {hasSubscriptionTiers ? (
                    <div className="pricing-options">
                      {tool.subscriptionTiers.map((tier, i) => (
                        <div key={i} className="pricing-option">
                          <span className="pricing-option__label">{tier.label}</span>
                          <span className="pricing-option__price">K{tier.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="tool-detail__buy-price">K{tool.buyPrice}</p>
                  )}
                  <p className="tool-detail__buy-note">
                    We purchase the license using your account details. You will provide the target account during checkout.
                  </p>
                  <button className="btn btn--ghost btn--lg btn--full" onClick={() => handleOrder('buy')}>
                    Purchase License
                  </button>
                </div>
              )}
            </div>
          </div>

          <ReviewSection toolId={tool.id} toolName={tool.name} />
        </div>
      </div>
    </>
  )
}

const SlotIndicator = ({ slot }) => {
  const map = {
    available: { label: 'Available', cls: 'slot--available' },
    held:      { label: 'Held',      cls: 'slot--held' },
    active:    { label: 'In Use',    cls: 'slot--active' },
    cooldown:  { label: 'Cooldown',  cls: 'slot--cooldown' },
  }
  const s = map[slot.status] || { label: slot.status, cls: '' }
  return (
    <div className={`slot-indicator ${s.cls}`}>
      <span className="slot-indicator__dot" />
      <span className="slot-indicator__label">{slot.slotLabel}</span>
      <span className="slot-indicator__status">{s.label}</span>
    </div>
  )
}

export default ToolDetail
