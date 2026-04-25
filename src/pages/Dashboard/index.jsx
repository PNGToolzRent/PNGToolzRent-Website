import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { useMyBookings } from '../../hooks/useBookings'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDateTime } from '../../utils/dates'
import { useCountdown } from '../../hooks/useCountdown'
import { IconCopy, IconEye, IconEyeOff, IconCheck, IconClock } from '../../components/ui/Icons'
import { useState } from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const { profile } = useAuth()
  const { bookings, loading } = useMyBookings()
  const { notifications, unreadCount, markRead } = useNotifications()

  const activeBookings = bookings.filter(b => b.status === 'confirmed')
  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const awaitingBookings = bookings.filter(b => b.status === 'awaiting_payment')

  return (
    <>
      <Helmet><title>Dashboard — PNG Toolz</title></Helmet>
      <div className="dashboard">
        <div className="page-header">
          <h1>Welcome, {profile?.name}</h1>
          <p>Your active rentals, pending orders and recent activity.</p>
        </div>

        {/* Quick stats */}
        <div className="dashboard__stats">
          {[
            { label: 'Total Orders', value: bookings.length },
            { label: 'Active Rentals', value: activeBookings.length },
            { label: 'Awaiting Approval', value: pendingBookings.length },
            { label: 'Notifications', value: unreadCount },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-card__value">{s.value}</span>
              <span className="stat-card__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Active rentals — primary focus */}
        {activeBookings.length > 0 && (
          <div className="dashboard__section">
            <h3 className="dashboard__section-title">Active Rentals</h3>
            <div className="active-rentals-list">
              {activeBookings.map(b => <ActiveRentalCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {/* Awaiting payment */}
        {awaitingBookings.length > 0 && (
          <div className="dashboard__section">
            <h3 className="dashboard__section-title">Awaiting Payment Submission</h3>
            {awaitingBookings.map(b => (
              <div key={b.id} className="quick-action-card quick-action-card--warning">
                <div>
                  <span className="quick-action-card__tool">{b.toolName}</span>
                  <span className="quick-action-card__detail">{b.durationLabel || b.type}</span>
                </div>
                <Link to={`/dashboard/orders/${b.id}`} className="btn btn--primary btn--sm">View Order</Link>
              </div>
            ))}
          </div>
        )}

        {/* Pending orders */}
        {pendingBookings.length > 0 && (
          <div className="dashboard__section">
            <h3 className="dashboard__section-title">Pending Admin Approval</h3>
            {pendingBookings.map(b => (
              <div key={b.id} className="quick-action-card quick-action-card--pending">
                <div>
                  <span className="quick-action-card__tool">{b.toolName}</span>
                  <span className="quick-action-card__detail">{b.durationLabel || b.type} — K{b.amount}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className={`badge badge--pending`}>pending</span>
                  <Link to={`/dashboard/orders/${b.id}`} className="btn btn--ghost btn--sm">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard__bottom">
          {/* Recent orders */}
          <div className="dashboard__recent">
            <div className="dashboard__section-header">
              <h3 className="dashboard__section-title">Recent Orders</h3>
              <Link to="/dashboard/orders" className="dashboard__see-all">View All</Link>
            </div>
            {loading ? (
              <p className="dashboard__loading">Loading...</p>
            ) : bookings.length === 0 ? (
              <div className="dashboard__empty">
                <p>No orders yet.</p>
                <Link to="/tools" className="btn btn--primary btn--sm">Browse Tools</Link>
              </div>
            ) : (
              <div className="order-list">
                {bookings.slice(0, 5).map(b => (
                  <Link key={b.id} to={`/dashboard/orders/${b.id}`} className="order-row">
                    <div className="order-row__tool">{b.toolName}</div>
                    <div className="order-row__type">{b.type === 'rent' ? `Rental` : 'License'}</div>
                    <div className="order-row__duration">{b.durationLabel || '—'}</div>
                    <div className="order-row__price">K{b.amount}</div>
                    <span className={`badge badge--${b.status}`}>{b.status.replace('_', ' ')}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="dashboard__notifications">
            <h3 className="dashboard__section-title">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="dashboard__empty-text">No notifications.</p>
            ) : (
              <div className="notif-list">
                {notifications.slice(0, 6).map(n => (
                  <div key={n.id} className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`} onClick={() => markRead(n.id)}>
                    <span className="notif-item__title">{n.title}</span>
                    <span className="notif-item__msg">{n.message}</span>
                    <span className="notif-item__time">{formatDateTime(n.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const ActiveRentalCard = ({ booking }) => {
  const { formatted, isWarning, isExpired } = useCountdown(booking.endTime)
  const [passVisible, setPassVisible] = useState(false)
  const [copiedUser, setCopiedUser] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  const copy = (val, setCopied) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`active-rental-card ${isWarning ? 'active-rental-card--warning' : ''}`}>
      <div className="active-rental-card__header">
        <span className="active-rental-card__tool">{booking.toolName}</span>
        <span className={`badge badge--confirmed`}>active</span>
      </div>

      <div className="active-rental-card__creds">
        <div className="cred-row">
          <span className="cred-row__label">Username</span>
          <div className="cred-row__value-wrap">
            <span className="cred-row__value">{booking.credentialUsername}</span>
            <button className="cred-btn" onClick={() => copy(booking.credentialUsername, setCopiedUser)}>
              {copiedUser ? <IconCheck size={12} /> : <IconCopy size={12} />}
            </button>
          </div>
        </div>
        <div className="cred-row">
          <span className="cred-row__label">Password</span>
          <div className="cred-row__value-wrap">
            <span className="cred-row__value">{passVisible ? booking.credentialPassword : '••••••••'}</span>
            <button className="cred-btn" onClick={() => setPassVisible(v => !v)}>
              {passVisible ? <IconEyeOff size={12} /> : <IconEye size={12} />}
            </button>
            <button className="cred-btn" onClick={() => copy(booking.credentialPassword, setCopiedPass)}>
              {copiedPass ? <IconCheck size={12} /> : <IconCopy size={12} />}
            </button>
          </div>
        </div>
      </div>

      <div className="active-rental-card__footer">
        <div className={`timer-pill ${isWarning ? 'timer-pill--warning' : ''}`}>
          <IconClock size={12} />
          {isExpired ? 'Expired' : formatted}
        </div>
        <Link to={`/dashboard/orders/${booking.id}`} className="btn btn--ghost btn--sm">View Order</Link>
      </div>
    </div>
  )
}

export default Dashboard
