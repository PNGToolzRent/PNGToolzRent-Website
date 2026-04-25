import { Timestamp } from 'firebase/firestore'
import { addHours, addMinutes } from 'date-fns'
import { createNotification, logActivity, updateSlot, updateBooking } from '../firebase/firestore'

// ─── STATUS FLOWS ─────────────────────────────────────────────
// Booking: awaiting_payment → pending → confirmed → completed
//                           → rejected (admin)
//                           → expired  (10min timer)
//                           → cancelled
// Slot:    available → held → active → cooldown → available

export const holdSlot = async (slotId, bookingId, holdMinutes) => {
  const heldUntil = Timestamp.fromDate(addMinutes(new Date(), holdMinutes))
  await updateSlot(slotId, { status: 'held', currentBookingId: bookingId, heldUntil })
  return heldUntil
}

export const releaseSlot = async (slotId) => {
  await updateSlot(slotId, { status: 'available', currentBookingId: null, heldUntil: null, availableAt: null })
}

export const startCooldown = async (slotId, cooldownMinutes) => {
  const availableAt = Timestamp.fromDate(addMinutes(new Date(), cooldownMinutes))
  await updateSlot(slotId, { status: 'cooldown', currentBookingId: null, heldUntil: null, availableAt })
  return availableAt
}

export const activateSlot = async (slotId, bookingId, endTime) => {
  await updateSlot(slotId, { status: 'active', currentBookingId: bookingId, heldUntil: null, rentalEndsAt: endTime })
}

/**
 * Admin approves a booking — enters credentials
 * Rent: activates slot, stores username+password, notifies client
 * Buy: marks completed, stores credential info, notifies client
 */
export const approveBooking = async ({ bookingId, slotId, userId, type, durationHours, credentialUsername, credentialPassword, adminId }) => {
  if (type === 'rent') {
    const startTime = new Date()
    const endTime = Timestamp.fromDate(addHours(startTime, durationHours || 6))
    await updateBooking(bookingId, {
      status: 'confirmed',
      credentialUsername,
      credentialPassword,
      startTime: Timestamp.fromDate(startTime),
      endTime,
    })
    if (slotId) await activateSlot(slotId, bookingId, endTime)
    await createNotification(userId, {
      type: 'booking_confirmed',
      title: 'Rental Approved',
      message: 'Your payment has been verified. Your rental credentials are ready in your dashboard.',
      bookingId,
    })
  } else {
    await updateBooking(bookingId, {
      status: 'completed',
      credentialUsername,
      credentialPassword,
    })
    await createNotification(userId, {
      type: 'booking_completed',
      title: 'Subscription Activated',
      message: 'Your subscription purchase has been completed. Check your order for details.',
      bookingId,
    })
  }
  await logActivity(adminId, 'booking_approved', { bookingId, type })
}

/**
 * Admin rejects a booking — reason required
 */
export const rejectBooking = async ({ bookingId, slotId, userId, reason, adminId }) => {
  await updateBooking(bookingId, { status: 'rejected', rejectReason: reason })
  if (slotId) await releaseSlot(slotId)
  await createNotification(userId, {
    type: 'booking_rejected',
    title: 'Order Rejected',
    message: reason || 'Your order was rejected. Please contact us for more information.',
    bookingId,
  })
  await logActivity(adminId, 'booking_rejected', { bookingId, reason })
}

/**
 * Expire a booking — 10min payment window exceeded
 */
export const expireBooking = async ({ bookingId, slotId, userId }) => {
  await updateBooking(bookingId, { status: 'expired' })
  if (slotId) await releaseSlot(slotId)
  await createNotification(userId, {
    type: 'booking_expired',
    title: 'Order Expired',
    message: 'Your order expired because payment proof was not submitted within 10 minutes. Please start a new order.',
    bookingId,
  })
}

/**
 * Cancel a booking (admin)
 */
export const cancelBooking = async ({ bookingId, slotId, userId, reason = '', adminId }) => {
  await updateBooking(bookingId, { status: 'cancelled', cancelReason: reason })
  if (slotId) await releaseSlot(slotId)
  await createNotification(userId, {
    type: 'booking_cancelled',
    title: 'Order Cancelled',
    message: reason || 'Your order has been cancelled. Contact us for more info.',
    bookingId,
  })
  if (adminId) await logActivity(adminId, 'booking_cancelled', { bookingId, reason })
}

/**
 * Complete a rental (duration ended)
 */
export const completeBooking = async ({ bookingId, slotId, userId, cooldownMinutes = 15, adminId }) => {
  await updateBooking(bookingId, { status: 'completed' })
  if (slotId) await startCooldown(slotId, cooldownMinutes)
  await createNotification(userId, {
    type: 'booking_completed',
    title: 'Rental Ended',
    message: 'Your rental session has ended. Thanks for using PNG Toolz.',
    bookingId,
  })
  if (adminId) await logActivity(adminId, 'booking_completed', { bookingId })
}

/**
 * Extend a rental
 */
export const extendBooking = async ({ bookingId, slotId, userId, additionalHours, currentEndTime, adminId }) => {
  const newEndTime = Timestamp.fromDate(addHours(currentEndTime.toDate(), additionalHours))
  await updateBooking(bookingId, { endTime: newEndTime })
  if (slotId) await updateSlot(slotId, { rentalEndsAt: newEndTime })
  await createNotification(userId, {
    type: 'booking_extended',
    title: 'Rental Extended',
    message: `Your rental has been extended by ${additionalHours} hour(s).`,
    bookingId,
  })
  if (adminId) await logActivity(adminId, 'booking_extended', { bookingId, additionalHours })
}

export const getNextAvailableTime = (slot) => {
  if (slot.status === 'available') return null
  if (slot.status === 'held') return slot.heldUntil
  if (slot.status === 'cooldown') return slot.availableAt
  if (slot.status === 'active') return slot.rentalEndsAt
  return null
}
