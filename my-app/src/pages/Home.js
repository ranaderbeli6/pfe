import Header from "../components/Header";
import "../Styles/Homepage.css";
import QuickChat from "../components/QuickChat";
import TopRatedProductsSlider from '../components/user/TopRatedProductsSlider';

const Home = () => {
  return (
    <div className="homepage-wrapper">
      <Header />

      <main className="hero-section">
        <div className="hero-content">
          <h1>Transformez votre expérience agricole en Tunisie</h1>
          <p className="hero-subtitle">
            La plateforme innovante qui connecte les producteurs, fournisseurs et acheteurs dans un ecosysteme dynamique.
          </p>
          <div className="cta-buttons">
            <a href="/catalogue/produits" className="primary-button">
              Découvrir nos produits <span className="arrow">→</span>
            </a>
            <a href="/login" className="secondary-button">
              Devenir fournisseur
            </a>
          </div>
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Producteurs actifs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2000+</span>
              <span className="stat-label">Transactions mensuelles</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Clients satisfaits</span>
            </div>
            <div className="quick-chat-container">
    <QuickChat />
  </div>
          </div>
        </div>
        
      </main>
      <div>
      <TopRatedProductsSlider />
      </div>

      <section className="features-section">
        <h2 className="section-title">On a pensé à tout… surtout à vous !</h2>
        <p className="section-subtitle">
          Tout ce dont vous avez besoin pour développer votre activité agricole
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Marché dynamique</h3>
            <p>A Innovation, tradition et passion au service de l’agriculture.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Transactions sécurisées</h3>
            <p>Paiements en ligne protégés avec suivi en temps réel de chaque transaction.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Livraison optimisée</h3>
            <p>Réseau de livraison couvrant toute la Tunisie avec traçabilité complète.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Interface intuitive</h3>
            <p>Une expérience utilisateur fluide, accessible sur tous vos appareils.</p>
          </div>
        </div>
      </section>

      {/* Catalogue Section */}
      <section className="catalogue-section">
        <div className="section-content">
          <h2 className="section-title">Explorez notre richesse agricole</h2>
          <p className="section-subtitle">
          Des produits, des services et un savoir-faire à portée de main.          </p>
          
          <div className="category-showcase">
            <div className="category-card fruits">
              <h3>Matériels Agricoles</h3>
              <a href="/catalogue/produits" className="category-link">
                Voir la sélection <span>→</span>
              </a>
            </div>
            
            <div className="category-card cereales">
              <h3>Semences .. Engrais</h3>
              <a href="/catalogue/produits" className="category-link">
                Découvrir <span>→</span>
              </a>
            </div>
            
            <div className="category-card equipements">
              <h3>Service pour les agriculteurs</h3>
              <a href="/catalogue/services" className="category-link">
                Explorer <span>→</span>
              </a>
            </div>
          </div>
          
          <a href="/catalogue/produits" className="primary-button full-width">
            Voir tout le catalogue
          </a>
        </div>
      </section>
      <section className="testimonials-section">
        <h2 className="section-title">Une confiance partagée par les meilleurs</h2>
        
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-content">
              "Cette plateforme a révolutionné ma façon de vendre mes produits. Les transactions sont simples et sécurisées."
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍🌾</div>
              <div className="author-info">
                <strong>Mohamed S.</strong>
                <span>Producteur d'olives, Sfax</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              "En tant qu'acheteur, je trouve toujours des produits frais à des prix compétitifs. Un gain de temps énorme !"
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍🍳</div>
              <div className="author-info">
                <strong>Amira K.</strong>
                <span>Restauratrice, Tunis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à rejoindre notre communauté ?</h2>
          <p>
            Inscrivez-vous en quelques minutes et commencez à acheter ou vendre dès aujourd'hui.
          </p>
          <div className="cta-buttons">
            <a href="/login" className="button inverted">
              S'inscrire gratuitement
            </a>
            <a href="/contact" className="button inverted">
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3>Agriconnect</h3>
            <p>La plateforme agricole tunisienne qui rapproche les producteurs et les acheteurs.</p>
          </div>
          
          <div className="footer-column">
            <h4>Navigation</h4>
            <ul>
              <li><a href="/">Accueil</a></li>
              <li><a href="/catalogue/produits">Catalogue</a></li>
              <li><a href="/about">À propos</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          

          
          <div className="footer-column">
            <h4>Contact</h4>
            <p>contact@agriconnect.tn</p>
            <p>+216 25 150 092</p>
            <div className="social-icons">
              <a href="#"><span>📱</span></a>
              <a href="#"><span>💻</span></a>
              <a href="#"><span>📧</span></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 Agriconnect - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;