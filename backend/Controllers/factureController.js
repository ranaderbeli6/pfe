const { Facture, LigneFacture, Order, OrderItem, Produit, User } = require('../Models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.creerFactureSimple = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Produit,
          attributes: ['name']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const montantHT = order.totalAmount - 8; 
const montantTVA = montantHT * 0.19;    
const montantTTC = montantHT + montantTVA + 8; 


    const facture = await Facture.create({
      OrderId: order.id,
      userId: order.userId,
      fournisseurId: order.items[0]?.fournisseurId || null,
      numeroFacture: `${order.id}-${Date.now()}`,
      dateEmission: new Date(),
      montantTotal: montantTTC,
      statut: 'envoyée'
    });
    await Promise.all(
      order.items.map(item => {
        return LigneFacture.create({
          factureId: facture.id,
          productId: item.productId,
          quantite: item.quantity,
          prixUnitaire: item.priceAtPurchase,
          prixTotal: item.quantity * item.priceAtPurchase,
          description: item.Produit?.name || `Produit ${item.productId}`
        });
      })
    );
    const pdfPath = await genererPDFFacture(facture, order, montantHT, montantTVA, montantTTC);

    res.status(201).json({
      success: true,
      message: "Facture créée avec succès",
      data: {
        facture: {
          ...facture.get({ plain: true }),
          montantHT,
          montantTVA,
          montantTTC,
        },
        pdfUrl: `/factures/${path.basename(pdfPath)}`
      }
    });

  } catch (error) {
    console.error("Erreur création facture:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la création de la facture",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


async function genererPDFFacture(facture, order, montantHT, montantTVA, montantTTC) {
  return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
          margin: 50 
      });
      const facturesDir = path.join(__dirname, '../factures');

      if (!fs.existsSync(facturesDir)) {
          fs.mkdirSync(facturesDir, { recursive: true });
      }

      const pdfFileName = `${facture.numeroFacture}.pdf`;
      const pdfPath = path.join(facturesDir, pdfFileName);
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      const logoPath = path.join(__dirname, '../images/logo.png');
      const pageWidth = doc.page.width;
      const logoOptions = { width: 100 };
      const logoX = pageWidth - logoOptions.width - 50; 
      const logoY = 50; 

      if (fs.existsSync(logoPath)) {
          doc.image(logoPath, logoX, logoY, logoOptions);
      }

      doc.fontSize(24) 
          .font('Helvetica-Bold') // Mettre le titre en gras
          .text(`Facture ${facture.numeroFacture}`, 50, 50, { // Aligner à gauche et ajuster la position Y si le logo est présent
              align: 'left',
              y: fs.existsSync(logoPath) ? logoY + logoOptions.height + 20 : 50 // Ajuster la position Y si logo
          })
          .moveDown(0.5); // Réduire l'espace après le titre

      doc.fontSize(12)
          .font('Helvetica') // Revenir à la police normale pour les détails
          .text(`Date: ${facture.dateEmission.toLocaleDateString()}`, 50)
          .text(`Client: ${order.buyerName || `Client ${facture.userId}`}`, 50)
          .text(`Adresse: ${order.shippingAddress}`, 50)
          .moveDown();

      doc.fontSize(14)
          .font('Helvetica-Bold') // Mettre en gras l'en-tête des articles
          .text('Articles commandés:', 50, undefined, { underline: true })
          .moveDown();

      let y = doc.y;
      const xProduit = 50;
      const xQte = 200;
      const xPrixHT = 300;
      const xTotalHT = 400;

      doc.font('Helvetica-Bold')
          .text('Produit', xProduit, y)
          .text('Qté', xQte, y)
          .text('Prix HT', xPrixHT, y)
          .text('Total HT', xTotalHT, y);

      y += 25;

      order.items.forEach(item => {
          doc.font('Helvetica')
              .text(item.Produit?.name || `Produit ${item.productId}`, xProduit, y)
              .text(item.quantity.toString(), xQte, y)
              .text(`${item.priceAtPurchase.toFixed(2)} DNT`, xPrixHT, y)
              .text(`${(item.quantity * item.priceAtPurchase).toFixed(2)} DNT`, xTotalHT, y);
          y += 20;
      });

      doc.moveDown();
      doc.font('Helvetica')
          .text(`Total HT: ${montantHT.toFixed(2)} DNT`, 50, undefined) // Aligner à gauche
          .text(`TVA (19%): ${montantTVA.toFixed(2)} DNT`, 50) // Aligner à gauche
          .moveDown(0.5);

      doc.font('Helvetica-Bold')
          .fontSize(14) // Augmenter la taille du total TTC
          .text(`Total TTC: ${montantTTC.toFixed(2)} DNT`, 50); // Aligner à gauche

      doc.end();

      stream.on('finish', async () => {
          try {
              facture.cheminPDF = pdfFileName;
              await facture.save();
              resolve(pdfPath);
          } catch (err) {
              reject(err);
          }
      });
      stream.on('error', reject);
  });
}
exports.telechargerFacture = async (req, res) => {
  try {
    const { factureId } = req.params;
    const userId = req.user.id;

    const facture = await Facture.findOne({
      where: { id: factureId },
      include: [
        { model: User, as: 'Client' },
        { model: Order }
      ]
    });

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    if (facture.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (!facture.cheminPDF) {
      return res.status(404).json({ message: "Fichier PDF non généré" });
    }

    const pdfPath = path.join(__dirname, '../factures', facture.cheminPDF);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ 
        message: "Fichier PDF introuvable",
        detail: `Le fichier ${facture.cheminPDF} n'existe pas`
      });
    }

    res.download(pdfPath, `${facture.numeroFacture}.pdf`);
  } catch (error) {
    console.error("Erreur téléchargement facture:", error);
    res.status(500).json({ 
      message: "Erreur lors du téléchargement",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.listerFactures = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const whereClause = userRole === 'admin' ? {} : { userId };

    const factures = await Facture.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'Client', attributes: ['fullName'] },
        { model: Order, attributes: ['id'] }
      ],
      order: [['dateEmission', 'DESC']]
    });

    res.json({
      success: true,
      data: factures.map(f => ({
        id: f.id,
        numeroFacture: f.numeroFacture,
        dateEmission: f.dateEmission,
        montantTotal: f.montantTotal,
        statut: f.statut,
        client: f.Client.fullName,
        orderId: f.Order.id,
        pdfUrl: `/api/factures/${f.id}/telecharger`
      }))
    });

  } catch (error) {
    console.error("Erreur liste factures:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};