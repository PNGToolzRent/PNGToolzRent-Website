import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getDocument, getSlotsByTool, createSlot, updateSlot, deleteSlot, logActivity } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/dates'
import toast from 'react-hot-toast'
import './Admin.css'

const STATUS_OPTIONS = ['available', 'held', 'active', 'cooldown']

const AdminSlots = () => {
  const { toolId } = useParams()
  const { user } = useAuth()
  const [tool, setTool] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [t, s] = await Promise.all([getDocument('tools', toolId), getSlotsByTool(toolId)])
    setTool(t)
    setSlots(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [toolId])

  const handleAdd = async () => {
    if (!newLabel.trim()) return toast.error('Enter a slot label')
    setSaving(true)
    try {
      await createSlot({ toolId, toolName: tool.name, slotLabel: newLabel.trim() })
      await logActivity(user.uid, 'slot_created', { toolId, slotLabel: newLabel })
      toast.success('Slot added')
      setNewLabel('')
      setShowAdd(false)
      load()
    } catch { toast.error('Failed to add slot') }
    setSaving(false)
  }

  const handleDelete = async (slot) => {
    if (!window.confirm(`Delete slot "${slot.slotLabel}"?`)) return
    try {
      await deleteSlot(slot.id)
      await logActivity(user.uid, 'slot_deleted', { slotId: slot.id, toolId })
      toast.success('Slot deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const handleStatusChange = async (slot, status) => {
    await updateSlot(slot.id, { status })
    await logActivity(user.uid, 'slot_status_changed', { slotId: slot.id, status })
    toast.success('Status updated')
    load()
  }

  if (loading) return <div className="admin-page"><p className="admin-loading">Loading...</p></div>

  return (
    <>
      <Helmet><title>Slots — {tool?.name} — Admin</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Link to="/admin/tools" className="admin-back-link">← Back to Tools</Link>
              <h1>{tool?.name} — Slots</h1>
              <p>Manage rental account slots for this tool.</p>
            </div>
            <button className="btn btn--primary btn--md" onClick={() => setShowAdd(true)}>+ Add Slot</button>
          </div>
        </div>

        {showAdd && (
          <div className="slot-add-form">
            <input
              className="form-input"
              placeholder="Slot label e.g. Account #4"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            <button className="btn btn--primary btn--sm" onClick={handleAdd} disabled={saving}>
              {saving ? 'Adding...' : 'Add'}
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        )}

        {slots.length === 0 ? (
          <div className="admin-empty">No slots yet. Add a slot to enable bookings for this tool.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Current Booking</th>
                  <th>Held Until</th>
                  <th>Available At</th>
                  <th>Change Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.slotLabel}</td>
                    <td><span className={`slot-status-badge slot-status-badge--${s.status}`}>{s.status}</span></td>
                    <td className="td-mono td-muted">{s.currentBookingId || '—'}</td>
                    <td className="td-mono td-muted">{s.heldUntil ? formatDate(s.heldUntil, 'dd MMM HH:mm') : '—'}</td>
                    <td className="td-mono td-muted">{s.availableAt ? formatDate(s.availableAt, 'dd MMM HH:mm') : '—'}</td>
                    <td>
                      <select className="admin-filter" value={s.status} onChange={e => handleStatusChange(s, e.target.value)}>
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn--danger btn--sm" onClick={() => handleDelete(s)}>Delete</button>
                    </td>
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

export default AdminSlots
