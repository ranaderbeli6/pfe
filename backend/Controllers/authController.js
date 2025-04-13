require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require("../Models/User");
const nodemailer = require('nodemailer');
const { Sequelize } = require('sequelize');

async function register(req, res) {
  try {
    const { fullName, email, password, phoneNumber, role, address, description } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    if (!['acheteur', 'fournisseur', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }

    if (role === 'acheteur') {
      if (!fullName || !email || !password || !phoneNumber || !address) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires pour un acheteur." });
      }
    } else if (role === 'fournisseur') {
      if (!fullName || !email || !password || !phoneNumber || !description) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires pour un fournisseur." });
      }
    } else if (role === 'admin' || role === 'superadmin') {
      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "fullName, email et password sont obligatoires pour un admin/superadmin." });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email invalide." });
    }

    if (role === 'acheteur' || role === 'fournisseur') {
      if (!phoneNumber) {
        return res.status(400).json({ message: "Le numéro de téléphone est obligatoire pour ce rôle." });
      }
      const phoneRegex = /^\d{8}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Le numéro de téléphone doit contenir 8 chiffres." });
      }
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      role,
      address: role === 'acheteur' ? address : null,
      description: role === 'fournisseur' ? description : null,
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès !',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ message: 'Connexion réussie!', token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
}

async function getUserInfo(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
}

async function sendPasswordResetEmail(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiration = resetTokenExpiration;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : 
      http://localhost:3000/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email envoyé pour la réinitialisation du mot de passe.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      where: { resetPasswordToken: token, resetPasswordTokenExpiration: { [Sequelize.Op.gt]: Date.now() } },
    });

    if (!user) return res.status(400).json({ message: 'Token invalide ou expiré.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiration = null;
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
}

async function logout(req, res) {
  try {
    res.status(200).json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
}

async function inviteAdmin(req, res) {
  const email = req.body.email;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const newUser = await User.create({
      email,
      role: 'admin',
      fullName: '',
      password: '',
    });

    const formLink = `http://localhost:3000/form/${newUser.id}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Invitation pour devenir Admin',
      text: `Vous avez été invité pour devenir admin. Complétez votre inscription en cliquant sur ce lien : ${formLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Admin invité avec succès. Un email a été envoyé à l'invité.",
      email: newUser.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'invitation", error: err.message });
  }
}

async function updateUser(req, res) {
  const { fullName, password } = req.body;
  const id = req.params.id;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.fullName = fullName;
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: err.message });
  }
}

module.exports = { register, login, getUserInfo, sendPasswordResetEmail, resetPassword, logout, updateUser, inviteAdmin };
