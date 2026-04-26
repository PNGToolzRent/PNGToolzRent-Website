// Find the <header> section in your current PublicLayout.jsx and replace it with this:
<header className="navbar">
  <div className="container navbar__inner">
    {/* Mobile Left Group */}
    <div className="navbar__mobile-group">
      <button className="navbar__hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
      </button>
      <button className="navbar__theme-btn--mobile" onClick={toggleTheme}>
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
    </div>

    <NavLink to="/" className="navbar__logo">
      <LogoSVG height={28} />
    </NavLink>

    <nav className="navbar__links">
      <NavLink to="/tools" className="navbar__link">Available Tools</NavLink>
      {/* ... other links ... */}
    </nav>

    <div className="navbar__actions">
       <button className="navbar__theme-btn" onClick={toggleTheme}>
          {isDark ? <IconSun size={15} /> : <IconMoon size={15} />}
       </button>
       {/* ... login buttons ... */}
    </div>
  </div>
</header>
