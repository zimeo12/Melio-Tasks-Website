import React from 'react';

const Footer = () => {
  const socialLinks = [
    { href: 'https://linkedin.com/company/melio.tasks.app', src: 'linkedin-icon.png', alt: 'LinkedIn' },
    { href: 'https://twitter.com/melio_tasks_app', src: 'twitter-icon.png', alt: 'Twitter' },
    { href: 'https://instagram.com/melio.tasks.app', src: 'instagram-icon.png', alt: 'Instagram' },
    { href: 'https://tiktok.com/@melio.tasks.app', src: 'tiktok-icon.png', alt: 'TikTok' },
  ];

  return (
    <footer className="py-12 bg-black" role="contentinfo">
      <div className="section-container">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-orange-500 mb-6">Suivez-nous</h3>
          <div className="flex justify-center gap-6">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="social-icon"
                aria-label={link.alt}
                target="_blank"
                rel="noopener"
              >
                <img src={link.src} alt={link.alt} loading="lazy" />
              </a>
            ))}
          </div>
        </div>
        <div className="text-center border-t border-gray-800 pt-6">
          <p className="mb-4">© 2025 Melio Tasks. Tous droits réservés.</p>
          <a
            href="https://meliotasks.my.canva.site/privacy-policy"
            className="text-orange-500 hover:underline"
            target="_blank"
            rel="noopener"
          >
            Politique de confidentialité
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
