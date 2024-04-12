'use strict';

const { Contract } = require('fabric-contract-api');

class SupplyChainContract extends Contract {

    async initLedger(ctx) {
        console.info('Initializing ledger with default products');
        const products = [
            {
                id: '1',
                name: 'Product 1',
                owner: 'Manufacturer',
                status: 'In stock'
            },
            {
                id: '2',
                name: 'Product 2',
                owner: 'Supplier',
                status: 'In transit'
            }
        ];

        for (let i = 0; i < products.length; i++) {
            await ctx.stub.putState(products[i].id, Buffer.from(JSON.stringify(products[i])));
            console.info('Product added to ledger: ', products[i]);
        }
        console.info('Ledger initialization completed');
    }

    async registerProduct(ctx, id, name, owner, status) {
        console.info('Registering a new product');
        const product = {
            id,
            name,
            owner,
            status
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));
        console.info('Product registered in the ledger: ', product);
        return JSON.stringify(product);
    }

    async retrieveProduct(ctx, id) {
        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`The product with ID ${id} was not found`);
        }
        console.info('Product retrieved from the ledger: ', productJSON.toString());
        return productJSON.toString();
    }

    async updateProduct(ctx, id, name, owner, status) {
        console.info('Updating the product');
        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`The product with ID ${id} was not found`);
        }
        const product = JSON.parse(productJSON.toString());
        product.name = name;
        product.owner = owner;
        product.status = status;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));
        console.info('Product updated in the ledger: ', product);
        return JSON.stringify(product);
    }

    async getAllProducts(ctx) {
        console.info('Retrieving all products from the ledger');
        const iterator = await ctx.stub.getStateByRange('', '');
        const products = [];
        for await (const { key, value } of iterator) {
            products.push(JSON.parse(value.toString()));
        }
        console.info('All products retrieved: ', products);
        return JSON.stringify(products);
    }

    async deleteProduct(ctx, id) {
        console.info('Deleting the product');
        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`The product with ID ${id} was not found`);
        }
        await ctx.stub.deleteState(id);
        console.info('Product successfully deleted from the ledger');
    }

    async transferProduct(ctx, id, newOwner) {
        console.info('Transferring ownership of the product');
        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`The product with ID ${id} was not found`);
        }
        const product = JSON.parse(productJSON.toString());
        product.owner = newOwner;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));
        console.info('Owner of the product updated: ', product);
        return JSON.stringify(product);
    }
}

module.exports = SupplyChainContract;
