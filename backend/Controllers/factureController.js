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
    const pageHeight = doc.page.height;

    doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
       .lineWidth(2)
       .strokeColor('#000000')
       .stroke();

    const logoOptions = { width: 100 };
    const logoX = pageWidth - logoOptions.width - 50;
    const logoY = 50;

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, logoX, logoY, logoOptions);
    }

    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(`Facture ${facture.numeroFacture}`, 50, logoY, { align: 'left' })
       .moveDown(0.5);

    let infoY = doc.y;
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Date : ${facture.dateEmission.toLocaleDateString()}`, 50, infoY)
       .text(`Client : ${order.buyerName || `Client ${facture.userId}`}`, 50)
       .text(`Adresse : ${order.shippingAddress}`, 50)
       .moveDown();

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Articles commandés:', 50, doc.y, { underline: true })
       .moveDown(0.5);

    const xProduit = 50;
    const xQte = 300;
    const xPrixHT = 370;
    const xTotalHT = 460;
    let y = doc.y;

    doc.font('Helvetica-Bold')
       .text('Produit', xProduit, y)
       .text('Qté', xQte, y)
       .text('Prix HT', xPrixHT, y)
       .text('Total HT', xTotalHT, y);

    y += 20;
    doc.font('Helvetica');

    order.items.forEach(item => {
      doc.text(item.Produit?.name || `Produit ${item.productId}`, xProduit, y)
         .text(item.quantity.toString(), xQte, y)
         .text(`${item.priceAtPurchase.toFixed(2)} DNT`, xPrixHT, y)
         .text(`${(item.quantity * item.priceAtPurchase).toFixed(2)} DNT`, xTotalHT, y);
      y += 20;
    });

    y += 10;
    doc.font('Helvetica')
       .text(`Total HT : ${montantHT.toFixed(2)} DNT`, xTotalHT - 100, y)
       .text(`TVA (19%) : ${montantTVA.toFixed(2)} DNT`, xTotalHT - 100, y + 15);

    const boxX = xTotalHT - 120;
    const boxY = y + 40;
    const boxWidth = 150;
    const boxHeight = 40;

    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5)
       .fillAndStroke('#f0f0f0', '#000000');

    doc.fillColor('#000000')
       .font('Helvetica-Bold')
       .fontSize(16)
       .text(`Total TTC : ${montantTTC.toFixed(2)} DNT`, boxX + 10, boxY + 12);

    doc.fontSize(12)
       .font('Helvetica-Oblique')
       .fillColor('gray')
       .text('Merci pour votre confiance et votre commande !', 0, pageHeight - 70, { align: 'center' });

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