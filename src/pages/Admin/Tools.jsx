import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getTools, createTool, updateTool, deleteTool, logActivity } from '../../firebase/firestore'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { generateUniqueSlug } from '../../utils/slug'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import './Admin.css'

const AdminTools = () => {
  const { user } = useAuth()
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = () => getTools({}).then(data => { setTools(data); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleSave = async (data) => {
    try {
      if (modal === 'add') {
        const slug = await generateUniqueSlug('tools', data.name)
        await createTool({ ...data, slug })
        await logActivity(user.uid, 'tool_created', { toolName: data.name })
        toast.success('Tool created')
      } else {
        await updateTool(modal.id, data)
        await logActivity(user.uid, 'tool_updated', { toolId: modal.id })
        toast.success('Tool updated')
      }
      setModal(null)
      load()
    } catch (e) {
      toast.error('Failed to save tool')
    }
  }

  const handleDelete = async (tool) => {
    if (!window.confirm(`Delete "${tool.name}"?`)) return
    setDeleting(tool.id)
    try {
      await deleteTool(tool.id)
      await logActivity(user.uid, 'tool_deleted', { toolName: tool.name })
      toast.success('Tool deleted')
      load()
    } catch { toast.error('Failed to delete') }
    setDeleting(null)
  }

  const handleToggleVisible = async (tool) => {
    await updateTool(tool.id, { isVisible: !tool.isVisible })
    toast.success(`Tool ${tool.isVisible ? 'hidden' : 'shown'}`)
    load()
  }

  return (
    <>
      <Helmet><title>Tools — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <div className='page-header__row'>
            <div><h1>Tools</h1><p>Manage all tools. Set rental slots, subscription tiers and official site links.</p></div>
            <button className="btn btn--primary btn--md" onClick={() => setModal('add')}>+ Add Tool</button>
          </div>
        </div>

        {loading ? <p className="admin-loading">Loading...</p> : tools.length === 0 ? (
          <div className="admin-empty">No tools yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Type</th><th>Rent From</th><th>Buy / Tiers</th>
                  <th>Visible</th><th>Official Site</th><th>Slots</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td className="td-mono">{t.type?.join(', ')}</td>
                    <td className="td-mono">{t.rentPricing?.length ? `K${Math.min(...t.rentPricing.map(p => p.price))}` : '—'}</td>
                    <td className="td-mono">
                      {t.subscriptionTiers?.length ? `${t.subscriptionTiers.length} tier(s)` : t.buyPrice ? `K${t.buyPrice}` : '—'}
                    </td>
                    <td>
                      <button className={`toggle-btn ${t.isVisible ? 'toggle-btn--on' : 'toggle-btn--off'}`} onClick={() => handleToggleVisible(t)}>
                        {t.isVisible ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <button className={`toggle-btn ${t.officialSiteEnabled ? 'toggle-btn--on' : 'toggle-btn--off'}`} onClick={async () => {
                        await updateTool(t.id, { officialSiteEnabled: !t.officialSiteEnabled })
                        load()
                      }}>
                        {t.officialSiteEnabled ? 'On' : 'Off'}
                      </button>
                    </td>
                    <td><Link to={`/admin/tools/${t.id}/slots`} className="admin-table__link">Manage</Link></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => setModal(t)}>Edit</button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(t)} disabled={deleting === t.id}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <ToolModal tool={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
    </>
  )
}

const ToolModal = ({ tool, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: tool || {
      name: '', description: '', supportedDevices: '', isVisible: true,
      officialSiteUrl: '', officialSiteEnabled: false,
      holdDurationMinutes: 30, cooldownMinutes: 15, paymentExpiryMinutes: 120,
      images: [], coverImageIndex: 0,
    }
  })

  const [images, setImages] = useState(tool?.images || [])
  const [coverIdx, setCoverIdx] = useState(tool?.coverImageIndex || 0)
  const [uploading, setUploading] = useState(false)
  const [types, setTypes] = useState(tool?.type || [])
  const [rentPricing, setRentPricing] = useState(tool?.rentPricing || [
    { hours: 6, price: 20, label: '6 Hours' },
    { hours: 12, price: 28, label: '12 Hours' },
    { hours: 24, price: 40, label: '24 Hours' },
  ])
  const [subscriptionTiers, setSubscriptionTiers] = useState(tool?.subscriptionTiers || [
    { label: '1 Month', price: 0 },
    { label: '3 Months', price: 0 },
    { label: '6 Months', price: 0 },
  ])

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const results = await Promise.all(files.map(f => uploadToCloudinary(f, 'pngtoolz/tools')))
      setImages(prev => [...prev, ...results.map(r => r.url)])
    } catch { toast.error('Upload failed') }
    setUploading(false)
  }

  const toggleType = (t) => setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const onSubmit = (data) => {
    onSave({ ...data, images, coverImageIndex: coverIdx, type: types, rentPricing, subscriptionTiers })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">{tool ? 'Edit Tool' : 'Add Tool'}</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal__body">
            <div className="form-field">
              <label className="form-label">Tool Name *</label>
              <input className={`form-input ${errors.name ? 'form-input--error' : ''}`} {...register('name', { required: 'Required' })} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} {...register('description')} />
            </div>

            <div className="form-field">
              <label className="form-label">Supported Devices</label>
              <input className="form-input" {...register('supportedDevices')} />
            </div>

            <div className="form-field">
              <label className="form-label">Official Site URL</label>
              <input className="form-input" placeholder="https://..." {...register('officialSiteUrl')} />
            </div>

            <div className="form-field">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {['rent', 'buy'].map(t => (
                  <button key={t} type="button"
                    className={`tools-filters__btn ${types.includes(t) ? 'tools-filters__btn--active' : ''}`}
                    onClick={() => toggleType(t)}>
                    {t === 'rent' ? 'Rental' : 'License Purchase'}
                  </button>
                ))}
              </div>
            </div>

            {types.includes('rent') && (
              <div className="form-field">
                <label className="form-label">Rental Pricing</label>
                {rentPricing.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                    <span className="form-hint" style={{ width: 80, flexShrink: 0 }}>{p.label}</span>
                    <span className="form-hint">K</span>
                    <input type="number" className="form-input" value={p.price}
                      onChange={e => setRentPricing(prev => prev.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))}
                      style={{ width: 100 }}
                    />
                  </div>
                ))}
              </div>
            )}

            {types.includes('buy') && (
              <div className="form-field">
                <label className="form-label">Subscription Tiers</label>
                <span className="form-hint" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>Define license periods and prices</span>
                {subscriptionTiers.map((tier, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                    <input className="form-input" placeholder="e.g. 3 Months" value={tier.label}
                      onChange={e => setSubscriptionTiers(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                    />
                    <span className="form-hint">K</span>
                    <input type="number" className="form-input" value={tier.price}
                      onChange={e => setSubscriptionTiers(prev => prev.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))}
                      style={{ width: 100 }}
                    />
                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--status-cancelled)', cursor: 'pointer', fontSize: 'var(--text-lg)' }}
                      onClick={() => setSubscriptionTiers(prev => prev.filter((_, j) => j !== i))}>×</button>
                  </div>
                ))}
                <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 'var(--space-2)' }}
                  onClick={() => setSubscriptionTiers(prev => [...prev, { label: '', price: 0 }])}>
                  + Add Tier
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-field">
                <label className="form-label">Hold (mins)</label>
                <input type="number" className="form-input" {...register('holdDurationMinutes')} />
              </div>
              <div className="form-field">
                <label className="form-label">Cooldown (mins)</label>
                <input type="number" className="form-input" {...register('cooldownMinutes')} />
              </div>
              <div className="form-field">
                <label className="form-label">Expiry (mins)</label>
                <input type="number" className="form-input" {...register('paymentExpiryMinutes')} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Images</label>
              <input type="file" accept="image/*" multiple className="form-input" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span className="form-hint">Uploading...</span>}
              {images.length > 0 && (
                <div className="tool-image-grid">
                  {images.map((url, i) => (
                    <div key={i} className={`tool-image-thumb ${coverIdx === i ? 'tool-image-thumb--cover' : ''}`}>
                      <img src={url} alt="" onClick={() => setCoverIdx(i)} />
                      <button type="button" className="tool-image-remove"
                        onClick={() => { setImages(p => p.filter((_, j) => j !== i)); if (coverIdx >= i && coverIdx > 0) setCoverIdx(p => p - 1) }}>×</button>
                      {coverIdx === i && <span className="tool-image-cover-label">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
              {images.length > 0 && <span className="form-hint">Click image to set as cover</span>}
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminTools
