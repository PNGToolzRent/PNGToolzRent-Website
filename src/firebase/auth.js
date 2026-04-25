import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

// Register new client
export const registerUser = async ({ name, email, password }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await updateProfile(user, { displayName: name })

  // Create user doc in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email,
    role: 'client',
    profilePhoto: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return user
}

// Login
export const loginUser = async ({ email, password }) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

// Logout
export const logoutUser = () => signOut(auth)

// Get user role from Firestore
export const getUserRole = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (userDoc.exists()) {
    return userDoc.data().role
  }
  return null
}

// Get full user profile
export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() }
  }
  return null
}
