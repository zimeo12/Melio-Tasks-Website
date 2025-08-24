import React from 'react';

const Features = () => {
  const features = [
    {
      title: 'Gestion intuitive',
      description: "Créez et organisez vos tâches en un clin d'œil avec une interface épurée et fluide.",
      delay: '0.2s',
    },
    {
      title: 'Rappels intelligents',
      description: 'Restez à jour avec des notifications personnalisées qui s’adaptent à votre rythme.',
      delay: '0.4s',
    },
    {
      title: 'Collaboration fluide',
      description: 'Partagez vos projets avec votre équipe pour une coordination sans effort.',
      delay: '0.6s',
    },
    {
      title: 'Suivi des progrès',
      description: 'Visualisez vos performances grâce à des statistiques claires et motivantes.',
      delay: '0.8s',
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-fade-in">
          Pourquoi choisir Melio Tasks ?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card animate-fade-in" style={{ animationDelay: feature.delay }}>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
