import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { loginUser, registerUser } from '../../firebase/auth'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import './Auth.css'

const Auth = () => {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login')
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const redirect = searchParams.get('redirect') || null

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect || (isAdmin ? '/admin' : '/dashboard'), { replace: true })
    }
  }, [isAuthenticated])

  const onSubmit = async (data) => {
    try {
      if (mode === 'login') {
        await loginUser(data)
        toast.success('Welcome back!')
      } else {
        await registerUser(data)
        toast.success('Account created!')
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : 'Something went wrong. Try again.'
      toast.error(msg)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    reset()
  }

  return (
    <>
      <Helmet>
        <title>{mode === 'login' ? 'Login' : 'Create Account'} — PNG Toolz</title>
      </Helmet>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__header">
            <Link to="/" className="auth-card__logo">PNG<span>Toolz</span></Link>
            <p className="auth-card__desc">
              {mode === 'login'
                ? 'Sign in to access your dashboard and orders.'
                : 'Create a free account to track your orders and view credentials.'}
            </p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`} onClick={() => switchMode('login')}>Login</button>
            <button className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`} onClick={() => switchMode('register')}>Register</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {mode === 'register' && (
              <div className="form-field">
                <label className="form-label">Full Name</label>
                <input
                  className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                  placeholder="Your name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>
            )}

            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Auth
