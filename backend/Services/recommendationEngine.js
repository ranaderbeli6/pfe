const { Produit, Cart, CartItem } = require('../Models');
const { removeStopwords } = require('stopword');
const { lemmatize } = require('french-verbs-lefff');
const cosineSimilarity = require('cosine-similarity');

class RecommendationEngine {
    constructor() {
        this.productVectors = new Map();
        this.termIndex = new Map();
        this.nextTermId = 0;
        this.cartItemAlias = 'items'; // Ajustez selon votre alias réel
    }

    async initialize() {
        console.log('Initialisation du moteur de recommandation...');

        try {
            // 1. Charger tous les produits approuvés
            const produits = await Produit.findAll({
                where: { status: 'approuvé' },
                attributes: ['id', 'name', 'description', 'category']
            });
            console.log(`Nombre de produits approuvés trouvés: ${produits.length}`);

            // 2. Construire le vocabulaire
            this.buildVocabulary(produits);
            console.log(`Taille du vocabulaire (termIndex): ${this.termIndex.size}`);

            // 3. Créer les vecteurs
            produits.forEach(produit => {
                const vector = this.createProductVector(produit);
                this.productVectors.set(produit.id, vector);
            });
            console.log(`Nombre de vecteurs de produits créés: ${this.productVectors.size}`);

            console.log('Moteur de recommandation initialisé.');
        } catch (error) {
            console.error('Erreur initialisation moteur:', error);
            throw error;
        }
    }

    buildVocabulary(produits) {
        produits.forEach(produit => {
            const text = `${produit.name} ${produit.description} ${produit.category}`;
            const terms = this.tokenize(text);

            terms.forEach(term => {
                if (!this.termIndex.has(term)) {
                    this.termIndex.set(term, this.nextTermId++);
                }
            });
        });
    }

    tokenize(text) {
        const cleaned = text.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, ' ');

        return removeStopwords(
            cleaned.split(/\s+/).filter(t => t.length > 2),
            ['le', 'la', 'les', 'de', 'des', 'un', 'une']
        ).map(term => {
            try {
                const lemma = lemmatize(term);
                return lemma || term;
            } catch {
                return term;
            }
        });
    }

    createProductVector(produit) {
        const text = `${produit.name} ${produit.description} ${produit.category}`;
        const terms = this.tokenize(text);

        const termCounts = new Map();
        terms.forEach(term => {
            const termId = this.termIndex.get(term);
            if (termId !== undefined) {
                termCounts.set(termId, (termCounts.get(termId) || 0) + 1);
            }
        });

        const vector = new Array(this.termIndex.size).fill(0);
        termCounts.forEach((count, termId) => {
            vector[termId] = count;
        });

        return vector;
    }

    async getRecommendedProducts(userId, limit = 5) {
        if (this.productVectors.size === 0) {
            await this.initialize();
        }

        try {
            const cart = await Cart.findOne({
                where: { userId, status: 'en cours' },
                include: [{
                    model: CartItem,
                    as: this.cartItemAlias
                }]
            });
            console.log(`Panier de l'utilisateur ${userId}:`, cart ? cart.get({ plain: true }) : null);

            if (!cart || !cart[this.cartItemAlias]?.length) {
                console.log(`Le panier de l'utilisateur ${userId} est vide ou n'existe pas.`);
                return [];
            }

            const recommendations = new Map();
            for (const item of cart[this.cartItemAlias]) {
                const similar = this.findSimilarProducts(item.productId, limit);
                console.log(`Produits similaires pour le produit ID ${item.productId}:`, Array.from(similar.entries()));
                similar.forEach((score, productId) => {
                    recommendations.set(productId, (recommendations.get(productId) || 0) + score);
                });
            }

            const sortedRecommendations = Array.from(recommendations.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([productId]) => productId);

            console.log(`Recommandations pour l'utilisateur ${userId}:`, sortedRecommendations);
            return sortedRecommendations;

        } catch (error) {
            console.error('Erreur lors de la récupération des recommandations:', error);
            return [];
        }
    }

    findSimilarProducts(productId, limit) {
        const targetVector = this.productVectors.get(productId);
        if (!targetVector) {
            console.log(`Vecteur non trouvé pour le produit ID ${productId}`);
            return new Map();
        }

        const similarities = new Map();
        this.productVectors.forEach((vector, id) => {
            if (id !== productId) {
                const sim = cosineSimilarity(targetVector, vector);
                similarities.set(id, sim);
            }
        });

        const sortedSimilarities = Array.from(similarities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);

        return new Map(sortedSimilarities);
    }
}

module.exports = new RecommendationEngine();
