import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getDocument } from '../../firebase/firestore'
import { useCountdown } from '../../hooks/useCountdown'
import { formatDateTime } from '../../utils/dates'
import { IconCopy, IconEye, IconEyeOff, IconExternalLink, IconCheck } from '../../components/ui/Icons'
import toast from 'react-hot-toast'
import './OrderDetail.css'

const OrderDetail = () => {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocument('bookings', id).then(b => {
      setBooking(b)
      setLoading(false)
    })
  }, [id])

  // Poll for status changes (Firestore truth)
  useEffect(() => {
    const interval = setInterval(() => {
      getDocument('bookings', id).then(b => setBooking(b))
    }, 5000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) return <div className="page-loading">Loading order...</div>
  if (!booking) return <div className="page-empty"><p>Order not found.</p></div>

  const isRent = booking.type === 'rent'
  const isApproved = booking.status === 'confirmed' || booking.status === 'completed'
  const isPending = booking.status === 'pending'
  const isAwaiting = booking.status === 'awaiting_payment'
  const isRejected = booking.status === 'rejected'
  const isExpired = booking.status === 'expired'
  const isCancelled = booking.status === 'cancelled'

  return (
    <>
      <Helmet><title>Order #{id.slice(-8).toUpperCase()} — PNG Toolz</title></Helmet>
      <div className="order-detail">
        <div className="page-header">
          <div className="order-detail__title-row">
            <div>
              <h1>{booking.toolName}</h1>
              <span className="order-detail__id">Order #{id.slice(-8).toUpperCase()}</span>
            </div>
            <span className={`badge badge--${booking.status}`}>{booking.status.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="order-detail__layout">
          <div className="order-detail__main">

            {/* Credential block — shown only when approved */}
            {isApproved && booking.credentialUsername && (
              <div className="credential-block">
                <div className="credential-block__header">
                  <h3>Access Credentials</h3>
                  {booking.type === 'buy' && booking.toolOfficialUrl && (
                    <a href={booking.toolOfficialUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                      <IconExternalLink size={13} /> Official Site
                    </a>
                  )}
                </div>
                <CredentialField label="Username / Email" value={booking.credentialUsername} />
                <CredentialField label="Password" value={booking.credentialPassword} secret />
                {isRent && <RentalCountdown booking={booking} />}
              </div>
            )}

            {/* Awaiting payment */}
            {isAwaiting && (
              <div className="order-status-block order-status-block--warning">
                <h3>Awaiting Payment Submission</h3>
                <p>Your order was created but payment proof has not been submitted yet. The order may have expired if you did not complete payment within 10 minutes.</p>
                <Link to="/tools" className="btn btn--ghost btn--sm">Browse Tools</Link>
              </div>
            )}

            {/* Pending admin review */}
            {isPending && (
              <div className="order-status-block order-status-block--pending">
                <h3>Pending Admin Approval</h3>
                <p>Your payment proof has been submitted and is under review. You will be notified once approved or if more information is needed.</p>
                {booking.screenshotUrl && (
                  <a href={booking.screenshotUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">View Submitted Screenshot</a>
                )}
              </div>
            )}

            {/* Rejected */}
            {isRejected && (
              <div className="order-status-block order-status-block--rejected">
                <h3>Order Rejected</h3>
                <p>{booking.rejectReason || 'Your order was rejected. Please contact us for more information.'}</p>
                <Link to="/tools" className="btn btn--primary btn--sm">Place New Order</Link>
              </div>
            )}

            {/* Expired */}
            {isExpired && (
              <div className="order-status-block order-status-block--expired">
                <h3>Order Expired</h3>
                <p>This order expired because payment proof was not submitted within 10 minutes. You can place a new order.</p>
                <Link to={`/tools/${booking.toolSlug}`} className="btn btn--primary btn--sm">Order Again</Link>
              </div>
            )}

            {/* Cancelled */}
            {isCancelled && (
              <div className="order-status-block order-status-block--cancelled">
                <h3>Order Cancelled</h3>
                <p>{booking.cancelReason || 'This order has been cancelled.'}</p>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="order-detail__summary">
            <h3 className="order-section__title">Order Summary</h3>
            <div className="order-summary">
              {[
                ['Tool', booking.toolName],
                ['Type', isRent ? 'Rental' : 'License Purchase'],
                ['Duration', booking.durationLabel || '—'],
                ['Amount', `K${booking.amount}`],
                ['Payment', booking.paymentMethod],
                booking.targetIdentity && ['Activation Account', booking.targetIdentity],
                booking.startTime && ['Started', formatDateTime(booking.startTime)],
                booking.endTime && ['Ends', formatDateTime(booking.endTime)],
                ['Ordered', formatDateTime(booking.createdAt)],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} className="order-summary__row">
                  <span>{label}</span>
                  <span className={label === 'Amount' ? 'order-summary__price' : ''}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const CredentialField = ({ label, value, secret = false }) => {
  const [visible, setVisible] = useState(!secret)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="credential-field">
      <span className="credential-field__label">{label}</span>
      <div className="credential-field__row">
        <span className="credential-field__value">
          {secret && !visible ? '••••••••••' : value}
        </span>
        <div className="credential-field__actions">
          {secret && (
            <button className="cred-btn" onClick={() => setVisible(v => !v)} title={visible ? 'Hide' : 'Show'}>
              {visible ? <IconEyeOff size={14} /> : <IconEye size={14} />}
            </button>
          )}
          <button className="cred-btn" onClick={copy} title="Copy">
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

const RentalCountdown = ({ booking }) => {
  const { formatted, isWarning, isExpired } = useCountdown(booking.endTime)
  return (
    <div className={`rental-countdown ${isWarning ? 'rental-countdown--warning' : ''}`}>
      <span className="rental-countdown__label">{isExpired ? 'Session Ended' : isWarning ? 'Expiring Soon' : 'Time Remaining'}</span>
      <span className="rental-countdown__time">{formatted}</span>
    </div>
  )
}

export default OrderDetail
