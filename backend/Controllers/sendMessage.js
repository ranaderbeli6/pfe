const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

async function sendMessage(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Tous les champs sont obligatoires.' 
      });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || 
        typeof subject !== 'string' || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Tous les champs doivent être des chaînes de caractères valides.' 
      });
    }

    if (name.length > 100 || email.length > 100 || 
        subject.length > 100 || message.length > 1000) {
      return res.status(400).json({ 
        success: false,
        message: 'Limites de caractères dépassées (nom: 100, email: 100, sujet: 100, message: 1000).' 
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Veuillez fournir une adresse email valide.' 
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
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: 'ranaderbeli76@gmail.com',
      replyTo: email,
      subject: `Nouveau message de contact: ${subject}`,
      text: `De: ${name} (${email})\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2c3e50;">Nouveau message de ${name}</h2>
          <p><strong>Email:</strong> ${email}</p>
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