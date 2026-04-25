import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export const useAdminBadges = () => {
  const [badges, setBadges] = useState({ pendingBookings: 0, pendingReviews: 0 })

  useEffect(() => {
    const unsubBookings = onSnapshot(
      query(collection(db, 'bookings'), where('status', '==', 'pending')),
      snap => setBadges(prev => ({ ...prev, pendingBookings: snap.size }))
    )
    const unsubReviews = onSnapshot(
      query(collection(db, 'reviews'), where('approved', '==', false)),
      snap => setBadges(prev => ({ ...prev, pendingReviews: snap.size }))
    )
    return () => { unsubBookings(); unsubReviews() }
  }, [])

  return { badges }
}
