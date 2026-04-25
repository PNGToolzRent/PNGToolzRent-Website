// firestore/seed.js
// Run with: node firestore/seed.js
// Requires: GOOGLE_APPLICATION_CREDENTIALS set to your service account key path

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { addHours, addMinutes, subHours, subDays } from 'date-fns'

// Load service account
const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const now = new Date()

// ─── SEED DATA ────────────────────────────────────────────────

const settings = {
  site: {
    siteName: 'PNG Toolz',
    tagline: 'Professional Mobile Servicing Tools — Available in PNG',
    heroText: 'Rent or buy the software tools you need to repair, unlock and customize mobile devices.',
    heroCta: 'Browse Tools',
    aboutText: 'PNG Toolz is Papua New Guinea\'s first dedicated platform for mobile phone technicians. We provide access to professional-grade software tools used for unlocking, firmware repair and device customization — at rates built for the local market.',
    isVisible_hero: true,
    isVisible_features: true,
    isVisible_howItWorks: true,
    isVisible_contact: true,
    banner: null,
    bannerActive: false,
    updatedAt: Timestamp.now(),
  },
  contact: {
    email: 'admin@pngtoolz.com',
    whatsapp: '+675 7000 0000',
    facebook: 'https://facebook.com/pngtoolz',
    instagram: null,
    tiktok: null,
    location: 'Port Moresby, NCD, Papua New Guinea',
    updatedAt: Timestamp.now(),
  },
  payment: {
    methods: [
      {
        id: 'bsp',
        name: 'BSP Bank Transfer',
        accountName: 'PNG Toolz',
        accountNumber: '1000 0000 0000',
        instructions: 'Transfer the exact amount and use your email as the payment reference.',
        active: true,
      },
      {
        id: 'kina',
        name: 'Kina Bank Transfer',
        accountName: 'PNG Toolz',
        accountNumber: '2000 0000 0000',
        instructions: 'Transfer the exact amount and use your email as the payment reference.',
        active: true,
      },
      {
        id: 'moni',
        name: 'MoniPlus Mobile Money',
        accountName: 'PNG Toolz',
        accountNumber: '7000 0000',
        instructions: 'Send via MoniPlus and screenshot the confirmation.',
        active: true,
      },
    ],
    updatedAt: Timestamp.now(),
  },
  seo: {
    title: 'PNG Toolz — Mobile Servicing Software Rentals in PNG',
    description: 'Rent or buy professional mobile phone unlocking and repair software tools in Papua New Guinea. Trusted by technicians across PNG.',
    keywords: 'phone unlocking PNG, mobile repair tools Papua New Guinea, firmware tools PNG, Chimera Pro rental, UFi Box PNG',
    ogImage: null,
    updatedAt: Timestamp.now(),
  },
  booking: {
    holdDurationMinutes: 30, // global default, overridden per tool
    updatedAt: Timestamp.now(),
  },
}

const users = [
  {
    id: 'admin-001',
    uid: 'admin-001',
    name: 'Admin',
    email: 'admin@pngtoolz.com',
    role: 'admin',
    profilePhoto: null,
    createdAt: Timestamp.fromDate(subDays(now, 60)),
    updatedAt: Timestamp.fromDate(subDays(now, 60)),
  },
  {
    id: 'user-001',
    uid: 'user-001',
    name: 'John Kila',
    email: 'john@example.com',
    role: 'client',
    profilePhoto: null,
    createdAt: Timestamp.fromDate(subDays(now, 30)),
    updatedAt: Timestamp.fromDate(subDays(now, 30)),
  },
  {
    id: 'user-002',
    uid: 'user-002',
    name: 'Mary Tova',
    email: 'mary@example.com',
    role: 'client',
    profilePhoto: null,
    createdAt: Timestamp.fromDate(subDays(now, 20)),
    updatedAt: Timestamp.fromDate(subDays(now, 20)),
  },
  {
    id: 'user-003',
    uid: 'user-003',
    name: 'Peter Namaliu',
    email: 'peter@example.com',
    role: 'client',
    profilePhoto: null,
    createdAt: Timestamp.fromDate(subDays(now, 10)),
    updatedAt: Timestamp.fromDate(subDays(now, 10)),
  },
]

const tools = [
  {
    id: 'tool-chimera',
    name: 'Chimera Pro',
    slug: 'chimera-pro',
    description: 'Chimera Pro is a professional Samsung servicing tool used for unlocking, FRP removal, IMEI repair and firmware flashing. Supports a wide range of Samsung models including Galaxy S, A, M and Note series.',
    type: ['rent', 'buy'],
    supportedDevices: 'Samsung Galaxy S series, A series, M series, Note series, Tab series',
    rentPricing: [
      { hours: 6,  price: 20, label: '6 Hours' },
      { hours: 12, price: 28, label: '12 Hours' },
      { hours: 24, price: 40, label: '24 Hours' },
    ],
    buyPrice: 350,
    images: [],
    coverImageIndex: 0,
    isVisible: true,
    slug: 'chimera-pro',
    holdDurationMinutes: 30,
    cooldownMinutes: 15,
    paymentExpiryMinutes: 120,
    createdAt: Timestamp.fromDate(subDays(now, 45)),
    updatedAt: Timestamp.fromDate(subDays(now, 45)),
  },
  {
    id: 'tool-ufi',
    name: 'UFi Box',
    slug: 'ufi-box',
    description: 'UFi Box is a powerful eMMC service tool for reading, writing, erasing and repairing eMMC storage on Android devices. Ideal for deep firmware repairs and data recovery tasks.',
    type: ['rent', 'buy'],
    supportedDevices: 'Most Android devices with eMMC storage — Samsung, Huawei, Oppo, Vivo, Xiaomi',
    rentPricing: [
      { hours: 6,  price: 25, label: '6 Hours' },
      { hours: 12, price: 35, label: '12 Hours' },
      { hours: 24, price: 50, label: '24 Hours' },
    ],
    buyPrice: 500,
    images: [],
    coverImageIndex: 0,
    isVisible: true,
    holdDurationMinutes: 30,
    cooldownMinutes: 20,
    paymentExpiryMinutes: 120,
    createdAt: Timestamp.fromDate(subDays(now, 40)),
    updatedAt: Timestamp.fromDate(subDays(now, 40)),
  },
  {
    id: 'tool-octoplus',
    name: 'Octoplus Pro',
    slug: 'octoplus-pro',
    description: 'Octoplus Pro is a multi-brand servicing tool supporting Samsung, LG, Huawei, Sony and more. Features include unlocking, flashing, FRP bypass and IMEI restoration.',
    type: ['rent'],
    supportedDevices: 'Samsung, LG, Huawei, Sony, Motorola, HTC',
    rentPricing: [
      { hours: 6,  price: 18, label: '6 Hours' },
      { hours: 12, price: 25, label: '12 Hours' },
      { hours: 24, price: 38, label: '24 Hours' },
    ],
    buyPrice: null,
    images: [],
    coverImageIndex: 0,
    isVisible: true,
    holdDurationMinutes: 30,
    cooldownMinutes: 15,
    paymentExpiryMinutes: 120,
    createdAt: Timestamp.fromDate(subDays(now, 35)),
    updatedAt: Timestamp.fromDate(subDays(now, 35)),
  },
]

const slots = [
  // Chimera Pro - 3 slots
  {
    id: 'slot-chimera-1',
    toolId: 'tool-chimera',
    toolName: 'Chimera Pro',
    slotLabel: 'Account #1',
    status: 'active',
    currentBookingId: 'booking-001',
    heldUntil: null,
    rentalEndsAt: Timestamp.fromDate(addHours(now, 4)),
    availableAt: null,
    createdAt: Timestamp.fromDate(subDays(now, 45)),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'slot-chimera-2',
    toolId: 'tool-chimera',
    toolName: 'Chimera Pro',
    slotLabel: 'Account #2',
    status: 'available',
    currentBookingId: null,
    heldUntil: null,
    rentalEndsAt: null,
    availableAt: null,
    createdAt: Timestamp.fromDate(subDays(now, 45)),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'slot-chimera-3',
    toolId: 'tool-chimera',
    toolName: 'Chimera Pro',
    slotLabel: 'Account #3',
    status: 'cooldown',
    currentBookingId: null,
    heldUntil: null,
    rentalEndsAt: null,
    availableAt: Timestamp.fromDate(addMinutes(now, 10)),
    createdAt: Timestamp.fromDate(subDays(now, 45)),
    updatedAt: Timestamp.now(),
  },
  // UFi Box - 2 slots
  {
    id: 'slot-ufi-1',
    toolId: 'tool-ufi',
    toolName: 'UFi Box',
    slotLabel: 'Account #1',
    status: 'available',
    currentBookingId: null,
    heldUntil: null,
    rentalEndsAt: null,
    availableAt: null,
    createdAt: Timestamp.fromDate(subDays(now, 40)),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'slot-ufi-2',
    toolId: 'tool-ufi',
    toolName: 'UFi Box',
    slotLabel: 'Account #2',
    status: 'held',
    currentBookingId: 'booking-003',
    heldUntil: Timestamp.fromDate(addMinutes(now, 20)),
    rentalEndsAt: null,
    availableAt: null,
    createdAt: Timestamp.fromDate(subDays(now, 40)),
    updatedAt: Timestamp.now(),
  },
  // Octoplus - 2 slots
  {
    id: 'slot-octoplus-1',
    toolId: 'tool-octoplus',
    toolName: 'Octoplus Pro',
    slotLabel: 'Account #1',
    status: 'available',
    currentBookingId: null,
    heldUntil: null,
    rentalEndsAt: null,
    availableAt: null,
    createdAt: Timestamp.fromDate(subDays(now, 35)),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'slot-octoplus-2',
    toolId: 'tool-octoplus',
    toolName: 'Octoplus Pro',
    slotLabel: 'Account #2',
    status: 'available',
    currentBookingId: null,
    heldUntil: null,
    rentalEndsAt: null,
    availableAt: null,
    createdAt: Timestamp.fromDate(subDays(now, 35)),
    updatedAt: Timestamp.now(),
  },
]

const bookings = [
  {
    id: 'booking-001',
    userId: 'user-001',
    userName: 'John Kila',
    userEmail: 'john@example.com',
    toolId: 'tool-chimera',
    toolName: 'Chimera Pro',
    toolSlug: 'chimera-pro',
    slotId: 'slot-chimera-1',
    type: 'rent',
    durationHours: 6,
    durationLabel: '6 Hours',
    amount: 20,
    status: 'confirmed',
    paymentMethod: 'BSP Bank Transfer',
    paymentReference: 'BSP-20240610-001',
    paymentProofUrl: null,
    rentalUsername: 'pngtoolz_chimera',
    rentalPassword: 'MyPass123',
    startTime: Timestamp.fromDate(subHours(now, 2)),
    endTime: Timestamp.fromDate(addHours(now, 4)),
    cancelReason: null,
    createdAt: Timestamp.fromDate(subHours(now, 3)),
    updatedAt: Timestamp.fromDate(subHours(now, 2)),
  },
  {
    id: 'booking-002',
    userId: 'user-002',
    userName: 'Mary Tova',
    userEmail: 'mary@example.com',
    toolId: 'tool-chimera',
    toolName: 'Chimera Pro',
    toolSlug: 'chimera-pro',
    slotId: null,
    type: 'buy',
    durationHours: null,
    durationLabel: null,
    amount: 350,
    status: 'pending',
    paymentMethod: 'MoniPlus Mobile Money',
    paymentReference: 'MONI-9823',
    paymentProofUrl: null,
    rentalUsername: null,
    rentalPassword: null,
    startTime: null,
    endTime: null,
    cancelReason: null,
    createdAt: Timestamp.fromDate(subHours(now, 1)),
    updatedAt: Timestamp.fromDate(subHours(now, 1)),
  },
  {
    id: 'booking-003',
    userId: 'user-003',
    userName: 'Peter Namaliu',
    userEmail: 'peter@example.com',
    toolId: 'tool-ufi',
    toolName: 'UFi Box',
    toolSlug: 'ufi-box',
    slotId: 'slot-ufi-2',
    type: 'rent',
    durationHours: 12,
    durationLabel: '12 Hours',
    amount: 35,
    status: 'pending',
    paymentMethod: 'BSP Bank Transfer',
    paymentReference: null,
    paymentProofUrl: null,
    rentalUsername: null,
    rentalPassword: 'PeterPass456',
    startTime: null,
    endTime: null,
    cancelReason: null,
    createdAt: Timestamp.fromDate(addMinutes(now, -10)),
    updatedAt: Timestamp.fromDate(addMinutes(now, -10)),
  },
  {
    id: 'booking-004',
    userId: 'user-001',
    userName: 'John Kila',
    userEmail: 'john@example.com',
    toolId: 'tool-octoplus',
    toolName: 'Octoplus Pro',
    toolSlug: 'octoplus-pro',
    slotId: 'slot-octoplus-1',
    type: 'rent',
    durationHours: 24,
    durationLabel: '24 Hours',
    amount: 38,
    status: 'completed',
    paymentMethod: 'Kina Bank Transfer',
    paymentReference: 'KINA-00451',
    paymentProofUrl: null,
    rentalUsername: 'pngtoolz_octoplus',
    rentalPassword: 'OldPass789',
    startTime: Timestamp.fromDate(subDays(now, 2)),
    endTime: Timestamp.fromDate(subDays(now, 1)),
    cancelReason: null,
    createdAt: Timestamp.fromDate(subDays(now, 2)),
    updatedAt: Timestamp.fromDate(subDays(now, 1)),
  },
]

const reviews = [
  {
    id: 'review-001',
    toolId: 'tool-chimera',
    toolName: 'Chimera Pro',
    userId: 'user-001',
    userName: 'John Kila',
    bookingId: 'booking-004',
    rating: 5,
    comment: 'Worked perfectly for my Samsung A54 unlock. Fast confirmation and easy to use. Will definitely rent again.',
    approved: true,
    createdAt: Timestamp.fromDate(subDays(now, 1)),
  },
  {
    id: 'review-002',
    toolId: 'tool-ufi',
    toolName: 'UFi Box',
    userId: 'user-002',
    userName: 'Mary Tova',
    bookingId: 'booking-002',
    rating: 4,
    comment: 'Good tool, got the job done. Approval took a little while but the admin was helpful.',
    approved: false,
    createdAt: Timestamp.fromDate(subHours(now, 5)),
  },
]

const notifications = [
  {
    id: 'notif-001',
    userId: 'user-001',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your payment has been verified. Your rental credentials are ready.',
    bookingId: 'booking-001',
    read: false,
    createdAt: Timestamp.fromDate(subHours(now, 2)),
  },
  {
    id: 'notif-002',
    userId: 'user-001',
    type: 'booking_completed',
    title: 'Rental Ended',
    message: 'Your Octoplus Pro rental session has ended. Thanks for using PNG Toolz.',
    bookingId: 'booking-004',
    read: true,
    createdAt: Timestamp.fromDate(subDays(now, 1)),
  },
]

const activityLog = [
  {
    id: 'log-001',
    adminId: 'admin-001',
    action: 'booking_confirmed',
    details: { bookingId: 'booking-001', slotId: 'slot-chimera-1' },
    createdAt: Timestamp.fromDate(subHours(now, 2)),
  },
  {
    id: 'log-002',
    adminId: 'admin-001',
    action: 'booking_completed',
    details: { bookingId: 'booking-004', slotId: 'slot-octoplus-1' },
    createdAt: Timestamp.fromDate(subDays(now, 1)),
  },
]

// ─── SEED FUNCTION ────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Firestore...\n')

  // Settings
  for (const [key, data] of Object.entries(settings)) {
    await db.collection('settings').doc(key).set(data)
    console.log(`✅ settings/${key}`)
  }

  // Users
  for (const user of users) {
    const { id, ...data } = user
    await db.collection('users').doc(id).set(data)
    console.log(`✅ users/${id}`)
  }

  // Tools
  for (const tool of tools) {
    const { id, ...data } = tool
    await db.collection('tools').doc(id).set(data)
    console.log(`✅ tools/${id}`)
  }

  // Slots
  for (const slot of slots) {
    const { id, ...data } = slot
    await db.collection('slots').doc(id).set(data)
    console.log(`✅ slots/${id}`)
  }

  // Bookings
  for (const booking of bookings) {
    const { id, ...data } = booking
    await db.collection('bookings').doc(id).set(data)
    console.log(`✅ bookings/${id}`)
  }

  // Reviews
  for (const review of reviews) {
    const { id, ...data } = review
    await db.collection('reviews').doc(id).set(data)
    console.log(`✅ reviews/${id}`)
  }

  // Notifications
  for (const notif of notifications) {
    const { id, ...data } = notif
    await db.collection('notifications').doc(id).set(data)
    console.log(`✅ notifications/${id}`)
  }

  // Activity log
  for (const log of activityLog) {
    const { id, ...data } = log
    await db.collection('activityLog').doc(id).set(data)
    console.log(`✅ activityLog/${id}`)
  }

  console.log('\n✅ Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
