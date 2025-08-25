import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import Navigation from './components/Navigation.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import Action from './components/Action.jsx';
import Testimonials from './components/Testimonials.jsx';
import Download from './components/Download.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

SwiperCore.use([Autoplay]);

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 769) closeMenu();
    };

    const handleKeydown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeydown);

    // Lazy Loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src;
          observer.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <>
      <div className={`menu-overlay ${isMenuOpen ? 'show' : ''}`} onClick={closeMenu}></div>
      <Navigation isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      <Hero />
      <Features />
      <Action />
      <Testimonials />
      <Download />
      <Contact />
      <Footer />
    </>
  );
};

export default App;
