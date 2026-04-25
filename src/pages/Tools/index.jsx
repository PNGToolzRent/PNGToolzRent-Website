import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTools } from '../../hooks/useTools'
import './Tools.css'

const ITEMS_PER_PAGE = 9

const Tools = () => {
  const { tools, loading } = useTools()
  const [typeFilter, setTypeFilter] = useState('all')
  const [availFilter, setAvailFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = tools.filter(t => {
    if (typeFilter !== 'all' && !t.type?.includes(typeFilter)) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <>
      <Helmet>
        <title>Available Tools — PNG Toolz</title>
        <meta name="description" content="Browse professional mobile servicing tools available for rent or purchase in PNG." />
      </Helmet>

      <div className="tools-page">
        <section className="tools-page__header section">
          <div className="container">
            <span className="eyebrow">Software Tools</span>
            <h1>Available Tools</h1>
            <p>Browse our range of professional mobile servicing tools. Rent by the hour or purchase a subscription.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="tools-filters">
              <div className="tools-filters__group">
                <span className="tools-filters__label">Type</span>
                {['all', 'rent', 'buy'].map(v => (
                  <button
                    key={v}
                    className={`tools-filters__btn ${typeFilter === v ? 'tools-filters__btn--active' : ''}`}
                    onClick={() => { setTypeFilter(v); setPage(1) }}
                  >
                    {v === 'all' ? 'All' : v === 'rent' ? 'Rent' : 'Buy'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="tools-grid tools-grid--loading">
                {[...Array(6)].map((_, i) => <div key={i} className="tool-card tool-card--skeleton" />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="tools-empty">
                <p>No tools match your filters.</p>
              </div>
            ) : (
              <div className="tools-grid">
                {paginated.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`pagination__btn ${page === i + 1 ? 'pagination__btn--active' : ''}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

const ToolCard = ({ tool }) => {
  const coverImage = tool.images?.[tool.coverImageIndex || 0]
  const canRent = tool.type?.includes('rent')
  const canBuy = tool.type?.includes('buy')
  const minRentPrice = canRent
    ? Math.min(...(tool.rentPricing || []).map(p => p.price))
    : null

  return (
    <Link to={`/tools/${tool.slug}`} className="tool-card">
      <div className="tool-card__image">
        {coverImage
          ? <img src={coverImage} alt={tool.name} />
          : <div className="tool-card__image-placeholder"><span>⊞</span></div>
        }
      </div>
      <div className="tool-card__body">
        <div className="tool-card__tags">
          {canRent && <span className="tool-tag tool-tag--rent">Rent</span>}
          {canBuy && <span className="tool-tag tool-tag--buy">Buy</span>}
        </div>
        <h3 className="tool-card__name">{tool.name}</h3>
        <p className="tool-card__desc">{tool.description?.slice(0, 100)}...</p>
        <div className="tool-card__footer">
          {canRent && minRentPrice && (
            <span className="tool-card__price">From K{minRentPrice} / 6hrs</span>
          )}
          {canBuy && tool.buyPrice && (
            <span className="tool-card__price">Buy K{tool.buyPrice}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default Tools
