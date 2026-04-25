import { useState, useEffect } from 'react'
import { getTools, getToolBySlug } from '../firebase/firestore'

export const useTools = (filters = {}) => {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTools(filters).then(data => {
      setTools(data)
      setLoading(false)
    })
  }, [JSON.stringify(filters)])

  return { tools, loading }
}

export const useToolBySlug = (slug) => {
  const [tool, setTool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    getToolBySlug(slug).then(data => {
      setTool(data)
      setLoading(false)
    })
  }, [slug])

  return { tool, loading }
}
