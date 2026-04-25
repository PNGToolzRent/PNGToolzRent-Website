import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { formatDateTime } from '../../utils/dates'
import './Admin.css'

const ACTION_LABELS = {
  booking_confirmed: 'Booking Confirmed',
  booking_cancelled: 'Booking Cancelled',
  booking_completed: 'Booking Completed',
  booking_extended: 'Booking Extended',
  tool_created: 'Tool Created',
  tool_updated: 'Tool Updated',
  tool_deleted: 'Tool Deleted',
  tool_visibility_changed: 'Tool Visibility Changed',
  slot_created: 'Slot Created',
  slot_deleted: 'Slot Deleted',
  slot_status_changed: 'Slot Status Changed',
  review_approved: 'Review Approved',
  review_deleted: 'Review Deleted',
  message_sent: 'Message Sent',
  settings_updated: 'Settings Updated',
}

const AdminActivityLog = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocs(query(collection(db, 'activityLog'), orderBy('createdAt', 'desc'), limit(200)))
      .then(snap => {
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Helmet><title>Activity Log — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <h1>Activity Log</h1>
          <p>Every admin action recorded here. Last 200 entries.</p>
        </div>

        {loading ? <p className="admin-loading">Loading log...</p> : logs.length === 0 ? (
          <div className="admin-empty">No activity yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Action</th><th>Details</th><th>Time</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className="log-action">{ACTION_LABELS[log.action] || log.action}</span>
                    </td>
                    <td className="td-mono td-muted" style={{ fontSize: 11 }}>
                      {Object.entries(log.details || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </td>
                    <td className="td-mono td-muted">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminActivityLog
