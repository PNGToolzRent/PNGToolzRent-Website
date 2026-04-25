import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenToNotifications, markNotificationRead } from '../firebase/firestore'

export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub = listenToNotifications(user.uid, setNotifications)
    return unsub
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id) => {
    await markNotificationRead(id)
  }

  return { notifications, unreadCount, markRead }
}
