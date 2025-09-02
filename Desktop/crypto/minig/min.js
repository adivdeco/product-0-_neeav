const crypto = require('crypto');

// Block data
const blockData = {
    transactions: ['A sends 1 BTC to B', 'C sends 0.5 BTC to D'],
    previousHash: '00000abc123xyz789',
    timestamp: Date.now(),
};

// Difficulty level (number of leading zeros)
const difficulty = 6;
const targetPrefix = '0'.repeat(difficulty);

let nonce = 0;
let hash;

while (true) {
    // Create block header string with nonce
    const blockHeader = JSON.stringify(blockData) + nonce;
    console.log(blockHeader);


    // Calculate double SHA-256 hash
    hash = crypto.createHash('sha256').update(blockHeader).digest('hex');
    hash = crypto.createHash('sha256').update(hash).digest('hex');

    // Check if hash starts with required zeros (proof-of-work)
    if (hash.startsWith(targetPrefix)) {
        console.log('🎉 Block mined!');
        console.log('Nonce:', nonce);
        console.log('Hash:', hash);
        break;
    }

    nonce++;
}
