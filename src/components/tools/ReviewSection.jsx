import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getReviewsByTool, createReview } from '../../firebase/firestore'
import { formatDate } from '../../utils/dates'
import toast from 'react-hot-toast'
import './ReviewSection.css'

const ReviewSection = ({ toolId, toolName }) => {
  const { isAuthenticated, user, profile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getReviewsByTool(toolId, true).then(setReviews)
  }, [toolId])

  const handleSubmit = async () => {
    if (!comment.trim()) return toast.error('Please write a comment')
    setSubmitting(true)
    try {
      await createReview({
        toolId,
        toolName,
        userId: user.uid,
        userName: profile.name,
        rating,
        comment: comment.trim(),
      })
      setSubmitted(true)
      toast.success('Review submitted — pending approval')
    } catch (e) {
      toast.error('Failed to submit review')
    }
    setSubmitting(false)
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="reviews">
      <div className="reviews__header">
        <h2>Reviews</h2>
        {avgRating && (
          <div className="reviews__avg">
            <StarDisplay rating={parseFloat(avgRating)} />
            <span className="reviews__avg-score">{avgRating}</span>
            <span className="reviews__count">({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <p className="reviews__empty">No reviews yet. Be the first.</p>
      )}

      <div className="reviews__list">
        {reviews.map(r => (
          <div key={r.id} className="review-item">
            <div className="review-item__header">
              <span className="review-item__name">{r.userName}</span>
              <StarDisplay rating={r.rating} />
              <span className="review-item__date">{formatDate(r.createdAt)}</span>
            </div>
            <p className="review-item__comment">{r.comment}</p>
          </div>
        ))}
      </div>

      {isAuthenticated && !submitted && (
        <div className="review-form">
          <h3>Leave a Review</h3>
          <p className="review-form__note">Only visible after approval. Only clients who completed a rental can review.</p>
          <div className="review-form__rating">
            <span className="review-form__label">Rating</span>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} className={`star-picker__btn ${s <= rating ? 'star-picker__btn--active' : ''}`} onClick={() => setRating(s)}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="review-form__textarea"
            placeholder="Write your review..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
          />
          <button className="btn btn--primary btn--md" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {submitted && (
        <div className="review-submitted">
          Review submitted — it will appear once approved.
        </div>
      )}
    </div>
  )
}

const StarDisplay = ({ rating }) => (
  <div className="star-display">
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} className={s <= Math.round(rating) ? 'star--filled' : 'star--empty'}>★</span>
    ))}
  </div>
)

export default ReviewSection
