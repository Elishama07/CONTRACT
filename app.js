'use strict';

const { Contract } = require('fabric-contract-api');

class SupplyChainContract extends Contract {

    async initLedger(ctx) {
        console.info('Initialisation du ledger avec des produits par défaut');
        const produits = [
            {
                id: '1',
                nom: 'Produit 1',
                proprietaire: 'Fabricant',
                etat: 'En stock'
            },
            {
                id: '2',
                nom: 'Produit 2',
                proprietaire: 'Fournisseur',
                etat: 'En transit'
            }
        ];

        for (let i = 0; i < produits.length; i++) {
            await ctx.stub.putState(produits[i].id, Buffer.from(JSON.stringify(produits[i])));
            console.info('Produit ajouté au ledger : ', produits[i]);
        }
        console.info('Initialisation du ledger terminée');
    }

    async enregistrerProduit(ctx, id, nom, proprietaire, etat) {
        console.info('Enregistrement d\'un nouveau produit');
        const produit = {
            id,
            nom,
            proprietaire,
            etat
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(produit)));
        console.info('Produit enregistré dans le ledger : ', produit);
        return JSON.stringify(produit);
    }

    async recupererProduit(ctx, id) {
        const produitJSON = await ctx.stub.getState(id);
        if (!produitJSON || produitJSON.length === 0) {
            throw new Error(`Le produit avec l'ID ${id} n'a pas été trouvé`);
        }
        console.info('Produit récupéré du ledger : ', produitJSON.toString());
        return produitJSON.toString();
    }

    async updateProduit(ctx, id, nom, proprietaire, etat) {
        console.info('Mise à jour du produit');
        const produitJSON = await ctx.stub.getState(id);
        if (!produitJSON || produitJSON.length === 0) {
            throw new Error(`Le produit avec l'ID ${id} n'a pas été trouvé`);
        }
        const produit = JSON.parse(produitJSON.toString());
        produit.nom = nom;
        produit.proprietaire = proprietaire;
        produit.etat = etat;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(produit)));
        console.info('Produit mis à jour dans le ledger : ', produit);
        return JSON.stringify(produit);
    }

    async getAllProducts(ctx) {
        console.info('Récupération de tous les produits du ledger');
        const iterator = await ctx.stub.getStateByRange('', '');
        const produits = [];
        for await (const { key, value } of iterator) {
            produits.push(JSON.parse(value.toString()));
        }
        console.info('Tous les produits récupérés : ', produits);
        return JSON.stringify(produits);
    }

    async deleteProduct(ctx, id) {
        console.info('Suppression du produit');
        const produitJSON = await ctx.stub.getState(id);
        if (!produitJSON || produitJSON.length === 0) {
            throw new Error(`Le produit avec l'ID ${id} n'a pas été trouvé`);
        }
        await ctx.stub.deleteState(id);
        console.info('Produit supprimé du ledger avec succès');
    }

    async transferProduct(ctx, id, nouveauProprietaire) {
        console.info('Transfert de propriété du produit');
        const produitJSON = await ctx.stub.getState(id);
        if (!produitJSON || produitJSON.length === 0) {
            throw new Error(`Le produit avec l'ID ${id} n'a pas été trouvé`);
        }
        const produit = JSON.parse(produitJSON.toString());
        produit.proprietaire = nouveauProprietaire;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(produit)));
        console.info('Propriétaire du produit mis à jour : ', produit);
        return JSON.stringify(produit);
    }
}

module.exports = SupplyChainContract;
