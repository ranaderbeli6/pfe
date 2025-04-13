import React from 'react';
import '../Styles/About.css';
import Header from './Header';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="about-container">
      <Header />
      <div className="about-hero">
        <h1 className="about-title">Découvrez Weefarm</h1>
        <p className="about-tagline">La révolution agricole numérique en Tunisie</p>
      </div>

      <div className="about-content">
        <section className="about-card">
          <div className="card-icon">🌱</div>
          <h2>Notre Mission</h2>
          <p>Connecter les acteurs du secteur agricole tunisien grâce à une plateforme innovante qui simplifie les échanges et booste la productivité.</p>
        </section>

        <section className="about-card">
          <div className="card-icon">🚀</div>
          <h2>Notre Vision</h2>
          <p>Devenir le partenaire numérique incontournable pour la transformation digitale de l'agriculture en Afrique du Nord.</p>
        </section>

        <section className="about-card">
          <div className="card-icon">🤝</div>
          <h2>Nos Valeurs</h2>
          <ul>
            <li>Innovation constante</li>
            <li>Transparence absolue</li>
            <li>Service personnalisé</li>
            <li>Impact social positif</li>
          </ul>
        </section>

        <section className="about-cta">
          
      <h2 className="about-section-title">Prêt à rejoindre l'aventure?</h2>
      <Link to="/contact">
        <button className="cta-button">Nous contacter</button>
      </Link>
        </section>
      </div>
    </div>
  );
};

export default About;