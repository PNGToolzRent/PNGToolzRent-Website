import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { listenToBookings, getDocument, logActivity } from '../../firebase/firestore'
import { approveBooking, rejectBooking, cancelBooking } from '../../utils/bookingLogic'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/dates'
import toast from 'react-hot-toast'
import './Admin.css'

const STATUSES = ['all', 'awaiting_payment', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled', 'expired']

const AdminBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [detailModal, setDetailModal] = useState(null)
  const [approveModal, setApproveModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)

  useEffect(() => {
    const unsub = listenToBookings(setBookings)
    return unsub
  }, [])

  useEffect(() => {
    let list = bookings
    if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.userName?.toLowerCase().includes(q) ||
        b.toolName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [bookings, statusFilter, search])

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selectAll = () => setSelected(filtered.map(b => b.id))
  const clearSelect = () => setSelected([])

  const handleBulkCancel = async () => {
    if (!window.confirm(`Cancel ${selected.length} booking(s)?`)) return
    for (const id of selected) {
      const b = bookings.find(x => x.id === id)
      if (b) await cancelBooking({ bookingId: id, slotId: b.slotId, userId: b.userId, reason: 'Cancelled by admin (bulk)', adminId: user.uid })
    }
    toast.success(`${selected.length} bookings cancelled`)
    clearSelect()
  }

  return (
    <>
      <Helmet><title>Bookings — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <h1>Bookings</h1>
          <p>Manage all rental and purchase orders. Approve or reject pending payments.</p>
        </div>

        <div className="admin-toolbar">
          <input className="admin-search" placeholder="Search by client, tool, email, order ID..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="admin-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
          </select>
          {selected.length > 0 && (
            <>
              <span className="td-mono td-muted">{selected.length} selected</span>
              <button className="btn btn--danger btn--sm" onClick={handleBulkCancel}>Cancel Selected</button>
              <button className="btn btn--ghost btn--sm" onClick={clearSelect}>Clear</button>
            </>
          )}
          {filtered.length > 0 && selected.length === 0 && (
            <button className="btn btn--ghost btn--sm" onClick={selectAll}>Select All</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">No bookings found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSelect()} checked={selected.length === filtered.length && filtered.length > 0} /></th>
                  <th>Client</th>
                  <th>Tool</th>
                  <th>Type / Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Proof</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} /></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{b.userName}</div>
                      <div className="td-mono td-muted" style={{ fontSize: 10 }}>{b.userEmail}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{b.toolName}</td>
                    <td>
                      <div className="td-mono" style={{ fontSize: 'var(--text-xs)' }}>{b.type === 'rent' ? 'Rental' : 'License'}</div>
                      <div className="td-mono td-muted" style={{ fontSize: 10 }}>{b.durationLabel || '—'}</div>
                    </td>
                    <td className="td-mono">K{b.amount}</td>
                    <td><span className={`badge badge--${b.status}`}>{b.status.replace('_', ' ')}</span></td>
                    <td>
                      {b.screenshotUrl
                        ? <a href={b.screenshotUrl} target="_blank" rel="noreferrer" className="admin-table__link">Screenshot</a>
                        : <span className="td-mono td-muted">—</span>
                      }
                    </td>
                    <td className="td-mono td-muted" style={{ fontSize: 11 }}>{formatDateTime(b.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => setDetailModal(b)}>View</button>
                        {b.status === 'pending' && (
                          <>
                            <button className="btn btn--primary btn--sm" onClick={() => setApproveModal(b)}>Approve</button>
                            <button className="btn btn--danger btn--sm" onClick={() => setRejectModal(b)}>Reject</button>
                          </>
                        )}
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <button className="btn btn--ghost btn--sm" onClick={async () => {
                            const reason = window.prompt('Cancellation reason (optional):') || ''
                            await cancelBooking({ bookingId: b.id, slotId: b.slotId, userId: b.userId, reason, adminId: user.uid })
                            toast.success('Booking cancelled')
                          }}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailModal && <BookingDetailModal booking={detailModal} onClose={() => setDetailModal(null)} />}
      {approveModal && (
        <ApproveModal
          booking={approveModal}
          adminId={user.uid}
          onClose={() => setApproveModal(null)}
          onDone={() => { setApproveModal(null); toast.success('Booking approved — credentials sent to client') }}
        />
      )}
      {rejectModal && (
        <RejectModal
          booking={rejectModal}
          adminId={user.uid}
          onClose={() => setRejectModal(null)}
          onDone={() => { setRejectModal(null); toast.success('Booking rejected — client notified') }}
        />
      )}
    </>
  )
}

const BookingDetailModal = ({ booking: b, onClose }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal__header">
        <span className="modal__title">Order #{b.id.slice(-8).toUpperCase()}</span>
        <button className="modal__close" onClick={onClose}>×</button>
      </div>
      <div className="modal__body">
        {[
          ['Client', b.userName],
          ['Email', b.userEmail],
          ['Tool', b.toolName],
          ['Type', b.type === 'rent' ? 'Rental' : 'License Purchase'],
          ['Duration', b.durationLabel || '—'],
          ['Amount', `K${b.amount}`],
          ['Status', b.status],
          ['Payment Method', b.paymentMethod],
          ['Receipt Text', b.receiptText || '—'],
          b.targetIdentity && ['Target Account', b.targetIdentity],
          b.additionalDetails && ['Additional Details', b.additionalDetails],
          b.credentialPassword && ['Client Password', b.credentialPassword],
          ['Ordered', formatDateTime(b.createdAt)],
        ].filter(Boolean).map(([label, val]) => (
          <div key={label} className="detail-row">
            <span className="detail-row__label">{label}</span>
            <span className="detail-row__value" style={{ maxWidth: 280, wordBreak: 'break-all' }}>{val}</span>
          </div>
        ))}
        {b.screenshotUrl && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <img src={b.screenshotUrl} alt="Payment proof" style={{ width: '100%', border: '1px solid var(--border-primary)' }} />
          </div>
        )}
      </div>
    </div>
  </div>
)

const ApproveModal = ({ booking, adminId, onClose, onDone }) => {
  const [credentialUsername, setCredentialUsername] = useState('')
  const [credentialPassword, setCredentialPassword] = useState(booking.credentialPassword || '')
  const [saving, setSaving] = useState(false)

  const handleApprove = async () => {
    if (!credentialUsername.trim()) return toast.error('Username is required')
    if (!credentialPassword.trim()) return toast.error('Password is required')
    setSaving(true)
    try {
      const tool = await getDocument('tools', booking.toolId)
      await approveBooking({
        bookingId: booking.id,
        slotId: booking.slotId,
        userId: booking.userId,
        type: booking.type,
        durationHours: booking.durationHours || 6,
        credentialUsername: credentialUsername.trim(),
        credentialPassword: credentialPassword.trim(),
        adminId,
      })
      onDone()
    } catch (e) {
      console.error(e)
      toast.error('Failed to approve booking')
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">Approve Order</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <div className="approve-context">
            <div className="detail-row"><span className="detail-row__label">Client</span><span className="detail-row__value">{booking.userName}</span></div>
            <div className="detail-row"><span className="detail-row__label">Tool</span><span className="detail-row__value">{booking.toolName}</span></div>
            <div className="detail-row"><span className="detail-row__label">Duration</span><span className="detail-row__value">{booking.durationLabel || '—'}</span></div>
            <div className="detail-row"><span className="detail-row__label">Type</span><span className="detail-row__value">{booking.type === 'rent' ? 'Rental' : 'License Purchase'}</span></div>
            {booking.targetIdentity && <div className="detail-row"><span className="detail-row__label">Target Account</span><span className="detail-row__value">{booking.targetIdentity}</span></div>}
            {booking.credentialPassword && <div className="detail-row"><span className="detail-row__label">Client Chosen Password</span><span className="detail-row__value" style={{fontFamily:'var(--font-mono)'}}>{booking.credentialPassword}</span></div>}
          </div>

          <div className="form-field">
            <label className="form-label">
              {booking.type === 'rent' ? 'Rental Account Username' : 'License Username / Email'}
            </label>
            <input className="form-input" placeholder={booking.type === 'rent' ? 'pngtoolz_chimera' : 'Account email or username'} value={credentialUsername} onChange={e => setCredentialUsername(e.target.value)} />
          </div>

          <div className="form-field">
            <label className="form-label">
              {booking.type === 'rent' ? 'Password (client chose this)' : 'License Password / Key'}
            </label>
            <input className="form-input" value={credentialPassword} onChange={e => setCredentialPassword(e.target.value)} placeholder="Password or license key" />
            {booking.type === 'rent' && booking.credentialPassword && (
              <span className="form-hint">Pre-filled from client's preferred password above</span>
            )}
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary btn--sm" onClick={handleApprove} disabled={saving}>
            {saving ? 'Approving...' : 'Approve & Send Credentials'}
          </button>
        </div>
      </div>
    </div>
  )
}

const RejectModal = ({ booking, adminId, onClose, onDone }) => {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleReject = async () => {
    if (!reason.trim()) return toast.error('Please provide a rejection reason')
    setSaving(true)
    try {
      await rejectBooking({
        bookingId: booking.id,
        slotId: booking.slotId,
        userId: booking.userId,
        reason: reason.trim(),
        adminId,
      })
      onDone()
    } catch (e) {
      toast.error('Failed to reject booking')
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">Reject Order</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Rejecting order for <strong>{booking.userName}</strong> — {booking.toolName}. The client will be notified with your reason.
          </p>
          <div className="form-field">
            <label className="form-label">Rejection Reason <span style={{color:'var(--status-cancelled)'}}>*</span></label>
            <textarea className="form-input" rows={4} placeholder="e.g. Payment screenshot was unclear. Please resubmit with a clearer image." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger btn--sm" onClick={handleReject} disabled={saving}>
            {saving ? 'Rejecting...' : 'Reject & Notify Client'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminBookings
