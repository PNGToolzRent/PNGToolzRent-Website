import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import './NotFound.css'

const NotFound = () => (
  <>
    <Helmet><title>404 — PNG Toolz</title></Helmet>
    <div className="not-found">
      <div className="not-found__inner">
        <span className="not-found__code">404</span>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__desc">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn--primary btn--md">Back to Home</Link>
      </div>
    </div>
  </>
)

export default NotFound
