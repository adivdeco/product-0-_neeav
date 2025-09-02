

// import React, { useState } from 'react';
// import * as blockchain from '../services/blockchain';
// import { Connection } from '@solana/web3.js';
// import { Copy, Send, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// function AssetCard({ coin, balance, onTransactionSuccess }) {
//     if (!coin) return null;
//     // console.log(coin.symbol);

//     const [recipient, setRecipient] = useState('');
//     const [amount, setAmount] = useState('');
//     const [sending, setSending] = useState(false);
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');
//     const [activeTab, setActiveTab] = useState('send');

//     const gradientColors = {
//         ETH: 'from-cyan-400 to-blue-500',
//         SOL: 'from-purple-400 to-pink-500',
//         BTC: 'from-yellow-400 to-orange-500'
//     };

//     const handleSend = async (e) => {
//         e.preventDefault();
//         setSending(true);
//         setMessage('');
//         setError('');
//         try {
//             if (coin.symbol === 'ETH' || coin.symbol === 'BTC') {
//                 const txHash = coin.symbol === 'ETH'
//                     ? await blockchain.sendEth(coin.privateKey, recipient, amount)
//                     : await blockchain.sendBtc(coin.privateKey, recipient, parseFloat(amount));

//                 setMessage(<>
//                     Transaction successful!
//                     <a href={coin.symbol === 'ETH'
//                         ? `https://etherscan.io/tx/${txHash}`
//                         : `https://blockstream.info/tx/${txHash}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
//                     >
//                         View <ExternalLink className="ml-1" size={14} />
//                     </a>
//                 </>);
//                 resetFormAndRefresh();
//             } else if (coin.symbol === 'SOL') {
//                 const signature = await blockchain.sendSol(coin.privateKey, recipient, parseFloat(amount));
//                 setMessage(`Transaction sent! Confirming...`);
//                 await pollForSolanaConfirmation(signature);
//             }
//         } catch (err) {
//             setError(`Error: ${err.message}`);
//             setSending(false);
//         }
//     };

//     const pollForSolanaConfirmation = async (signature) => {
//         const solscanLink = `https://solscan.io/tx/${signature}`;
//         const connection = new Connection(blockchain.SOL_RPC_URL);
//         let confirmed = false;
//         for (let i = 0; i < 30; i++) {
//             const status = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
//             if (status && status.value && (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized')) {
//                 setMessage(<>
//                     Transaction confirmed!
//                     <a href={solscanLink}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="ml-2 inline-flex items-center text-purple-400 hover:text-purple-300"
//                     >
//                         View <ExternalLink className="ml-1" size={14} />
//                     </a>
//                 </>);
//                 confirmed = true;
//                 resetFormAndRefresh();
//                 break;
//             }
//             await sleep(2000);
//         }
//         if (!confirmed) {
//             setError(<>
//                 Confirmation timed out.
//                 <a href={solscanLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="ml-2 inline-flex items-center text-purple-400 hover:text-purple-300"
//                 >
//                     Check <ExternalLink className="ml-1" size={14} />
//                 </a>
//             </>);
//             setSending(false);
//         }
//     };

//     const resetFormAndRefresh = () => {
//         setRecipient('');
//         setAmount('');
//         setSending(false);
//         if (onTransactionSuccess) onTransactionSuccess();
//     };

//     const copyToClipboard = (text) => {
//         navigator.clipboard.writeText(text);
//         setMessage('Address copied to clipboard!');
//         setTimeout(() => setMessage(''), 3000);
//     };

//     return (
//         <div className={`relative group bg-gradient-to-br ${gradientColors[coin.symbol]} rounded-2xl p-[0.5px] shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
//             <div className="relative h-full bg-gray-900 rounded-2xl p-5 flex flex-col">
//                 {/* Coin header */}
//                 <div className="flex justify-between items-start mb-4">
//                     <div>
//                         <h3 className="text-2xl font-bold text-white">{coin.name}</h3>
//                         <p className="text-gray-300 text-sm">{coin.symbol}</p>
//                     </div>
//                     <div className="bg-black/30 rounded-lg p-2">
//                         <div className="w-10 h-10 flex items-center justify-center">

//                             <img
//                                 src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.symbol === 'BTC' ? '1' : coin.symbol === 'ETH' ? '1027' : '5426'}.png`}
//                                 alt={coin.symbol}
//                                 className="w-8 h-8"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Balance display */}
//                 <div className="mb-6">
//                     <p className="text-gray-400 text-sm mb-1">Balance</p>
//                     <p className="text-3xl font-bold text-white">
//                         {balance !== null ? parseFloat(balance).toFixed(6) : '...'} {coin.symbol}
//                     </p>
//                     <p className="text-gray-400 text-sm mt-1">
//                         ≈ ${balance !== null ? (balance * 1800).toFixed(2) : '...'}
//                     </p>
//                 </div>

//                 {/* Address with copy */}
//                 <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 mb-4">
//                     <p className="text-xs text-gray-300 truncate">
//                         {coin.address.slice(0, 6)}...{coin.address.slice(-4)}
//                     </p>
//                     <button
//                         onClick={() => copyToClipboard(coin.address)}
//                         className="text-gray-400 hover:text-white transition-colors"
//                         aria-label="Copy address"
//                     >
//                         <Copy size={16} />
//                     </button>
//                 </div>

//                 {/* Tabs */}
//                 <div className="flex border-b border-gray-700 mb-4">
//                     <button
//                         className={`py-2 px-4 font-medium text-sm ${activeTab === 'send' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
//                         onClick={() => setActiveTab('send')}
//                     >
//                         Send
//                     </button>
//                     <button
//                         className={`py-2 px-4 font-medium text-sm ${activeTab === 'receive' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
//                         onClick={() => setActiveTab('receive')}
//                     >
//                         Receive
//                     </button>
//                 </div>

//                 {/* Send Form */}
//                 {activeTab === 'send' && (
//                     <form onSubmit={handleSend} className="mt-auto">
//                         <div className="mb-4">
//                             <label className="block text-gray-400 text-sm mb-1">Recipient Address</label>
//                             <input
//                                 type="text"
//                                 placeholder="0x..."
//                                 value={recipient}
//                                 onChange={(e) => setRecipient(e.target.value)}
//                                 required
//                                 className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
//                             />
//                         </div>
//                         <div className="mb-4">
//                             <label className="block text-gray-400 text-sm mb-1">Amount</label>
//                             <input
//                                 type="text"
//                                 placeholder="0.0"
//                                 value={amount}
//                                 onChange={(e) => setAmount(e.target.value)}
//                                 required
//                                 className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
//                             />
//                         </div>
//                         <button
//                             type="submit"
//                             disabled={sending || !recipient || !amount}
//                             className={`w-full bg-gradient-to-r ${gradientColors[coin.symbol]} hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${sending ? 'opacity-80' : ''}`}
//                         >
//                             {sending ? (
//                                 <span className="loading loading-spinner loading-sm"></span>
//                             ) : (
//                                 <Send size={16} />
//                             )}
//                             Send {coin.symbol}
//                         </button>
//                     </form>
//                 )}

//                 {/* Receive Section */}
//                 {activeTab === 'receive' && (
//                     <div className="mt-auto text-center">
//                         <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
//                             <p className="text-gray-300 text-sm mb-2">Your {coin.symbol} Address</p>
//                             <p className="font-mono text-sm break-all mb-3">{coin.address}</p>
//                             <button
//                                 onClick={() => copyToClipboard(coin.address)}
//                                 className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm flex items-center justify-center gap-1 mx-auto"
//                             >
//                                 <Copy size={14} /> Copy Address
//                             </button>
//                         </div>
//                         <p className="text-gray-400 text-xs">
//                             Share this address to receive {coin.symbol} payments
//                         </p>
//                     </div>
//                 )}

//                 {/* Messages */}
//                 {message && (
//                     <div className="mt-4 p-3 bg-green-900/50 text-green-400 text-sm rounded-lg">
//                         {message}
//                     </div>
//                 )}
//                 {error && (
//                     <div className="mt-4 p-3 bg-red-900/50 text-red-400 text-sm rounded-lg">
//                         {error}
//                     </div>
//                 )}

//                 {/* Glow effect */}
//                 <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br ${gradientColors[coin.symbol]} blur-lg -z-10 transition-opacity duration-300`}></div>
//             </div>
//         </div>
//     );
// }

// export default AssetCard;