const express = require('express');
const { sequelize } = require('./Models');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const { Cart, CartItem, Produit } = require('./Models');

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Configuration session
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}
app.use(session(sessionConfig));

// Middleware pour gerer l'expiration de session et restaurer le stock
app.use(async (req, res, next) => {
  const originalEnd = res.end;

  res.end = async function (...args) {
    if (req.session.cartId && !req.user) {
      try {
        const cart = await Cart.findOne({
          where: { id: req.session.cartId },
          include: [CartItem]
        });

        if (cart) {
          for (const item of cart.CartItems) {
            const product = await Produit.findByPk(item.productId);
            if (product) {
              product.stock += item.quantity;
              await product.save();
            }
          }
          await cart.destroy();
        }
      } catch (err) {
        console.error('Erreur lors du nettoyage du panier:', err);
      }
    }
    originalEnd.apply(res, args);
  };

  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API e-commerce en fonctionnement'
  });
});

app.use('/api/contact', require('./Routes/contactRoutes'));
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/products', require('./Routes/produitRoutes'));
app.use('/api/users', require('./Routes/userRoutes'));
app.use('/api/services', require('./Routes/serviceRoutes'));
app.use('/api/cart', require('./Routes/cartRoutes'));
app.use('/api/avis', require('./Routes/avisRoutes'));
app.use('/api/orders', require('./Routes/orderRoutes'));
app.use('/api/stats', require('./Routes/statfournisseurRoutes'));
app.use('/api/factures', require('./Routes/factureRoute'));
app.use('/api/statsadmin', require('./Routes/statadminRoutes'));
app.use('/api/promotions', require('./Routes/promotionRoutes'));
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// demarrer serveur
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    await sequelize.sync({ force: false });
    console.log('✅ Modèles synchronisés avec la base de données');

   
  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = PORT + 1;
    console.log(`Port ${PORT} en cours d'utilisation, tentative sur ${newPort}...`);
    app.listen(newPort);
  }
});
  } catch (error) {
    console.error('💥 Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

startServer();