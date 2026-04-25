import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getSetting, updateSetting, logActivity } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { uploadToCloudinary } from '../../utils/cloudinary'
import toast from 'react-hot-toast'
import './Admin.css'

const TABS = ['site', 'contact', 'payment', 'seo']

const AdminSettings = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('site')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all(TABS.map(t => getSetting(t))).then(results => {
      const d = {}
      TABS.forEach((t, i) => { d[t] = results[i] || {} })
      setData(d)
      setLoading(false)
    })
  }, [])

  const set = (tab, key, val) => setData(prev => ({ ...prev, [tab]: { ...prev[tab], [key]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(TABS.map(t => updateSetting(t, data[t])))
      await logActivity(user.uid, 'settings_updated', { tabs: TABS })
      toast.success('Settings saved')
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const handleOgImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const { url } = await uploadToCloudinary(file, 'pngtoolz/seo')
    set('seo', 'ogImage', url)
    toast.success('OG image uploaded')
  }

  if (loading) return <div className="admin-page"><p className="admin-loading">Loading settings...</p></div>

  return (
    <>
      <Helmet><title>Settings — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <div className='page-header__row'>
            <div>
              <h1>Settings</h1>
              <p>Manage all site content and configuration from here.</p>
            </div>
            <button className="btn btn--primary btn--md" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>

        <div className="settings-tabs">
          {TABS.map(t => (
            <button key={t} className={`settings-tab ${tab === t ? 'settings-tab--active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {tab === 'site' && (
            <div className="settings-section">
              <h3>Site Content</h3>
              <Field label="Site Name" value={data.site?.siteName} onChange={v => set('site', 'siteName', v)} />
              <Field label="Hero Tagline" value={data.site?.tagline} onChange={v => set('site', 'tagline', v)} />
              <Field label="Hero Subtext" value={data.site?.heroText} onChange={v => set('site', 'heroText', v)} type="textarea" />
              <Field label="Hero CTA Button Text" value={data.site?.heroCta} onChange={v => set('site', 'heroCta', v)} />
              <Field label="About Text" value={data.site?.aboutText} onChange={v => set('site', 'aboutText', v)} type="textarea" />

              <h3 style={{ marginTop: 'var(--space-6)' }}>Section Visibility</h3>
              {['hero', 'features', 'howItWorks', 'contact'].map(section => (
                <div key={section} className="toggle-row">
                  <span className="toggle-row__label">{section} section</span>
                  <button
                    type="button"
                    className={`toggle-btn ${data.site?.[`isVisible_${section}`] !== false ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                    onClick={() => set('site', `isVisible_${section}`, !data.site?.[`isVisible_${section}`])}
                  >
                    {data.site?.[`isVisible_${section}`] !== false ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              ))}

              <h3 style={{ marginTop: 'var(--space-6)' }}>Site Banner</h3>
              <Field label="Banner Text" value={data.site?.banner} onChange={v => set('site', 'banner', v)} />
              <div className="toggle-row">
                <span className="toggle-row__label">Banner Active</span>
                <button
                  type="button"
                  className={`toggle-btn ${data.site?.bannerActive ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                  onClick={() => set('site', 'bannerActive', !data.site?.bannerActive)}
                >
                  {data.site?.bannerActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="settings-section">
              <h3>Contact & Socials</h3>
              <Field label="Email" value={data.contact?.email} onChange={v => set('contact', 'email', v)} />
              <Field label="WhatsApp" value={data.contact?.whatsapp} onChange={v => set('contact', 'whatsapp', v)} />
              <Field label="Facebook URL" value={data.contact?.facebook} onChange={v => set('contact', 'facebook', v)} />
              <Field label="Instagram URL" value={data.contact?.instagram} onChange={v => set('contact', 'instagram', v)} />
              <Field label="TikTok URL" value={data.contact?.tiktok} onChange={v => set('contact', 'tiktok', v)} />
              <Field label="Location" value={data.contact?.location} onChange={v => set('contact', 'location', v)} />
            </div>
          )}

          {tab === 'payment' && (
            <div className="settings-section">
              <h3>Payment Methods</h3>
              {(data.payment?.methods || []).map((m, i) => (
                <div key={m.id} className="payment-method-editor">
                  <div className="payment-method-editor__header">
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>{m.name}</span>
                    <button
                      type="button"
                      className={`toggle-btn ${m.active ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                      onClick={() => {
                        const updated = [...data.payment.methods]
                        updated[i] = { ...updated[i], active: !updated[i].active }
                        set('payment', 'methods', updated)
                      }}
                    >
                      {m.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <Field label="Account Name" value={m.accountName} onChange={v => {
                    const updated = [...data.payment.methods]; updated[i] = { ...updated[i], accountName: v }; set('payment', 'methods', updated)
                  }} />
                  <Field label="Account Number" value={m.accountNumber} onChange={v => {
                    const updated = [...data.payment.methods]; updated[i] = { ...updated[i], accountNumber: v }; set('payment', 'methods', updated)
                  }} />
                  <Field label="Instructions" value={m.instructions} onChange={v => {
                    const updated = [...data.payment.methods]; updated[i] = { ...updated[i], instructions: v }; set('payment', 'methods', updated)
                  }} type="textarea" />
                </div>
              ))}
            </div>
          )}

          {tab === 'seo' && (
            <div className="settings-section">
              <h3>Global SEO</h3>
              <Field label="Page Title" value={data.seo?.title} onChange={v => set('seo', 'title', v)} />
              <Field label="Meta Description" value={data.seo?.description} onChange={v => set('seo', 'description', v)} type="textarea" />
              <Field label="Keywords" value={data.seo?.keywords} onChange={v => set('seo', 'keywords', v)} type="textarea" />
              <div className="form-field">
                <label className="form-label">OG Image</label>
                {data.seo?.ogImage && <img src={data.seo.ogImage} alt="OG" style={{ width: 200, marginBottom: 'var(--space-2)', border: '1px solid var(--border-primary)' }} />}
                <input type="file" accept="image/*" className="form-input" onChange={handleOgImageUpload} />
              </div>
              <div className="form-field">
                <label className="form-label">llms.txt Preview</label>
                <div className="llms-preview">
                  {`# PNG Toolz\n> ${data.seo?.description || ''}\n\nPNG Toolz is Papua New Guinea's platform for renting and buying mobile phone servicing software tools.\n\n## Services\n- Tool rentals (6hr, 12hr, 24hr)\n- Subscription purchases\n- Supported brands: Samsung, Huawei, Oppo, Vivo, Xiaomi\n\n## Location\nPapua New Guinea (Port Moresby)\n\n## Contact\n${data.contact?.email || ''}`}
                </div>
                <span className="form-hint">This is auto-generated from your site and contact settings. Served at /llms.txt for AI discoverability.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
    <label className="form-label">{label}</label>
    {type === 'textarea'
      ? <textarea className="form-input" rows={3} value={value || ''} onChange={e => onChange(e.target.value)} />
      : <input className="form-input" value={value || ''} onChange={e => onChange(e.target.value)} />
    }
  </div>
)

export default AdminSettings
