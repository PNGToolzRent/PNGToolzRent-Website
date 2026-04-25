import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getDocument, getSlotsByTool, createBooking, getSetting, updateBooking } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { holdSlot, expireBooking } from '../../utils/bookingLogic'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { useCountdown } from '../../hooks/useCountdown'
import { Timestamp } from 'firebase/firestore'
import { addMinutes } from 'date-fns'
import { IconUpload, IconClock } from '../../components/ui/Icons'
import toast from 'react-hot-toast'
import './NewOrder.css'

const PAYMENT_WINDOW_MINUTES = 10

const NewOrder = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const toolId = searchParams.get('tool')
  const orderType = searchParams.get('type')

  const [tool, setTool] = useState(null)
  const [slots, setSlots] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Step 1 selections
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [preferredPassword, setPreferredPassword] = useState('')
  const [targetIdentity, setTargetIdentity] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)

  // Step 2 payment
  const [bookingId, setBookingId] = useState(null)
  const [expiryTime, setExpiryTime] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [receiptText, setReceiptText] = useState('')

  useEffect(() => {
    if (!toolId || !orderType) return navigate('/tools')
    Promise.all([
      getDocument('tools', toolId),
      getSlotsByTool(toolId),
      getSetting('payment'),
    ]).then(([t, s, p]) => {
      if (!t) return navigate('/tools')
      setTool(t)
      setSlots(s.filter(sl => sl.status === 'available'))
      setPaymentMethods((p?.methods || []).filter(m => m.active))
      setLoading(false)
    })
  }, [toolId, orderType])

  const canProceed = () => {
    if (!selectedPayment) return false
    if (orderType === 'rent') {
      return selectedSlot && selectedDuration && preferredPassword.trim().length > 0
    }
    if (orderType === 'buy') {
      return selectedTier && targetIdentity.trim().length > 0
    }
    return false
  }

  const handleProceedToPayment = async () => {
    setSubmitting(true)
    try {
      const expiry = Timestamp.fromDate(addMinutes(new Date(), PAYMENT_WINDOW_MINUTES))
      const amount = orderType === 'rent' ? selectedDuration.price : selectedTier.price

      const ref = await createBooking({
        userId: user.uid,
        userName: profile.name,
        userEmail: profile.email,
        toolId: tool.id,
        toolName: tool.name,
        toolSlug: tool.slug,
        slotId: orderType === 'rent' ? selectedSlot.id : null,
        type: orderType,
        durationHours: orderType === 'rent' ? selectedDuration.hours : null,
        durationLabel: orderType === 'rent' ? selectedDuration.label : selectedTier.label,
        amount,
        paymentMethod: selectedPayment.name,
        paymentMethodId: selectedPayment.id,
        credentialPassword: orderType === 'rent' ? preferredPassword : null,
        targetIdentity: orderType === 'buy' ? targetIdentity : null,
        additionalDetails: additionalDetails || null,
        screenshotUrl: null,
        receiptText: null,
        expiryTimestamp: expiry,
        credentialUsername: null,
        status: 'awaiting_payment',
      })

      if (orderType === 'rent' && selectedSlot) {
        await holdSlot(selectedSlot.id, ref.id, PAYMENT_WINDOW_MINUTES)
      }

      setBookingId(ref.id)
      setExpiryTime(expiry)
      setStep(2)
    } catch (e) {
      console.error(e)
      toast.error('Failed to create order. Try again.')
    }
    setSubmitting(false)
  }

  const handleExpire = async () => {
    if (bookingId) {
      await expireBooking({ bookingId, slotId: selectedSlot?.id, userId: user.uid })
    }
    toast.error('Order expired. Please start again.')
    navigate(`/tools/${tool?.slug}`)
  }

  const handleSubmitProof = async () => {
    if (!proofFile && !receiptText.trim()) {
      return toast.error('Please upload a screenshot or paste your receipt text')
    }
    setSubmitting(true)
    try {
      let screenshotUrl = null
      if (proofFile) {
        const uploaded = await uploadToCloudinary(proofFile, 'pngtoolz/payment-proofs')
        screenshotUrl = uploaded.url
      }
      await updateBooking(bookingId, {
        status: 'pending',
        screenshotUrl,
        receiptText: receiptText.trim() || null,
      })
      setStep(3)
    } catch (e) {
      toast.error('Submission failed. Try again.')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="page-loading">Loading...</div>

  const amount = orderType === 'rent' ? selectedDuration?.price : selectedTier?.price

  return (
    <>
      <Helmet><title>New Order — PNG Toolz</title></Helmet>
      <div className="new-order">
        <div className="new-order__header">
          <div className="new-order__tool">{tool.name}</div>
          <span className={`tool-tag tool-tag--${orderType}`}>
            {orderType === 'rent' ? 'Rental' : 'License Purchase'}
          </span>
        </div>

        {/* Step indicators */}
        <div className="order-steps">
          {['Configure', 'Payment', 'Submitted'].map((label, i) => (
            <div key={label} className={`order-step-indicator ${step === i + 1 ? 'order-step-indicator--active' : ''} ${step > i + 1 ? 'order-step-indicator--done' : ''}`}>
              <span className="order-step-indicator__num">{step > i + 1 ? '✓' : `0${i + 1}`}</span>
              <span className="order-step-indicator__label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="order-body">
            {orderType === 'rent' && (
              <>
                <div className="order-panel">
                  <h3 className="order-panel__title">Select Slot</h3>
                  {slots.length === 0 ? (
                    <div className="order-unavailable">No slots currently available. Check back soon.</div>
                  ) : (
                    <div className="option-grid">
                      {slots.map(s => (
                        <button key={s.id} className={`option-btn ${selectedSlot?.id === s.id ? 'option-btn--active' : ''}`} onClick={() => setSelectedSlot(s)}>
                          <span className="option-btn__dot option-btn__dot--green" />
                          {s.slotLabel}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="order-panel">
                  <h3 className="order-panel__title">Select Duration</h3>
                  <div className="option-grid">
                    {(tool.rentPricing || []).map(p => (
                      <button key={p.hours} className={`option-btn option-btn--duration ${selectedDuration?.hours === p.hours ? 'option-btn--active' : ''}`} onClick={() => setSelectedDuration(p)}>
                        <span className="option-btn__label">{p.label}</span>
                        <span className="option-btn__price">K{p.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="order-panel">
                  <h3 className="order-panel__title">Your Preferred Password</h3>
                  <p className="order-panel__hint">This password will be set on the rental account for your session.</p>
                  <input className="form-input" placeholder="Choose a password for this rental" value={preferredPassword} onChange={e => setPreferredPassword(e.target.value)} />
                </div>
              </>
            )}

            {orderType === 'buy' && (
              <>
                <div className="order-panel">
                  <h3 className="order-panel__title">Select License Period</h3>
                  <div className="option-grid">
                    {(tool.subscriptionTiers || []).map((tier, i) => (
                      <button key={i} className={`option-btn option-btn--duration ${selectedTier?.label === tier.label ? 'option-btn--active' : ''}`} onClick={() => setSelectedTier(tier)}>
                        <span className="option-btn__label">{tier.label}</span>
                        <span className="option-btn__price">K{tier.price}</span>
                      </button>
                    ))}
                    {(!tool.subscriptionTiers || tool.subscriptionTiers.length === 0) && (
                      <button className={`option-btn option-btn--duration ${selectedTier ? 'option-btn--active' : ''}`} onClick={() => setSelectedTier({ label: 'Full License', price: tool.buyPrice })}>
                        <span className="option-btn__label">Full License</span>
                        <span className="option-btn__price">K{tool.buyPrice}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="order-panel">
                  <h3 className="order-panel__title">Account for Activation</h3>
                  <p className="order-panel__hint">Enter the email or username of the account this license should be activated on.</p>
                  <div className="form-field">
                    <label className="form-label">Target Email / Username <span style={{color:'var(--status-cancelled)'}}>*</span></label>
                    <input className="form-input" placeholder="The account email or username for activation" value={targetIdentity} onChange={e => setTargetIdentity(e.target.value)} />
                  </div>
                  <div className="form-field" style={{marginTop:'var(--space-4)'}}>
                    <label className="form-label">Additional Details (optional)</label>
                    <textarea className="form-input" rows={3} placeholder="Any extra info needed for activation..." value={additionalDetails} onChange={e => setAdditionalDetails(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="order-panel">
              <h3 className="order-panel__title">Payment Method</h3>
              <div className="payment-options">
                {paymentMethods.map(m => (
                  <button key={m.id} className={`payment-option ${selectedPayment?.id === m.id ? 'payment-option--active' : ''}`} onClick={() => setSelectedPayment(m)}>
                    <span className="payment-option__name">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {canProceed() && (
              <div className="order-summary-panel">
                <div className="order-summary-rows">
                  <div className="order-summary-row"><span>Tool</span><span>{tool.name}</span></div>
                  <div className="order-summary-row"><span>Type</span><span>{orderType === 'rent' ? 'Rental' : 'License Purchase'}</span></div>
                  <div className="order-summary-row"><span>Duration</span><span>{orderType === 'rent' ? selectedDuration?.label : selectedTier?.label}</span></div>
                  <div className="order-summary-row"><span>Payment via</span><span>{selectedPayment?.name}</span></div>
                  <div className="order-summary-row order-summary-row--total"><span>Total</span><span>K{amount}</span></div>
                </div>
                <p className="order-summary-note">
                  You have <strong>{PAYMENT_WINDOW_MINUTES} minutes</strong> to complete payment once you proceed.
                </p>
                <button className="btn btn--primary btn--lg btn--full" onClick={handleProceedToPayment} disabled={submitting}>
                  {submitting ? 'Creating Order...' : 'Proceed to Payment'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="order-body">
            <PaymentTimer expiryTime={expiryTime} onExpire={handleExpire} />

            <div className="order-panel">
              <h3 className="order-panel__title">Payment Instructions</h3>
              <div className="payment-instructions">
                <div className="payment-instructions__method">{selectedPayment?.name}</div>
                <div className="payment-instructions__row"><span>Account Name</span><strong>{selectedPayment?.accountName}</strong></div>
                <div className="payment-instructions__row"><span>Account Number</span><strong>{selectedPayment?.accountNumber}</strong></div>
                <div className="payment-instructions__amount">Transfer exactly: <strong>K{amount}</strong></div>
                {selectedPayment?.instructions && <p className="payment-instructions__note">{selectedPayment.instructions}</p>}
              </div>
            </div>

            <div className="order-panel">
              <h3 className="order-panel__title">Submit Payment Proof</h3>
              <p className="order-panel__hint">Both are recommended. Reference numbers alone will be rejected.</p>

              <div className="form-field">
                <label className="form-label">Payment Screenshot</label>
                <label className="file-upload-btn">
                  <IconUpload size={14} />
                  {proofFile ? proofFile.name : 'Upload screenshot'}
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e => setProofFile(e.target.files[0])} />
                </label>
              </div>

              <div className="form-field">
                <label className="form-label">Full Receipt Text <span style={{color:'var(--text-muted)',fontWeight:400}}>(paste complete receipt — reference numbers only will be rejected)</span></label>
                <textarea className="form-input" rows={6} placeholder="Paste the complete receipt or transaction confirmation here..." value={receiptText} onChange={e => setReceiptText(e.target.value)} />
              </div>

              <button className="btn btn--primary btn--lg btn--full" onClick={handleSubmitProof} disabled={submitting || (!proofFile && !receiptText.trim())}>
                {submitting ? 'Submitting...' : 'Submit Payment Proof'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="order-submitted">
            <div className="order-submitted__check">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>Payment Proof Submitted</h2>
            <p>Your order is pending admin approval. You will be notified by email and in your dashboard once reviewed.</p>
            <p className="order-submitted__id">Order ID: <strong>#{bookingId?.slice(-8).toUpperCase()}</strong></p>
            <div className="order-submitted__actions">
              <button className="btn btn--primary btn--md" onClick={() => navigate(`/dashboard/orders/${bookingId}`)}>View Order</button>
              <button className="btn btn--ghost btn--md" onClick={() => navigate('/tools')}>Browse Tools</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const PaymentTimer = ({ expiryTime, onExpire }) => {
  const { formatted, isExpired, isWarning, seconds } = useCountdown(expiryTime)

  useEffect(() => {
    if (isExpired) onExpire()
  }, [isExpired])

  return (
    <div className={`payment-timer ${isWarning ? 'payment-timer--warning' : ''}`}>
      <div className="payment-timer__icon"><IconClock size={18} /></div>
      <div className="payment-timer__body">
        <span className="payment-timer__label">Time remaining to submit payment</span>
        <span className="payment-timer__countdown">{formatted}</span>
      </div>
      <div className="payment-timer__bar">
        <div className="payment-timer__bar-fill" style={{ width: `${(seconds / (PAYMENT_WINDOW_MINUTES * 60)) * 100}%` }} />
      </div>
    </div>
  )
}

export default NewOrder
