import { getDocs, query, collection, where } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Generate a slug from a string
 * "Chimera Pro" → "chimera-pro"
 */
export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars
    .replace(/[\s_]+/g, '-')    // spaces/underscores → hyphens
    .replace(/-+/g, '-')        // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')    // trim leading/trailing hyphens
}

/**
 * Check if a slug already exists in a collection
 * Returns true if slug is available
 */
export const isSlugAvailable = async (collectionName, slug, excludeId = null) => {
  const q = query(collection(db, collectionName), where('slug', '==', slug))
  const snap = await getDocs(q)
  if (snap.empty) return true
  // If editing, allow same slug on same doc
  if (excludeId && snap.docs.length === 1 && snap.docs[0].id === excludeId) return true
  return false
}

/**
 * Generate a unique slug, appending a number if taken
 * "chimera-pro" → "chimera-pro-2" if taken
 */
export const generateUniqueSlug = async (collectionName, str, excludeId = null) => {
  const base = generateSlug(str)
  let slug = base
  let counter = 2

  while (!(await isSlugAvailable(collectionName, slug, excludeId))) {
    slug = `${base}-${counter}`
    counter++
  }

  return slug
}
