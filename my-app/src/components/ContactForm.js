import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import "../Styles/Contact.css"
const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    const formData = {
      name,
      email,
      subject,
      message,
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/contact/send', formData, {
      });
  
      if (response.data.success) {
        setSuccess('Votre message a été envoyé avec succès !');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        
        setTimeout(() => setSuccess(''), 5000); 
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      
      setTimeout(() => setError(''), 5000); 
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="contact-form-container">
      <Header />
      <h2>Contactez-nous</h2>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Nom :</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Sujet :</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message :</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
