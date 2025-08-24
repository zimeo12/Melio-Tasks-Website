import React from 'react';

const Hero = () => (
  <section id="hero" className="pt-24">
    <div className="section-container grid lg:grid-cols-2 gap-8 items-center">
      <div className="hero-text text-center lg:text-left px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">Melio Tasks</h1>
        <p className="text-xl md:text-2xl mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Organisez vos projets avec fluidité et efficacité
        </p>
        <p className="text-base md:text-lg text-gray-300 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Une application intuitive pour gérer vos tâches et booster votre productivité.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <a href="https://apps.apple.com/fr/app/melio-tasks/id6747993532" className="btn-primary" aria-label="Télécharger sur iOS">
            Télécharger sur iOS
          </a>
          <a href="https://forms.gle/inECG8AANBGwDrvy9" className="btn-secondary" aria-label="Rejoindre la liste d'attente Android">
            Liste d'attente Android
          </a>
        </div>
      </div>
      <div className="flex justify-center">
        <img
          src="VisuelAccueil.png"
          alt="Interface de Melio Tasks"
          className="hero-image animate-scale-in"
          style={{ animationDelay: '0.5s' }}
          width="800"
          height="1200"
          loading="lazy"
        />
      </div>
    </div>
  </section>
);

export default Hero;
