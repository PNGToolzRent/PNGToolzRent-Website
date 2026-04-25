import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { updateDocument } from '../../firebase/firestore'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { updateProfile } from 'firebase/auth'
import { auth } from '../../firebase/config'
import toast from 'react-hot-toast'
import './Profile.css'

const Profile = () => {
  const { user, profile } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handlePhotoChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadToCloudinary(file, 'pngtoolz/avatars')
      await updateDocument('users', user.uid, { profilePhoto: url })
      await updateProfile(auth.currentUser, { photoURL: url })
      toast.success('Profile photo updated')
      setFile(null)
    } catch (e) {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  return (
    <>
      <Helmet><title>Profile — PNG Toolz</title></Helmet>
      <div className="profile">
        <div className="page-header">
          <h1>Profile</h1>
          <p>Manage your account photo.</p>
        </div>

        <div className="profile__card">
          <div className="profile__avatar-section">
            <div className="profile__avatar">
              {(preview || profile?.profilePhoto)
                ? <img
                    src={preview || profile.profilePhoto}
                    alt="Profile"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', objectPosition: 'center top', display: 'block', flexShrink: 0 }}
                  />
                : <span>{profile?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className="profile__avatar-actions">
              <label className="btn btn--ghost btn--sm" htmlFor="avatar-upload">Choose Photo</label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              {file && (
                <button className="btn btn--primary btn--sm" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </button>
              )}
            </div>
          </div>

          <div className="profile__info">
            <div className="profile__field">
              <p className="profile__label">Name</p>
              <p className="profile__value">{profile?.name}</p>
            </div>
            <div className="profile__field">
              <p className="profile__label">Email</p>
              <p className="profile__value">{profile?.email}</p>
            </div>
            <div className="profile__field">
              <p className="profile__label">Role</p>
              <p className="profile__value">{profile?.role}</p>
            </div>
          </div>
          <p className="profile__locked-note">Name and email cannot be changed after registration.</p>
        </div>
      </div>
    </>
  )
}

export default Profile
