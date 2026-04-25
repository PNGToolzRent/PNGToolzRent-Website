import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useMyBookings } from '../../hooks/useBookings'
import { formatDateTime } from '../../utils/dates'

const OrderHistory = () => {
  const { bookings, loading } = useMyBookings()

  return (
    <>
      <Helmet><title>My Orders — PNG Toolz</title></Helmet>
      <div className="order-history">
        <div className="page-header">
          <h1>My Orders</h1>
          <p>All your rental and purchase history.</p>
        </div>

        {loading ? (
          <p className="dashboard__loading">Loading orders...</p>
        ) : bookings.length === 0 ? (
          <div className="dashboard__empty">
            <p>No orders yet.</p>
            <Link to="/tools" className="btn btn--primary btn--sm">Browse Tools</Link>
          </div>
        ) : (
          <div className="order-list">
            {bookings.map(b => (
              <Link key={b.id} to={`/dashboard/orders/${b.id}`} className="order-row">
                <div className="order-row__tool">{b.toolName}</div>
                <div className="order-row__type">{b.type === 'rent' ? `Rent · ${b.durationLabel}` : 'Buy'}</div>
                <div className="order-row__price">K{b.amount}</div>
                <span className={`badge badge--${b.status}`}>{b.status}</span>
                <span className="order-row__date">{formatDateTime(b.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default OrderHistory
