import React from 'react';

const Navigation = ({ isMenuOpen, toggleMenu, closeMenu }) => {
  const navItems = [
    { href: '#hero', label: 'Accueil' },
    { href: '#features', label: 'Fonctionnalités' },
    { href: '#action', label: 'En action' },
    { href: '#testimonials', label: 'Avis' },
    { href: '#download', label: 'Télécharger' },
    { href: '#contact', label: 'Nous contacter' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    closeMenu();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav role="navigation" aria-label="Navigation principale">
      <div className="nav-container flex items-center justify-between">
        <a href="#" aria-label="Retour à l'accueil" onClick={(e) => handleNavClick(e, '#hero')}>
          <img src="MelioLogo.png" alt="Logo Melio Tasks" className="nav-logo" />
        </a>
        <div className="desktop-menu hidden md:flex gap-4 items-center">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="hover:text-orange-500"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="mobile-menu-container md:hidden">
          <button
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      <div className={`dropdown-menu ${isMenuOpen ? 'show' : ''}`} role="menu">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            role="menuitem"
            className="hover:bg-orange-500 hover:text-black"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;

