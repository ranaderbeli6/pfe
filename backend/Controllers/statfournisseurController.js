const { Produit, Order, OrderItem, Avis, User } = require('../Models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path'); // Importez le module 'path'
exports.getVentesStats = async (req, res) => {
  try {
    const fournisseurId = req.user.id;
    const { startDate, endDate } = req.query || {};

    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = dateFilter.createdAt || {};
      dateFilter.createdAt[Op.lte] = new Date(endDate);
    }

    const commandes = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        where: { fournisseurId },
        include: [{
          model: Produit,
          attributes: ['id', 'name', 'price']
        }]
      }],
      where: { 
        status: ['livré'],
        ...dateFilter 
      },
      order: [['createdAt', 'ASC']]
    });

    const stats = {
      totalVentes: 0,
      chiffreAffaire: 0,
      commandes: commandes.length,
      clientsUnique: new Set(),
      produits: {},
      monthlySales: []
    };

    const monthlyMap = {};
    
    commandes.forEach(commande => {
      stats.clientsUnique.add(commande.userId);
      
      const date = new Date(commande.createdAt);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = {
          mois: monthYear,
          ventes: 0,
          ca: 0
        };
      }

      commande.items.forEach(item => {
        const produit = item.Produit;
        const itemTotal = item.quantity * produit.price;
        
        if (!stats.produits[item.productId]) {
          stats.produits[item.productId] = {
            name: produit.name,
            quantite: 0,
            chiffre: 0
          };
        }
        stats.produits[item.productId].quantite += item.quantity;
        stats.produits[item.productId].chiffre += itemTotal;
        
        stats.totalVentes += item.quantity;
        stats.chiffreAffaire += itemTotal;
        
        monthlyMap[monthYear].ventes += item.quantity;
        monthlyMap[monthYear].ca += itemTotal;
      });
    });

    stats.monthlySales = Object.values(monthlyMap).sort((a, b) => {
      return new Date(a.mois) - new Date(b.mois);
    });

    stats.monthlySales = stats.monthlySales.map(month => ({
      ...month,
      mois: new Date(month.mois).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    }));

    stats.clientsUnique = stats.clientsUnique.size;

    res.status(200).json(stats);
  } catch (err) {
    console.error("Erreur stats ventes:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des stats de ventes." });
  }
};

exports.getAvisStats = async (req, res) => {
    try {
      const fournisseurId = req.user.id;
  
      const avis = await Avis.findAll({
        include: [{
          model: Produit,
          as: 'produit', 
          where: { userId: fournisseurId },
          attributes: ['id']
        }]
      });
  
      const stats = {
        totalAvis: avis.length,
        moyenneNote: 0,
        repartitionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
  
      if (avis.length > 0) {
        const sommeNotes = avis.reduce((acc, a) => {
          stats.repartitionNotes[a.note]++;
          return acc + a.note;
        }, 0);
        stats.moyenneNote = (sommeNotes / avis.length).toFixed(2);
      }
  
      res.status(200).json(stats);
    } catch (err) {
      console.error("Erreur stats avis:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques d'avis." });
    }
  };
  
exports.getProduitsStats = async (req, res) => {
    try {
      const fournisseurId = req.user.id;
  
      const produits = await Produit.findAll({
        where: { userId: fournisseurId },
        include: [
          {
            model: OrderItem,
            attributes: ['quantity'],
            include: [{
              model: Order,
              where: { status: ['livré'] },
              attributes: []
            }]
          },
          {
            model: Avis,
            as: 'avis', 
            attributes: ['note']
          }
        ]
      });
  
      const stats = produits.map(produit => {
        const ventes = produit.OrderItems.reduce((acc, item) => acc + item.quantity, 0);
        const chiffreAffaire = ventes * produit.price;
  
        const notes = produit.avis.map(a => a.note);
        const moyenneNote = notes.length > 0
          ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2)
          : 0;
  
        return {
          id: produit.id,
          name: produit.name,
          price: produit.price,
          ventes,
          chiffreAffaire,
          totalAvis: notes.length,
          moyenneNote
        };
      });
  
      res.status(200).json({ produits: stats });
    } catch (err) {
      console.error("Erreur stats produits:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des stats produits." });
    }
  };

  
  exports.genererEtTelechargerPDFVentes = async (req, res) => {
    try {
        const fournisseurId = req.user.id;
        const { startDate, endDate } = req.query || {};

        const dateFilter = {};
        if (startDate) dateFilter.createdAt = { [Op.gte]: new Date(startDate) };
        if (endDate) {
            dateFilter.createdAt = dateFilter.createdAt || {};
            dateFilter.createdAt[Op.lte] = new Date(endDate);
        }

        const commandes = await Order.findAll({
            include: [{
                model: OrderItem,
                as: 'items',
                where: { fournisseurId },
                include: [{
                    model: Produit,
                    attributes: ['id', 'name', 'price']
                }]
            }],
            where: {
                status: ['livré'],
                ...dateFilter
            },
            order: [['createdAt', 'ASC']]
        });

        const stats = {
            totalVentes: 0,
            chiffreAffaire: 0,
            commandes: commandes.length,
            clientsUnique: new Set(),
            produits: {},
            monthlySales: []
        };

        const monthlyMap = {};

        commandes.forEach(commande => {
            stats.clientsUnique.add(commande.userId);

            const date = new Date(commande.createdAt);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyMap[monthYear]) {
                monthlyMap[monthYear] = {
                    mois: monthYear,
                    ventes: 0,
                    ca: 0
                };
            }

            commande.items.forEach(item => {
                const produit = item.Produit;
                const itemTotal = item.quantity * produit.price;

                if (!stats.produits[item.productId]) {
                    stats.produits[item.productId] = {
                        name: produit.name,
                        quantite: 0,
                        chiffre: 0
                    };
                }
                stats.produits[item.productId].quantite += item.quantity;
                stats.produits[item.productId].chiffre += itemTotal;

                stats.totalVentes += item.quantity;
                stats.chiffreAffaire += itemTotal;

                monthlyMap[monthYear].ventes += item.quantity;
                monthlyMap[monthYear].ca += itemTotal;
            });
        });

        stats.monthlySales = Object.values(monthlyMap).sort((a, b) => {
            return new Date(a.mois) - new Date(b.mois);
        });

        stats.monthlySales = stats.monthlySales.map(month => ({
            ...month,
            mois: new Date(month.mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        }));

        stats.clientsUnique = stats.clientsUnique.size;

        // 🟢 Création du document PDF avec les métadonnées directement ici
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Statistiques des Ventes - Fournisseur ${fournisseurId}`,
                Author: 'Weefarm',
                Subject: `Statistiques des ventes pour la période ${startDate || 'début'} à ${endDate || 'fin'}`,
                CreationDate: new Date()
            }
        });

        // Titre du document
        doc.fontSize(18).text('Statistiques des Ventes (Fournisseur)', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Période: ${startDate || 'Début'} - ${endDate || 'Fin'}`, { align: 'center' });
        doc.moveDown(1);

        // Statistiques générales
        doc.fontSize(14).text('Statistiques Générales', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Total des ventes: ${stats.totalVentes}`);
        doc.text(`Chiffre d'affaires total: ${stats.chiffreAffaire.toFixed(2)} DNT`);
        doc.text(`Nombre total de commandes: ${stats.commandes}`);
        doc.text(`Nombre de clients uniques: ${stats.clientsUnique}`);
        doc.moveDown(1);

        // Statistiques par produit
        doc.fontSize(14).text('Statistiques par Produit', { underline: true });
        doc.moveDown(0.5);

        const productTable = {
            headers: ['Produit', 'Quantité Vendue', 'Chiffre d\'affaires'],
            rows: Object.values(stats.produits).map(p => [p.name, p.quantite, `${p.chiffre.toFixed(2)} DNT`])
        };

        const drawTable = (doc, table) => {
            let y = doc.y;
            const rowHeight = 20;
            const columnWidths = [200, 100, 150];

            doc.font('Helvetica-Bold');
            table.headers.forEach((header, i) => {
                doc.text(header, 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
            });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(50 + columnWidths.reduce((a, b) => a + b, 0), doc.y).stroke();
            doc.moveDown(0.5);
            doc.font('Helvetica');
            y = doc.y;

            table.rows.forEach(row => {
                row.forEach((cell, i) => {
                    doc.text(cell, 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
                });
                y += rowHeight;
                if (y > doc.page.height - 50) {
                    doc.addPage({ size: 'A4', margin: 50 });
                    y = doc.y;
                }
            });
        };

        drawTable(doc, productTable);
        doc.moveDown(1);

        // Statistiques mensuelles
        doc.fontSize(14).text('Ventes Mensuelles', { underline: true });
        doc.moveDown(0.5);

        const monthlyTable = {
            headers: ['Mois', 'Nombre de Ventes', 'Chiffre d\'affaires'],
            rows: stats.monthlySales.map(m => [m.mois, m.ventes, `${m.ca.toFixed(2)} DNT`])
        };

        drawTable(doc, monthlyTable);

        doc.end();

        // Envoyer le PDF
        const pdfBytes = await new Promise((resolve) => {
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=statistiques_ventes_${new Date().toISOString().slice(0, 10)}.pdf`);
        res.send(pdfBytes);

    } catch (err) {
        console.error("Erreur lors de la génération et du téléchargement du PDF des ventes:", err);
        res.status(500).json({ message: "Erreur lors de la génération du PDF des statistiques de ventes." });
    }
};
