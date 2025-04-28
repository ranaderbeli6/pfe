const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token manquant.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Erreur de validation du token:', err);  
      return res.status(403).json({ message: 'Token invalide.' });
    }

    req.user = { 
      id: decoded.id, 
      role: decoded.role 
    }; 
    next(); 
  });
}

function verifyRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit: rôle non autorisé." });
    }
    next(); 
  };
}

const optionalToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('User authentifié via JWT:', decoded.id);
      return next();
    } catch (err) {
      console.log('Token JWT invalide - continuation en mode session');
    }
  }

  if (!req.sessionID) {
    req.session.regenerate(err => {
      if (err) console.error('Erreur génération session:', err);
      console.log('Nouvelle session créée:', req.sessionID);
      next();
    });
  } else {
    next();
  }
};

module.exports = { verifyToken, verifyRole,optionalToken };
