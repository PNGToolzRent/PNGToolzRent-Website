import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getDocs, collection, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { approveReview, deleteDocument, logActivity } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/dates'
import toast from 'react-hot-toast'
import './Admin.css'

const AdminReviews = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')))
    setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  const handleApprove = async (r) => {
    await approveReview(r.id)
    await logActivity(user.uid, 'review_approved', { reviewId: r.id, toolName: r.toolName })
    toast.success('Review approved')
    load()
  }

  const handleDelete = async (r) => {
    if (!window.confirm('Delete this review?')) return
    await deleteDocument('reviews', r.id)
    await logActivity(user.uid, 'review_deleted', { reviewId: r.id })
    toast.success('Review deleted')
    load()
  }

  return (
    <>
      <Helmet><title>Reviews — Admin — PNG Toolz</title></Helmet>
      <div className="admin-page">
        <div className="page-header">
          <h1>Reviews</h1>
          <p>Approve or remove client reviews before they go live.</p>
        </div>
        <div className="admin-toolbar">
          {['pending', 'approved', 'all'].map(f => (
            <button key={f} className={`tools-filters__btn ${filter === f ? 'tools-filters__btn--active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        {loading ? <p className="admin-loading">Loading...</p> : filtered.length === 0 ? (
          <div className="admin-empty">No reviews found.</div>
        ) : (
          <div className="reviews-admin-list">
            {filtered.map(r => (
              <div key={r.id} className="review-admin-card">
                <div className="review-admin-card__header">
                  <div>
                    <span className="review-admin-card__user">{r.userName}</span>
                    <span className="review-admin-card__tool"> on {r.toolName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="star-display">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= r.rating ? 'star--filled' : 'star--empty'}>★</span>
                      ))}
                    </div>
                    <span className="td-mono td-muted">{formatDate(r.createdAt)}</span>
                    <span className={`badge badge--${r.approved ? 'completed' : 'pending'}`}>{r.approved ? 'approved' : 'pending'}</span>
                  </div>
                </div>
                <p className="review-admin-card__comment">{r.comment}</p>
                <div className="review-admin-card__actions">
                  {!r.approved && (
                    <button className="btn btn--primary btn--sm" onClick={() => handleApprove(r)}>Approve</button>
                  )}
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(r)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default AdminReviews
