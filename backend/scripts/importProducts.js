const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../src/models/productSchema');

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
    console.error('❌ DB_URL is missing in .env file');
    process.exit(1);
}

const args = process.argv.slice(2);
const shopIdIndex = args.indexOf('--shopId');
const shopId = shopIdIndex !== -1 ? args[shopIdIndex + 1] : null;

if (!shopId) {
    console.log('ℹ️ No global --shopId provided. Will rely on "shopId" in products.json');
}

const importProducts = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log('✅ Connected to MongoDB');

        const productsPath = path.join(__dirname, 'products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

        console.log(`📦 Found ${productsData.length} products to import`);

        const productsToInsert = productsData.map(product => {
            const productShopId = product.shopId || shopId;

            if (!productShopId) {
                console.warn(`⚠️ Skipping product "${product.name}" - No shopId found in JSON or arguments`);
                return null;
            }

            return {
                ...product,
                shopId: new mongoose.Types.ObjectId(productShopId)
            };
        }).filter(p => p !== null);

        if (productsToInsert.length === 0) {
            console.log('❌ No valid products to insert (missing shopId?)');
            process.exit(1);
        }

        console.log('🔄 Importing products... (Duplicates will be skipped)');

        try {
            const result = await Product.insertMany(productsToInsert, { ordered: false });
            console.log(`✅ Successfully imported ${result.length} new products!`);
        } catch (error) {
            if (error.code === 11000 || error.writeErrors) {
                // If we have writeErrors, it means some inserted, some failed
                const insertedCount = error.insertedDocs ? error.insertedDocs.length : 0;
                // In Mongoose/MongoDB driver 4+, result might be in error.result for ordered: false
                // but let's rely on what we can see. Mongoose typically throws with the BulkWriteError

                // Helper to get error code
                const getCode = (e) => e.code || (e.err && e.err.code);
                const getMsg = (e) => e.errmsg || (e.err && e.err.errmsg) || e.message;

                // Count duplicates
                const duplicates = error.writeErrors ? error.writeErrors.filter(e => getCode(e) === 11000).length : 0;
                const otherErrors = error.writeErrors ? error.writeErrors.length - duplicates : 0;

                console.log(`⚠️ Completed with some skips:`);
                console.log(`   ✅ Inserted: ${insertedCount}`);
                console.log(`   ⏭️ Skipped (Duplicate Name): ${duplicates}`);

                if (otherErrors > 0) {
                    console.log(`   ❌ Other Errors: ${otherErrors}`);
                    error.writeErrors.forEach(e => {
                        if (getCode(e) !== 11000) console.error(`      - ${getMsg(e)}`);
                    });
                }
            } else {
                // Not a bulk write error we expected
                throw error;
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing products:', error);
        process.exit(1);
    }
};

importProducts();


