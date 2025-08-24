import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      text: 'Melio Tasks a transformé ma gestion quotidienne. L’interface est intuitive et les rappels m’aident à rester concentré.',
      author: 'Sophie M., Designer',
      delay: '0.2s',
    },
    {
      text: 'Une application essentielle pour coordonner mes projets d’équipe. Le partage de tâches est un vrai gain de temps.',
      author: 'Julien T., Manager',
      delay: '0.4s',
    },
    {
      text: 'Les statistiques me motivent à atteindre mes objectifs. Melio Tasks est simple et puissant à la fois.',
      author: 'Emma L., Étudiante',
      delay: '0.6s',
    },
    {
      text: 'Enfin une app gratuite qui allie design moderne et fonctionnalités pratiques. Je l’utilise tous les jours !',
      author: 'Lucas R., Entrepreneur',
      delay: '0.8s',
    },
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-fade-in">
          L’avis de nos utilisateurs
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card animate-fade-in"
              style={{ animationDelay: testimonial.delay }}
            >
              <p className="italic mb-4">"{testimonial.text}"</p>
              <cite className="font-semibold text-orange-500 not-italic">— {testimonial.author}</cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

