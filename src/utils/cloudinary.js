const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload a file to Cloudinary
 * Returns the secure URL
 */
export const uploadToCloudinary = async (file, folder = 'pngtoolz') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Cloudinary upload failed')

  const data = await res.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  }
}

/**
 * Upload multiple files
 */
export const uploadMultiple = async (files, folder = 'pngtoolz') => {
  return Promise.all(files.map(file => uploadToCloudinary(file, folder)))
}

/**
 * Get optimized Cloudinary URL
 */
export const getOptimizedUrl = (url, { width, height, quality = 'auto' } = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url
  const transforms = []
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  transforms.push(`q_${quality}`, 'f_auto')

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`)
}
