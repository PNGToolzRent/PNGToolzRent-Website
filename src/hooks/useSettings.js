import { useState, useEffect } from 'react'
import { getSetting } from '../firebase/firestore'

export const useSettings = (key) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSetting(key).then(result => {
      setData(result)
      setLoading(false)
    })
  }, [key])

  return { data, loading }
}
