import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import './Admin.css'

const AdminAnalytics = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      const [bookingsSnap, toolsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'tools')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'client'))),
      ])

      const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const tools = toolsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      const revenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0)
      const rentCount = bookings.filter(b => b.type === 'rent').length
      const buyCount = bookings.filter(b => b.type === 'buy').length

      const byTool = {}
      bookings.forEach(b => {
        if (!byTool[b.toolName]) byTool[b.toolName] = { count: 0, revenue: 0 }
        byTool[b.toolName].count++
        if (b.status === 'completed') byTool[b.toolName].revenue += (b.amount || 0)
      })

      const byStatus = {}
      bookings.forEach(b => {
        byStatus[b.status] = (byStatus[b.status] || 0) + 1
      })

      setData({ bookings, tools, totalUsers: usersSnap.size, revenue, rentCount, buyCount, byTool, byStatus })
    }
    load()
  }, [])

  if (!data) return <div className="admin-page"><p className="admin-loading">Loading analytics...</p></div>

  return (
    <>
      <Helmet><title>Analytics — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <h1>Analytics</h1>
          <p>Platform performance overview.</p>
        </div>

        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total Revenue', value: `K${data.revenue}` },
            { label: 'Total Bookings', value: data.bookings.length },
            { label: 'Rent Orders', value: data.rentCount },
            { label: 'Buy Orders', value: data.buyCount },
          ].map(s => (
            <div key={s.label} className="admin-stat">
              <span className="admin-stat__value">{s.value}</span>
              <span className="admin-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className='analytics-grid'>
          <div className="admin-section">
            <div className="admin-section__header"><h3>Bookings by Tool</h3></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Tool</th><th>Bookings</th><th>Revenue</th></tr></thead>
                <tbody>
                  {Object.entries(data.byTool).sort((a, b) => b[1].count - a[1].count).map(([name, stats]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td className="td-mono">{stats.count}</td>
                      <td className="td-mono">K{stats.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section__header"><h3>Bookings by Status</h3></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Status</th><th>Count</th></tr></thead>
                <tbody>
                  {Object.entries(data.byStatus).map(([status, count]) => (
                    <tr key={status}>
                      <td><span className={`badge badge--${status}`}>{status}</span></td>
                      <td className="td-mono">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminAnalytics
