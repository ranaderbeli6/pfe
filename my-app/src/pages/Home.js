import Header from "../components/Header";
import "../Styles/Homepage.css";

const Home = () => {
  return (
    <div className="homepage-wrapper">
      <Header />
      
      <main className="homepage-container">
        <div className="text-container">
          <h1>Bienvenue </h1>
          <br></br>
          <p>
            Le premier en Tunisie pour la vente de produits agricoles, où vous pouvez acheter, vendre et proposer vos services dans le domaine de l'agriculture et bien plus encore.
          </p>
          <br>
          </br>
          <p> Découvrez une expérience unique d'achat et de commerce en ligne pour répondre à tous vos besoins.</p>
          <a href="/catalogue/produits" className="explore-button">
            Explorer notre catalogue
          </a>
        </div>
      </main>

      <section id="catalogue-section" className="catalogue-section">
        <h2>Notre Catalogue</h2>
        <p>
          Explorez une variété de produits agricoles et bien plus, qui répondront à vos besoins spécifiques.
        </p>
      </section>
    </div>
  );
};

export default Home;
