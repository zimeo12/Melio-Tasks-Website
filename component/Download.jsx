import React from 'react';

const Download = () => (
  <section id="download" className="py-20 text-center">
    <div className="section-container">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 animate-fade-in">
        Commencez dès aujourd’hui
      </h2>
      <p className="text-lg md:text-xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Téléchargez Melio Tasks et révolutionnez votre organisation.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <a
          href="https://apps.apple.com/fr/app/melio-tasks/id6747993532"
          className="btn-primary"
          aria-label="Télécharger gratuitement sur iOS"
        >
          Obtenez-le gratuitement
        </a>
        <a
          href="https://forms.gle/inECG8AANBGwDrvy9"
          className="btn-secondary"
          aria-label="Rejoindre la liste d'attente Android"
        >
          Liste d’attente Android
        </a>
      </div>
    </div>
  </section>
);

export default Download;

