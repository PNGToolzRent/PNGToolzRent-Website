import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  increment,
} from 'firebase/firestore'
import { db } from './config'

// ─── COLLECTIONS ────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  TOOLS: 'tools',
  SLOTS: 'slots',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  ACTIVITY_LOG: 'activityLog',
  SETTINGS: 'settings',
}

// ─── GENERIC HELPERS ────────────────────────────────────────────
export const getDocument = async (collectionName, id) => {
  const ref = doc(db, collectionName, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateDocument = async (collectionName, id, data) => {
  const ref = doc(db, collectionName, id)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id))
}

// ─── TOOLS ──────────────────────────────────────────────────────
export const getTools = async (filters = {}) => {
  let q = collection(db, COLLECTIONS.TOOLS)
  const constraints = [orderBy('createdAt', 'desc')]

  if (filters.type) constraints.push(where('type', '==', filters.type))
  if (filters.available !== undefined) constraints.push(where('isVisible', '==', filters.available))

  const snap = await getDocs(query(q, ...constraints))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getToolBySlug = async (slug) => {
  const q = query(collection(db, COLLECTIONS.TOOLS), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export const createTool = async (data) => {
  return await addDoc(collection(db, COLLECTIONS.TOOLS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateTool = async (id, data) => updateDocument(COLLECTIONS.TOOLS, id, data)
export const deleteTool = async (id) => deleteDocument(COLLECTIONS.TOOLS, id)

// ─── SLOTS ──────────────────────────────────────────────────────
export const getSlotsByTool = async (toolId) => {
  const q = query(collection(db, COLLECTIONS.SLOTS), where('toolId', '==', toolId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const createSlot = async (data) => {
  return await addDoc(collection(db, COLLECTIONS.SLOTS), {
    ...data,
    status: 'available', // available | held | active | cooldown
    currentBookingId: null,
    heldUntil: null,
    availableAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateSlot = async (id, data) => updateDocument(COLLECTIONS.SLOTS, id, data)
export const deleteSlot = async (id) => deleteDocument(COLLECTIONS.SLOTS, id)

// ─── BOOKINGS ────────────────────────────────────────────────────
export const getBookingsByUser = async (userId) => {
  const q = query(
    collection(db, COLLECTIONS.BOOKINGS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getBookingsByStatus = async (status) => {
  const q = query(
    collection(db, COLLECTIONS.BOOKINGS),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getAllBookings = async () => {
  const q = query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const createBooking = async (data) => {
  return await addDoc(collection(db, COLLECTIONS.BOOKINGS), {
    ...data,
    status: 'pending', // pending | confirmed | active | completed | cancelled | expired
    paymentProofUrl: null,
    paymentReference: null,
    rentalUsername: null,
    rentalPassword: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateBooking = async (id, data) => updateDocument(COLLECTIONS.BOOKINGS, id, data)

// ─── REVIEWS ─────────────────────────────────────────────────────
export const getReviewsByTool = async (toolId, approvedOnly = true) => {
  const constraints = [where('toolId', '==', toolId), orderBy('createdAt', 'desc')]
  if (approvedOnly) constraints.push(where('approved', '==', true))
  const snap = await getDocs(query(collection(db, COLLECTIONS.REVIEWS), ...constraints))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const createReview = async (data) => {
  return await addDoc(collection(db, COLLECTIONS.REVIEWS), {
    ...data,
    approved: false,
    createdAt: serverTimestamp(),
  })
}

export const approveReview = async (id) => updateDocument(COLLECTIONS.REVIEWS, id, { approved: true })

// ─── NOTIFICATIONS ───────────────────────────────────────────────
export const createNotification = async (userId, data) => {
  return await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    userId,
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export const markNotificationRead = async (id) => {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true })
}

// ─── SETTINGS (single doc per key) ───────────────────────────────
export const getSetting = async (key) => {
  const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, key))
  return snap.exists() ? snap.data() : null
}

export const updateSetting = async (key, data) => {
  await updateDoc(doc(db, COLLECTIONS.SETTINGS, key), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// ─── ACTIVITY LOG ────────────────────────────────────────────────
export const logActivity = async (adminId, action, details = {}) => {
  return await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOG), {
    adminId,
    action,
    details,
    createdAt: serverTimestamp(),
  })
}

// ─── REAL-TIME LISTENERS ─────────────────────────────────────────
export const listenToBookings = (callback) => {
  const q = query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const listenToNotifications = (userId, callback) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const listenToSlot = (slotId, callback) => {
  return onSnapshot(doc(db, COLLECTIONS.SLOTS, slotId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}
