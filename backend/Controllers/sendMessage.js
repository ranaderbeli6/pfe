const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('../Models/User');

async function sendMessage(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { subject, message } = req.body;

    if (!subject || !message || typeof subject !== 'string' || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Le sujet et le message doivent être des chaînes de caractères valides.' 
      });
    }

    if (subject.length > 100 || message.length > 1000) {
      return res.status(400).json({ 
        success: false,
        message: 'Le sujet ne doit pas dépasser 100 caractères et le message 1000 caractères.' 
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentification requise. Token manquant ou mal formaté.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        message: 'Token invalide ou expiré.' 
      });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé.' 
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false 
      },
      pool: true, 
      maxConnections: 1,
      rateLimit: 1 
    });

    const mailOptions = {
      from: `"${user.fullName}" <${process.env.EMAIL_USER}>`,
      to: 'ranaderbeli76@gmail.com',
      replyTo: user.email, 
      subject: `Nouveau message: ${subject}`,
      text: `De: ${user.fullName} (${user.email})\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2c3e50;">Nouveau message de ${user.fullName}</h2>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #3498db;">
            <p style="white-space: pre-line;">${message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #7f8c8d;">
            Ce message a été envoyé via le formulaire de contact de votre application e-commerce weefarm.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true,
      message: 'Votre message a été envoyé avec succès.' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        success: false,
        message: 'Service temporairement indisponible. Veuillez réessayer plus tard.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi de votre message.' 
    });
  }
}

module.exports = sendMessage;