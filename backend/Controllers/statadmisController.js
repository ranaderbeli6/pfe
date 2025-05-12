const { Produit, Order, OrderItem, User ,Avis} = require('../Models');
const { Op } = require('sequelize');
const { sequelize } = require('sequelize');
const ExcelJS = require('exceljs');

exports.getGlobalVentesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query || {};
    const dateFilter = {};

    if (startDate) dateFilter.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) {
      dateFilter.createdAt = dateFilter.createdAt || {};
      dateFilter.createdAt[Op.lte] = new Date(endDate);
    }

    const commandes = await Order.findAll({
      where: {
        status: 'livré',
        ...dateFilter
      },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Produit,
          attributes: ['id', 'name', 'price']
        }]
      }],
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
        monthlyMap[monthYear] = { mois: monthYear, ventes: 0, ca: 0 };
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

    stats.monthlySales = Object.values(monthlyMap).sort((a, b) => new Date(a.mois) - new Date(b.mois));
    stats.monthlySales = stats.monthlySales.map(month => ({
      ...month,
      mois: new Date(month.mois).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    }));

    stats.clientsUnique = stats.clientsUnique.size;

    res.status(200).json(stats);
  } catch (err) {
    console.error("Erreur stats globales admin:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques." });
  }
};

exports.getGlobalProduitsStats = async (req, res) => {
    try {
      const produits = await Produit.findAll({
        include: [
          {
            model: OrderItem,
            attributes: ['quantity'],
            include: [{
              model: Order,
              where: { status: 'livré' },
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
          ventes,
          chiffreAffaire,
          totalAvis: notes.length,
          moyenneNote
        };
      });
  
      res.status(200).json({ produits: stats });
    } catch (err) {
      console.error("Erreur stats produits admin:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des stats produits." });
    }
  };
  exports.getProduitsLesPlusVendus = async (req, res) => {
    try {
      const produits = await Produit.findAll({
        include: [{
          model: OrderItem,
          attributes: ['quantity'],
          include: [{
            model: Order,
            where: { status: 'livré' },
            attributes: []
          }]
        }]
      });
  
      const produitsVendus = produits.map(p => ({
        id: p.id,
        name: p.name,
        ventes: p.OrderItems.reduce((acc, item) => acc + item.quantity, 0)
      }));
  
      produitsVendus.sort((a, b) => b.ventes - a.ventes);
  
      res.status(200).json({ topProduits: produitsVendus.slice(0, 5) }); // top 5
    } catch (err) {
      console.error("Erreur top produits:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des top produits." });
    }
  };
  exports.getChiffreAffaireParFournisseur = async (req, res) => {
    try {
      const orderItems = await OrderItem.findAll({
        include: [
          {
            model: Order,
            where: { status: 'livré' },
            attributes: []
          },
          {
            model: Produit,
            attributes: ['price']
          }
        ]
      });
  
      const map = {};
  
      orderItems.forEach(item => {
        const fournisseurId = item.fournisseurId;
        const montant = item.quantity * item.Produit.price;
  
        if (!map[fournisseurId]) {
          map[fournisseurId] = { fournisseurId, ca: 0 };
        }
        map[fournisseurId].ca += montant;
      });
  
      const result = Object.values(map);
  
      res.status(200).json({ fournisseurs: result });
    } catch (err) {
      console.error("Erreur CA fournisseur:", err);
      res.status(500).json({ message: "Erreur lors du calcul du CA par fournisseur." });
    }
  };

  exports.getTopClients = async (req, res) => {
    try {
        const { startDate, endDate } = req.query || {};
        const dateFilter = {};

        if (startDate) dateFilter.createdAt = { [Op.gte]: new Date(startDate) };
        if (endDate) {
            dateFilter.createdAt = dateFilter.createdAt || {};
            dateFilter.createdAt[Op.lte] = new Date(endDate);
        }

        const commandes = await Order.findAll({
            where: {
                status: 'livré',
                ...dateFilter
            },
            include: {
                model: User,
                attributes: ['id', 'fullName', 'email','phoneNumber']
            }
        });

        // Comptage des commandes par utilisateur
        const orderCountMap = {};

        commandes.forEach(order => {
            const userId = order.userId;
            const user = order.User;

            if (!orderCountMap[userId]) {
                orderCountMap[userId] = {
                    user,
                    ordersCount: 1
                };
            } else {
                orderCountMap[userId].ordersCount++;
            }
        });

        // Convertir en tableau et trier
        const sortedClients = Object.values(orderCountMap)
            .sort((a, b) => b.ordersCount - a.ordersCount)
            .slice(0, 5); // top 5

        res.status(200).json(sortedClients);
    } catch (err) {
        console.error('Erreur top clients:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

  exports.getVentesMensuelles = async (req, res) => {
    try {
      const commandes = await Order.findAll({
        where: { status: 'livré' },
        include: [{
          model: OrderItem,
          as: 'items', // 🔥 Important : correspond à l'alias défini dans Order.hasMany(OrderItem)
          include: [Produit]
        }]
      });
  
      const monthlyMap = {};
  
      commandes.forEach(cmd => {
        const date = new Date(cmd.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  
        if (!monthlyMap[key]) {
          monthlyMap[key] = { mois: key, ventes: 0, ca: 0 };
        }
  
        // ici on accède bien à cmd.items
        cmd.items.forEach(item => {
          monthlyMap[key].ventes += item.quantity;
          monthlyMap[key].ca += item.quantity * item.Produit.price;
        });
      });
  
      const monthlySales = Object.values(monthlyMap).sort((a, b) => new Date(a.mois) - new Date(b.mois))
        .map(month => ({
          ...month,
          mois: new Date(month.mois).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        }));
  
      res.status(200).json({ monthlySales });
    } catch (err) {
      console.error("Erreur ventes mensuelles:", err);
      res.status(500).json({ message: "Erreur lors de la récupération des ventes mensuelles." });
    }
  };



exports.exportGlobalVentesStatsToExcel = async (req, res) => {
    try {
        const { startDate, endDate } = req.query || {};
        const dateFilter = {};

        if (startDate && endDate) {
            dateFilter.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        } else if (startDate) {
            dateFilter.createdAt = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            dateFilter.createdAt = { [Op.lte]: new Date(endDate) };
        }

        const commandes = await Order.findAll({
            where: {
                status: 'livré',
                ...dateFilter
            },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Produit,
                    attributes: ['id', 'name', 'price']
                }, {
                    model: User,
                    as: 'Fournisseur',
                    attributes: ['id', 'fullName'],
                    where: { role: 'fournisseur' },
                    required: false
                }]
            }],
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
                monthlyMap[monthYear] = { mois: monthYear, ventes: 0, ca: 0 };
            }

            commande.items.forEach(item => {
                const produit = item.Produit;
                const fournisseur = item.Fournisseur; // Accès direct via OrderItem
                const itemTotal = item.quantity * produit.price;

                if (!stats.produits[item.productId]) {
                    stats.produits[item.productId] = {
                        name: produit.name,
                        quantite: 0,
                        chiffre: 0,
                        fournisseur: fournisseur ? { id: fournisseur.id, nom: fournisseur.fullName } : null
                    };
                }

                stats.produits[item.productId].quantite += item.quantity;
                stats.produits[item.productId].chiffre += itemTotal;

                stats.totalVentes += item.quantity; // Calcul global des ventes
                stats.chiffreAffaire += itemTotal; // Calcul global du chiffre d'affaires

                monthlyMap[monthYear].ventes += item.quantity;
                monthlyMap[monthYear].ca += itemTotal;
            });
        });
        


        stats.monthlySales = Object.values(monthlyMap)
            .sort((a, b) => new Date(a.mois) - new Date(b.mois))
            .map(month => ({
                ...month,
                mois: new Date(month.mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            }));

        stats.clientsUnique = stats.clientsUnique.size;

        // Création du fichier Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Statistiques Ventes');

        // Styles
        const headerStyle = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } }, font: { color: { argb: 'FFFFFFFF' }, bold: true }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const titleStyle = { font: { size: 16, bold: true, color: { argb: 'FF000000' } } };
        const currencyStyle = { numFmt: '#,##0.00 DNT' };
        const totalStyle = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }, font: { bold: true } };

        // Titre principal
        const titleRow = worksheet.addRow(['Statistiques Globales des Ventes']);
        titleRow.font = titleStyle.font;
        worksheet.mergeCells('A1:F1');
        worksheet.addRow([]);

        // Statistiques générales (comme dans votre fonction originale)
        const generalHeader = worksheet.addRow(['Métrique', 'Valeur']);
        generalHeader.eachCell(cell => cell.style = headerStyle);
        worksheet.addRow(['Total des ventes', stats.totalVentes]);
        worksheet.addRow(['Chiffre d\'affaires total', stats.chiffreAffaire]).getCell(2).style = currencyStyle;
        worksheet.addRow(['Nombre total de commandes', stats.commandes]);
        worksheet.addRow(['Nombre de clients uniques', stats.clientsUnique]);
        worksheet.addRow([]);

        // Statistiques par produit avec informations du fournisseur
        const productTitle = worksheet.addRow(['Statistiques par Produit']);
        productTitle.font = titleStyle.font;
        worksheet.mergeCells(`A${productTitle.number}:F${productTitle.number}`);
        worksheet.addRow([]);

        const productHeader = worksheet.addRow([
            'ID Produit',
            'Nom du Produit',
            'Quantité Vendue',
            'Chiffre d\'affaires',
            'ID Fournisseur',
            'Nom du Fournisseur'
        ]);
        productHeader.eachCell(cell => cell.style = headerStyle);

        Object.keys(stats.produits).forEach(productId => {
            const produitStat = stats.produits[productId];
            worksheet.addRow([
                productId,
                produitStat.name,
                produitStat.quantite,
                produitStat.chiffre,
                produitStat.fournisseur ? produitStat.fournisseur.id : '',
                produitStat.fournisseur ? produitStat.fournisseur.nom : ''
            ]);
            worksheet.lastRow.getCell(4).style = currencyStyle;
        });

        const productTotal = worksheet.addRow([
            'TOTAL',
            '',
            stats.totalVentes,
            stats.chiffreAffaire,
            '',
            ''
        ]);
        productTotal.eachCell(cell => cell.style = totalStyle);
        productTotal.getCell(4).style = { ...totalStyle, ...currencyStyle };

        worksheet.addRow([]);

        // Statistiques mensuelles
        const monthlyTitle = worksheet.addRow(['Statistiques Mensuelles']);
        monthlyTitle.font = titleStyle.font;
        worksheet.mergeCells(`A${monthlyTitle.number}:C${monthlyTitle.number}`);
        worksheet.addRow([]);

        const monthlyHeader = worksheet.addRow(['Mois', 'Nombre de Ventes', 'Chiffre d\'affaires']);
        monthlyHeader.eachCell(cell => cell.style = headerStyle);

        stats.monthlySales.forEach(monthlyStat => {
            const row = worksheet.addRow([monthlyStat.mois, monthlyStat.ventes, monthlyStat.ca]);
            row.getCell(3).style = currencyStyle;
        });

        // Ajustement automatique des colonnes
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // Pied de page
        worksheet.addRow([]);
        worksheet.addRow([`Export généré le ${new Date().toLocaleDateString('fr-FR')}`]).getCell(1).font = { italic: true };

        // Envoi du fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=export_ventes_fournisseurs_${new Date().toISOString().slice(0, 10)}.xlsx`);

        await workbook.xlsx.write(res);

    } catch (err) {
        console.error("Erreur lors de l'export Excel avec fournisseur (via OrderItem):", err);
        res.status(500).json({
            message: "Erreur lors de la génération du rapport avec les informations du fournisseur",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};


