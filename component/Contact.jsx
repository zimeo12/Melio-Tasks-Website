import React from 'react';

const Contact = () => (
  <section id="contact" className="py-20">
    <div className="section-container">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-fade-in">
        Nous contacter
      </h2>
      <div className="max-w-md mx-auto bg-gray-900/50 p-8 rounded-xl border border-gray-800 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <p className="text-center mb-6">Des questions ou des idées ? Contactez-nous !</p>
        <div className="flex justify-center">
          <a
            href="https://forms.gle/YfuMiS13g96Wwx1Z7"
            className="btn-primary"
            aria-label="Ouvrir le formulaire de contact"
          >
            Envoyer un message
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default Contact;
