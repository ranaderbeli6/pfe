import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import StarRating from './StarRating';
import '../../Styles/user/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvis, setLoadingAvis] = useState(false);
  const [error, setError] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [note, setNote] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAvis, setUserAvis] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
    const [quantites, setQuantites] = useState({});
  
  const handleAddToCart = async (produit) => {
    const quantite = parseInt(quantites[produit.id]) || 1;

    try {
        const response = await axios.post('http://localhost:5000/api/cart/add', {
            productId: produit.id,
            quantity: quantite
        }, {
            withCredentials: true, // Important pour les cookies de session
            headers: { 
                Authorization: localStorage.getItem('token') 
                    ? `Bearer ${localStorage.getItem('token')}` 
                    : undefined 
            }
        });

        alert(response.data.message);
    } catch (error) {
        console.error(error);
        alert("Erreur lors de l'ajout au panier");
    }
};
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Chargement du produit
    axios.get(`http://localhost:5000/api/products/produits/${id}`)
      .then(response => {
        setProduit(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement du produit.");
        setLoading(false);
      });

    loadAvis();
  }, [id]);

  const loadAvis = () => {
    setLoadingAvis(true);
    axios.get(`http://localhost:5000/api/avis/${id}`)
      .then(response => {
        const avisList = Array.isArray(response.data) ? response.data : [];
        setAvis(avisList);

        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const userId = decodedToken.id;
                    const found = avisList.find(a => a.user?.id === userId);
          if (found) {
            setUserAvis(found);
            setCommentaire(found.commentaire || '');
            setNote(found.note || 0);
          }
        }
      })
      .catch(() => {
        setAvis([]);
      })
      .finally(() => setLoadingAvis(false));
  };

  const handleSubmitAvis = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!isLoggedIn) return alert("Vous devez être connecté pour laisser un avis.");
    if (note < 1 || note > 5) return alert("Veuillez donner une note entre 1 et 5 étoiles");

    try {
      if (userAvis && !isEditing) {
        alert("Vous avez déjà donné un avis. Cliquez sur Modifier pour le mettre à jour.");
        return;
      }

      if (userAvis && isEditing) {
        await axios.put(
          `http://localhost:5000/api/avis/${userAvis.id}`,
          { note, commentaire },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Votre avis a été mis à jour avec succès!");
      } else {
        await axios.post(
          'http://localhost:5000/api/avis',
          { produitId: id, commentaire, note },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Votre avis a été ajouté avec succès!");
      }

      loadAvis();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de l'envoi de l'avis");
    }
  };

  const handleEditReview = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNote(userAvis.note);
    setCommentaire(userAvis.commentaire);
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre avis ?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/avis/${userAvis.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Votre avis a été supprimé avec succès!");
      setUserAvis(null);
      setCommentaire('');
      setNote(0);
      setIsEditing(false);
      loadAvis();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de la suppression de l'avis");
    }
  };

  const calculateAverageRating = () => {
    if (avis.length === 0) return 0;
    const sum = avis.reduce((acc, review) => acc + Number(review.note), 0);
    return (sum / avis.length).toFixed(1);
  };

  if (loading) return <div className="loading">Chargement des détails du produit...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-details-container">
      <Header />
      
      <div className="product-main">
        <div className="product-image-container">
          {produit.image ? (
            <img src={`http://localhost:5000${produit.image}`} alt={produit.name} className="product-image" />
          ) : (
            <div className="no-image">Aucune image disponible</div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{produit.name}</h1>
          <div className="product-meta">
            <div className="product-rating">
              <StarRating rating={calculateAverageRating()} />
              <span className="rating-text">{calculateAverageRating()}</span>
              <span>({avis.length} avis)</span>
            </div>
            <p className="product-price">{produit.price} TND</p>
            <p className={`product-stock ${produit.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {produit.stock > 0 ? 'En stock' : 'Rupture de stock'}
            </p>
          </div>
          <p className="product-description">{produit.description}</p>
          {produit.stock > 0 && (
                    <button onClick={() => handleAddToCart(produit)} className="add-to-cart">
                      Ajouter au panier
                    </button>
                  )}
        </div>
      </div>

      <div className="reviews-section">
       <h2>Avis</h2>
        {loadingAvis ? (
          <p>Chargement des avis...</p>
        ) : avis.length > 0 ? (
          <div className="reviews-list">
            {avis.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-user">
                    <strong>{review.user?.fullName || "Anonyme"}</strong>
                    <StarRating rating={review.note} />
                    <span className="review-rating">{review.note.toFixed(1)}</span>
                    {userAvis?.id === review.id && (
                      <button 
                        onClick={handleEditReview}
                        className="edit-review-btn"
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {review.commentaire && <p className="review-comment">{review.commentaire}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun avis pour ce produit.</p>
        )}

        {isLoggedIn && (
          <div className="add-review-form">
            <h3>{userAvis ? (isEditing ? "Modifier votre avis" : "Votre avis") : "Donnez votre avis"}</h3>
            <form onSubmit={handleSubmitAvis}>
              <div className="form-group">
                <label>Note :</label>
                <StarRating 
                  rating={note} 
                  setRating={setNote} 
                  editable={!userAvis || isEditing} 
                />
                <span className="selected-rating">{note.toFixed(1)}</span>
              </div>
              <div className="form-group">
                <label>Commentaire :</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Décrivez votre expérience avec ce produit..."
                  rows="4"
                  required
                  readOnly={userAvis && !isEditing}
                />
              </div>

              <div className="review-actions">
                {!userAvis ? (
                  <button type="submit" className="submit-review-btn">
                    Envoyer l'avis
                  </button>
                ) : isEditing ? (
                  <>
                    <button type="submit" className="submit-review-btn">
                      Mettre à jour
                    </button>
                    <button 
                      type="button" 
                      className="cancel-review-btn"
                      onClick={handleCancelEdit}
                    >
                      Annuler
                    </button>
                    <button 
                      type="button" 
                      className="delete-review-btn"
                      onClick={handleDeleteReview}
                    >
                      Supprimer
                    </button>
                  </>
                ) : (
                  <button 
                    type="button" 
                    className="edit-review-btn"
                    onClick={handleEditReview}
                  >
                    Modifier
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;