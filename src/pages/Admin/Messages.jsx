import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getDocs, addDoc, collection, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/dates'
import { createNotification, logActivity } from '../../firebase/firestore'
import toast from 'react-hot-toast'
import './Admin.css'

const AdminMessages = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ userId: '', userName: '', bookingId: '', title: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'users'))),
      getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'))),
    ]).then(([uSnap, mSnap]) => {
      setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setMessages(mSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const handleSend = async () => {
    if (!form.userId || !form.title || !form.message) return toast.error('Fill in all required fields')
    setSending(true)
    try {
      const selectedUser = users.find(u => u.id === form.userId)
      await addDoc(collection(db, 'messages'), {
        userId: form.userId,
        userName: selectedUser?.name,
        bookingId: form.bookingId || null,
        title: form.title,
        message: form.message,
        sentBy: user.uid,
        createdAt: serverTimestamp(),
      })
      await createNotification(form.userId, {
        type: 'admin_message',
        title: form.title,
        message: form.message,
        bookingId: form.bookingId || null,
      })
      await logActivity(user.uid, 'message_sent', { userId: form.userId, title: form.title })
      toast.success('Message sent')
      setModal(false)
      setForm({ userId: '', userName: '', bookingId: '', title: '', message: '' })
      const snap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')))
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { toast.error('Failed to send') }
    setSending(false)
  }

  return (
    <>
      <Helmet><title>Messages — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Messages</h1>
              <p>Send notifications to clients about their bookings or general updates.</p>
            </div>
            <button className="btn btn--primary btn--md" onClick={() => setModal(true)}>+ New Message</button>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="admin-empty">No messages sent yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>To</th><th>Title</th><th>Message</th><th>Booking</th><th>Sent</th></tr>
              </thead>
              <tbody>
                {messages.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.userName}</td>
                    <td>{m.title}</td>
                    <td className="td-muted" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                    <td className="td-mono td-muted">{m.bookingId ? `#${m.bookingId.slice(-6).toUpperCase()}` : '—'}</td>
                    <td className="td-mono td-muted">{formatDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <span className="modal__title">New Message</span>
              <button className="modal__close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal__body">
              <div className="form-field">
                <label className="form-label">Client *</label>
                <select className="form-select" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}>
                  <option value="">Select client...</option>
                  {users.filter(u => u.role === 'client').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Booking ID (optional)</label>
                <input className="form-input" placeholder="Leave blank for general message" value={form.bookingId} onChange={e => setForm(f => ({ ...f, bookingId: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Message *</label>
                <textarea className="form-input" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost btn--sm" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn--primary btn--sm" onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminMessages
