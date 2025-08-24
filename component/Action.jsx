import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

const Action = () => {
  const slides = [
    { src: '1.png', alt: 'Écran d’accueil' },
    { src: '2.png', alt: 'Création de tâches' },
    { src: '3.png', alt: 'Notifications' },
    { src: '4.png', alt: 'Partage de tâches' },
    { src: '5.png', alt: 'Statistiques' },
    { src: '6.png', alt: 'Paramètres' },
  ];

  return (
    <section id="action" className="py-20">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-fade-in">
          Melio Tasks en action
        </h2>
        <Swiper
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView="auto"
          spaceBetween={16}
          centeredSlides={false}
          breakpoints={{
            640: { spaceBetween: 20 },
            768: { spaceBetween: 24 },
            1024: { spaceBetween: 28 },
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <img src={slide.src} alt={slide.alt} className="w-full h-auto" loading="lazy" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Action;

