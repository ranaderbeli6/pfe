import React, { useState } from 'react';
import '../Styles/user/QuickChat.css';

function QuickChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        const botMessage = { from: 'bot', text: getBotResponse(input) };

        setMessages(prev => [...prev, userMessage, botMessage]);
        setInput('');
    };

    const getBotResponse = (question) => {
        const q = question.toLowerCase();
    
        if (q.includes('salut') || q.includes('slt') || q.includes('bonjour') || q.includes('bonsoir')) {
            return "Bonjour ! Comment puis-je vous aider ?";
        }
    
        if (q.includes('bye') || q.includes('ok')|| q.includes('merci')) {
            return "Bonne journée ! À bientôt.";
        }
    
        if (q.includes('qui') || q.includes('weefarm') || q.includes('quoi')) {
            return "Weefarm est une marketplace B2B spécialisée dans les produits et services agricoles en Tunisie. Nous connectons agriculteurs, sociétés agricoles et prestataires de services sur une même plateforme.";
        }
    
        if (q.includes('fonctionnalités') || q.includes('quoi faire')) {
            return "Sur Weefarm vous pouvez :\n- Acheter/vendre des produits agricoles\n- Proposer des services\n- Gérer vos stocks\n- Suivre vos commandes\n- Accéder à des statistiques de vente\n- Bénéficier d'outils marketing";
        }
    
        if (q.includes('vendre') || q.includes('fournisseur') || q.includes('entreprise') || q.includes('prestataire') || q.includes('services')) {
            return "Pour vendre sur Weefarm :\n1. Créez un compte vendeur\n2. Ajoutez vos produits/services\n3. Après validation par l'admin, vos produits seront visibles\n4. Gérez vos stocks et commandes depuis votre espace";
        }
    
        if (q.includes('produit') && (q.includes('ajouter') || q.includes('vendre'))) {
            return "Pour ajouter un produit :\n1. Connectez-vous à votre espace vendeur\n2. Remplissez la fiche produit (photos, description, prix)\n3. Soumettez à validation\n4. L'équipe Weefarm valide sous 24h";
        }
    
        if (q.includes('acheter') || q.includes('commander') || q.includes('commandes')) {
            return "Pour commander :\n1. Parcourez le catalogue\n2. Ajoutez au panier\n3. Validez votre commande\n4. et suivez la livraison en temps réel";
        }
    
        if (q.includes('prestataire') || q.includes('service')) {
            return "Les prestataires peuvent proposer des services aux agriculteurs :\n- Maintenance d'équipements\n- Conseils agricoles\n- Services logistiques\nCréez un compte prestataire pour proposer vos services.";
        }
    
      
        if (q.includes('problème') || q.includes('bug') || q.includes('erreur')) {
            return "En cas de problème technique :\n1. Essayez de rafraîchir la page\n2. Vérifiez votre connexion\n3. Contactez notre support à ranaverdanova@gmail.com ou cliquez sur contact ci_dessus\n4. Précisez votre navigateur et les étapes reproduisant le problème";
        }
    
        if (q.includes('contact') || q.includes('aide')) {
            return "Nous contacter :\n- Email : ranaverdanova@gmail.com\n- Tél : +216 25 150 092\n- Horaires : Notre équipe vous répond sous 24h.";
        }
    
        if (q.includes('compte') || q.includes('inscription')) {
            return "Pour créer un compte :\n1. Cliquez sur 'S'inscrire'\n2. Choisissez votre profil (acheteur/vendeur/prestataire)\n3. Remplissez le formulaire\n4. Validez votre email\n5. Accédez à votre espace personnel";
        }
    
        if (q.includes('mot de passe') || q.includes('connexion')) {
            return "Si vous avez oublié votre mot de passe :\n1. Cliquez sur 'Mot de passe oublié'\n2. Entrez votre email\n3. Suivez le lien reçu par email\n4. Créez un nouveau mot de passe";
        }
    
        return `Je n'ai pas compris votre question. Voici ce que je peux vous expliquer :
        - Comment vendre sur Weefarm
        - Comment acheter des produits
        - Devenir prestataire de services
        - Problèmes techniques
        - Gestion de compte
        Dites-moi ce qui vous intéresse !
        Si vous avez une autre question contactez-nous en cliquant sur contact ci_dessus`;
    };
    

    return (
        <div className="quick-chat-container">
  <div className="chat-wrapper">
    {!isVisible && (
      <button
        className="toggle-button"
        onClick={() => setIsVisible(true)}
      >
        Aide ?
      </button>
    )}

    {isVisible && (
      <div className="quick-chat">
        <div className="chat-header">
          <h3>Assistant Weefarm</h3>
          <button
            className="close-button"
            onClick={() => setIsVisible(false)}
          >
            ×
          </button>
        </div>
        <div className="chat-box">
          {messages.length === 0 ? (
            <div className="welcome-message">
              Bonjour ! Voici ce que je peux vous expliquer :
              <br></br>
              - C'est quoi Weefarm
              <br></br>
        - Comment vendre sur Weefarm
        <br></br>

        - Comment acheter des produits
        <br></br>

        - Devenir prestataire de services
        <br></br>

        - Problèmes techniques
        <br></br>

        - Gestion de compte
        <br></br>

        Dites-moi ce qui vous intéresse !
        Si vous avez une autre question contactez-nous en cliquant sur contact ci_dessus
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.from}`}>
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Envoyer</button>
        </div>
      </div>
    )}
  </div>
</div>

    );
}

export default QuickChat;