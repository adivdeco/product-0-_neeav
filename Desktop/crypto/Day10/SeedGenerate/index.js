const bip39 = require('bip39');
const ethers = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const { Keypair } = require('@solana/web3.js');
const { derivePath } = require('ed25519-hd-key');
// const bs58 = require('bs58');
const bs58 = require('bs58').default;

const bip32 = BIP32Factory(ecc);


function deriveEthereumWallet(seed) {
  const ethPath = "m/44'/60'/0'/0/0";
  const rootNode = ethers.HDNodeWallet.fromSeed(seed);    // 
  const ethNode = rootNode.derivePath(ethPath);

  console.log("\n--- Ethereum ---");
  console.log("Derivation Path:   ", ethPath);
  console.log("Private Key:       ", ethNode.privateKey);
  console.log("Public Key:        ", ethNode.publicKey);
  console.log("Address:           ", ethNode.address);
}


function deriveBitcoinWallet(seed) {
  const btcPath = "m/44'/0'/0'/0/0";

  const rootNode = bip32.fromSeed(seed); // master private key..
  const btcNode = rootNode.derivePath(btcPath);  // private key
  const btcAddress = bitcoin.payments.p2pkh({       // public address
    pubkey: Buffer.from(btcNode.publicKey),
  }).address;


  // publicKey = uint8[12,123,1,21,123,1,4,23,211,6,8,9] == hexdecimal

  const publicKey = Array.from(btcNode.publicKey)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  console.log("\n--- Bitcoin ---");
  console.log("Derivation Path:   ", btcPath);
  console.log("Private Key (WIF): ", btcNode.toWIF());
  console.log("Public Key:        ", publicKey);
  console.log("Address:           ", btcAddress);
}


function deriveSolanaWallet(seed) {
  const solanaPath = "m/44'/501'/0'/0'";
  const solanaDerivedSeed = derivePath(solanaPath, seed).key;
  const solanaKeypair = Keypair.fromSeed(solanaDerivedSeed);
  const solanaAddress = solanaKeypair.publicKey.toBase58();


  const solanaPrivateKey = bs58.encode(Buffer.from(solanaKeypair.secretKey));

  console.log("\n--- Solana ---");
  console.log("Derivation Path:   ", solanaPath);
  console.log("Private Key (Base58):", solanaPrivateKey);
  console.log("Public Key/Address:", solanaAddress);
}


async function main() {
  const mnemonic = bip39.generateMnemonic();   // from hear it generate 132 bit num or 12 word seed phase..
  console.log("========================================================================");
  console.log("✅ Generated 12-Word Mnemonic Phrase:");
  console.log(mnemonic);
  console.log("========================================================================");

  const seed = await bip39.mnemonicToSeed(mnemonic);  // as mechine only deal with num so change seed in num
  // console.log(seed);          // <Buffer 96 70 df 4a e3 6d d9 ef 1e 08 6d 7d a0 71 a5 25 52 5c f3 f4 8f 91 a4 aa 4f dc 33 1f 4a e6 36 2b 23 14 75 36 e2 ed 07 2d a8 65 50 db 46 2b 6d 3d 5b bb ... 14 more bytes>

  // deriveEthereumWallet(seed);
  deriveBitcoinWallet(seed);
  // deriveSolanaWallet(seed);

  console.log("\n========================================================================");
  console.log("✅ Wallet generation complete.");
}

main().catch(console.error);