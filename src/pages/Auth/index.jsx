import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { loginUser, registerUser, loginWithGoogle, verifyEmail } from '../../firebase/auth'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import './Auth.css'

const Auth = () => {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login')
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const navigate = useNavigate()
  const redirect = searchParams.get('redirect') || null

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

  // FIX: Admin Auto-Redirect
  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirect || '/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, loading])

  const onSubmit = async (data) => {
    try {
      if (mode === 'login') {
        await loginUser(data)
        toast.success('Welcome back!')
      } else {
        const userCred = await registerUser(data)
        await verifyEmail(userCred.user) // Mandatory Verification
        toast.success('Account created! Please check your email to verify.')
        setMode('login') // Switch to login so they can sign in after verifying
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle()
      toast.success('Signed in with Google')
    } catch (err) {
      toast.error('Google sign-in failed')
    }
  }

  return (
    <>
      <Helmet><title>{mode === 'login' ? 'Login' : 'Register'} — PNG Toolz</title></Helmet>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__header">
            <Link to="/" className="auth-card__logo">PNG<span>Toolz</span></Link>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`} onClick={() => setMode('login')}>Login</button>
            <button className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`} onClick={() => setMode('register')}>Register</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            {mode === 'register' && (
              <div className="form-field">
                <label className="form-label">Full Name</label>
                <input className="form-input" {...register('name', { required: 'Required' })} />
              </div>
            )}
            <div className="form-field">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" {...register('email', { required: 'Required' })} />
            </div>
            <div className="form-field">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" {...register('password', { required: 'Required' })} />
            </div>

            <button type="submit" className="btn btn--primary btn--lg" disabled={isSubmitting}>
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>

            <div className="auth-divider"><span>OR</span></div>

            <button type="button" className="btn btn--ghost btn--lg" onClick={handleGoogleSignIn}>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Auth
