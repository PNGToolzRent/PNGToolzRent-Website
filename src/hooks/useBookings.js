import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getBookingsByUser, getAllBookings } from '../firebase/firestore'

export const useMyBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getBookingsByUser(user.uid).then(data => {
      setBookings(data)
      setLoading(false)
    })
  }, [user])

  return { bookings, loading }
}

export const useAllBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllBookings().then(data => {
      setBookings(data)
      setLoading(false)
    })
  }, [])

  return { bookings, loading }
}
