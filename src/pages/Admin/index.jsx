import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { formatDateTime } from '../../utils/dates'
import { Link } from 'react-router-dom'
import './Admin.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, completed: 0, users: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [allBookings, pendingSnap, activeSnap, completedSnap, usersSnap, recentSnap] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(query(collection(db, 'bookings'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'bookings'), where('status', '==', 'confirmed'))),
        getDocs(query(collection(db, 'bookings'), where('status', '==', 'completed'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'client'))),
        getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(8))),
      ])
      setStats({
        total: allBookings.size,
        pending: pendingSnap.size,
        active: activeSnap.size,
        completed: completedSnap.size,
        users: usersSnap.size,
      })
      setRecentBookings(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Helmet><title>Admin Dashboard — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Overview of all platform activity.</p>
        </div>

        <div className="admin-stats">
          {[
            { label: 'Total Orders', value: stats.total, color: '' },
            { label: 'Pending', value: stats.pending, color: 'pending' },
            { label: 'Active Rentals', value: stats.active, color: 'confirmed' },
            { label: 'Completed', value: stats.completed, color: 'completed' },
            { label: 'Clients', value: stats.users, color: '' },
          ].map(s => (
            <div key={s.label} className="admin-stat">
              <span className={`admin-stat__value ${s.color ? `admin-stat__value--${s.color}` : ''}`}>{s.value}</span>
              <span className="admin-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="admin-section">
          <div className="admin-section__header">
            <h3>Recent Bookings</h3>
            <Link to="/admin/bookings" className="dashboard__see-all">View All</Link>
          </div>
          {loading ? <p className="admin-loading">Loading...</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Tool</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.userName}</td>
                      <td>{b.toolName}</td>
                      <td className="td-mono">{b.type}</td>
                      <td className="td-mono">K{b.amount}</td>
                      <td><span className={`badge badge--${b.status}`}>{b.status}</span></td>
                      <td className="td-mono td-muted">{formatDateTime(b.createdAt)}</td>
                      <td><Link to={`/admin/bookings`} className="admin-table__link">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
