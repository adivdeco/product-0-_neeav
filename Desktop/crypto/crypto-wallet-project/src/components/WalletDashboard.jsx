

// import React, { useEffect, useState, useCallback } from 'react';
// import { useWallet } from '../context/WalletContext';
// import AssetCard from './AssetCard.jsx';
// import { getEthBalance, getSolBalance, getBtcBalance } from '../services/blockchain';
// import { Eye, EyeOff, LogOut, LogOutIcon, RefreshCcw, Shield, } from 'lucide-react';
// // import { BtcLogo, EthLogo, SolLogo } from './CoinLogos';

// function WalletDashboard() {
//     const { wallet, logout } = useWallet();
//     const [balances, setBalances] = useState({ eth: null, sol: null, btc: null });
//     const [showMnemonic, setShowMnemonic] = useState(false);
//     const [isRefreshing, setIsRefreshing] = useState(false);

//     const fetchBalances = useCallback(async () => {
//         if (!wallet || !wallet.ethereum || !wallet.bitcoin || !wallet.solana) return;

//         try {
//             setIsRefreshing(true);
//             const [eth, sol, btc] = await Promise.all([
//                 getEthBalance(wallet.ethereum.address),
//                 getSolBalance(wallet.solana.address),
//                 getBtcBalance(wallet.bitcoin.address)
//             ]);
//             setBalances({ eth, sol, btc });
//         } catch (error) {
//             console.error("Failed to fetch all balances:", error);
//         } finally {
//             setIsRefreshing(false);
//         }
//     }, [wallet]);

//     useEffect(() => {
//         fetchBalances();
//         const interval = setInterval(fetchBalances, 30000);
//         return () => clearInterval(interval);
//     }, [fetchBalances]);

//     if (!wallet || !wallet.ethereum || !wallet.bitcoin || !wallet.solana) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
//                 <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-red-500/30 max-w-md w-full">
//                     <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
//                         <Shield className="mr-2" /> Wallet Data Error
//                     </h2>
//                     <p className="text-gray-300 mb-6">
//                         There was a problem loading your wallet data. Please try logging out and importing your wallet again.
//                     </p>
//                     <button
//                         onClick={logout}
//                         className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
//                     >
//                         <LogOutIcon className="mr-2" /> Logout
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const coins = [
//         { name: 'Ethereum', symbol: 'ETH', ...wallet.ethereum },
//         { name: 'Solana', symbol: 'SOL', ...wallet.solana },
//         { name: 'Bitcoin', symbol: 'BTC', ...wallet.bitcoin },
//         // { name: 'Dodge', symbol: 'DODG', ...wallet.bitcoin },
//     ];

//     return (
//         <div className="fixed inset-0  flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-purple-900 overflow-y-auto ">
//             <div className="container mx-auto  p-6">
//                 {/* Header */}
//                 <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//                     <div>
//                         <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
//                             Accord Wallet
//                         </h2>

//                     </div>
//                     <div className="flex gap-3">
//                         <button
//                             onClick={fetchBalances}
//                             disabled={isRefreshing}
//                             className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
//                         >
//                             <RefreshCcw className={`${isRefreshing ? 'animate-spin' : ''}`} />
//                             {isRefreshing ? 'Refreshing...' : 'Refresh'}
//                         </button>
//                         <button
//                             onClick={logout}
//                             className="bg-gray-800/60 text-white/80 font-bold py-2 px-5 rounded-lg border border-gray-700 hover:border-red-500/80 hover:bg-gray-700/80 hover:shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)] transition-all duration-300 flex items-center gap-2"
//                         >
//                             <LogOut className='text-red-400' /> Logout
//                         </button>
//                     </div>
//                 </header>

//                 {/* Mnemonic Phrase - Enhanced with blur and eye toggle */}
//                 <div className="relative bg-gray-800/80 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-5 mb-8 transition-all duration-300">
//                     <div className="flex justify-between items-center mb-3">
//                         <h3 className="font-bold text-yellow-400 flex items-center">
//                             <Shield className="mr-2" /> Your Recovery Phrase
//                         </h3>
//                         <button
//                             onClick={() => setShowMnemonic(!showMnemonic)}
//                             className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 rounded-full"
//                             aria-label={showMnemonic ? "Hide phrase" : "Show phrase"}
//                         >
//                             {showMnemonic ? <EyeOff size={20} /> : <Eye size={20} />}
//                         </button>
//                     </div>
//                     <div className={`font-mono text-sm break-words transition-all duration-300 ${showMnemonic ? 'text-yellow-300' : 'text-transparent blur-md'}`}
//                         style={{ textShadow: showMnemonic ? '0 0 8px rgba(234, 179, 8, 0.3)' : 'none' }}
//                     >
//                         {wallet.mnemonic}
//                     </div>
//                     <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showMnemonic ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
//                         <button
//                             onClick={() => setShowMnemonic(true)}
//                             className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/30 backdrop-blur-sm transition-all"
//                         >
//                             <Eye className="mr-1" /> Click to reveal secret phrase
//                         </button>
//                     </div>
//                 </div>

//                 {/* Assets Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {coins.map(coin => (
//                         <AssetCard
//                             key={coin.symbol}
//                             coin={coin}
//                             balance={balances[coin.symbol.toLowerCase()]}
//                             onTransactionSuccess={fetchBalances}
//                         />
//                     ))}
//                 </div>

//                 {/* Footer */}
//                 <div className="mt-8 text-center text-gray-500 text-sm">
//                     <p>Always keep your recovery phrase secure and never share it with anyone</p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default WalletDashboard;




import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { getEthBalance, getSolBalance, getBtcBalance } from '../services/blockchain';
import { Eye, EyeOff, LogOut, RefreshCcw, Shield, Copy, Send, ExternalLink } from 'lucide-react';

function WalletDashboard() {
    const { wallet, logout } = useWallet();
    const [balances, setBalances] = useState({ eth: null, sol: null, btc: null });
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState('ETH');

    const fetchBalances = useCallback(async () => {
        if (!wallet || !wallet.ethereum || !wallet.bitcoin || !wallet.solana) return;

        try {
            setIsRefreshing(true);
            const [eth, sol, btc] = await Promise.all([
                getEthBalance(wallet.ethereum.address),
                getSolBalance(wallet.solana.address),
                getBtcBalance(wallet.bitcoin.address)
            ]);
            setBalances({ eth, sol, btc });
        } catch (error) {
            console.error("Failed to fetch all balances:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [wallet]);

    useEffect(() => {
        fetchBalances();
        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, [fetchBalances]);

    const coins = [
        { name: 'Ethereum', symbol: 'ETH', ...wallet.ethereum },
        { name: 'Solana', symbol: 'SOL', ...wallet.solana },
        { name: 'Bitcoin', symbol: 'BTC', ...wallet.bitcoin },
    ];

    const currentCoin = coins.find(c => c.symbol === selectedCoin) || coins[0];

    if (!wallet || !wallet.ethereum || !wallet.bitcoin || !wallet.solana) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-red-500/30 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
                        <Shield className="mr-2" /> Wallet Data Error
                    </h2>
                    <p className="text-gray-300 mb-6">
                        There was a problem loading your wallet data. Please try logging out and importing your wallet again.
                    </p>
                    <button
                        onClick={logout}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                        <LogOut className="mr-2" /> Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-950 to-purple-900 overflow-y-auto">
            {/* Header */}
            <header className="flex justify-between items-center p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                    Accord Wallet
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={fetchBalances}
                        disabled={isRefreshing}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
                    >
                        <RefreshCcw className={`${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        onClick={logout}
                        className="bg-gray-800/60 text-white/80 font-bold py-2 px-5 rounded-lg border border-gray-700 hover:border-red-500/80 hover:bg-gray-700/80 hover:shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)] transition-all duration-300 flex items-center gap-2"
                    >
                        <LogOut className='text-red-400' /> Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Coin List */}
                <div className="w-80 border-r border-gray-800 overflow-y-auto">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-300 mb-4">Your Assets</h2>
                        <div className="space-y-3">
                            {coins.map(coin => (
                                <button
                                    key={coin.symbol}
                                    onClick={() => setSelectedCoin(coin.symbol)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${selectedCoin === coin.symbol ? 'bg-gray-800/50 border border-cyan-500/20' : 'bg-gray-800/30 hover:bg-gray-800/50'}`}
                                >
                                    <div className="flex items-center">
                                        <img
                                            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.symbol === 'BTC' ? '1' : coin.symbol === 'ETH' ? '1027' : '5426'}.png`}
                                            alt={coin.symbol}
                                            className="w-8 h-8 mr-3"
                                        />
                                        <div className="text-left">
                                            <h3 className="font-medium text-white">{coin.name}</h3>
                                            <p className="text-xs text-gray-400">{coin.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-white">
                                            {balances[coin.symbol.toLowerCase()] !== null ?
                                                parseFloat(balances[coin.symbol.toLowerCase()]).toFixed(6) : '...'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            ≈ ${balances[coin.symbol.toLowerCase()] !== null ?
                                                (balances[coin.symbol.toLowerCase()] * 1800).toFixed(2) : '...'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mnemonic Phrase */}
                    <div className="p-6 border-t border-gray-800">
                        <div className="relative bg-gray-800/80 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 transition-all duration-300">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-yellow-400 flex items-center text-sm">
                                    <Shield className="mr-2" size={16} /> Recovery Phrase
                                </h3>
                                <button
                                    onClick={() => setShowMnemonic(!showMnemonic)}
                                    className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 rounded-full"
                                >
                                    {showMnemonic ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className={`font-mono text-xs break-words transition-all duration-300 ${showMnemonic ? 'text-yellow-300' : 'text-transparent blur-md'}`}>
                                {wallet.mnemonic}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Coin Details */}
                <div className="flex-1 overflow-y-auto p-6">
                    <CoinDetails
                        coin={currentCoin}
                        balance={balances[currentCoin.symbol.toLowerCase()]}
                        onTransactionSuccess={fetchBalances}
                    />
                </div>
            </div>
        </div>
    );
}

// New CoinDetails component
function CoinDetails({ coin, balance, onTransactionSuccess }) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('send');

    const gradientColors = {
        ETH: 'from-cyan-400 to-blue-500',
        SOL: 'from-purple-400 to-pink-500',
        BTC: 'from-yellow-400 to-orange-500'
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        setMessage('');
        setError('');
        try {
            if (coin.symbol === 'ETH' || coin.symbol === 'BTC') {
                const txHash = coin.symbol === 'ETH'
                    ? await blockchain.sendEth(coin.privateKey, recipient, amount)
                    : await blockchain.sendBtc(coin.privateKey, recipient, parseFloat(amount));

                setMessage(<>
                    Transaction successful!
                    <a href={coin.symbol === 'ETH'
                        ? `https://etherscan.io/tx/${txHash}`
                        : `https://blockstream.info/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                    >
                        View <ExternalLink className="ml-1" size={14} />
                    </a>
                </>);
                resetFormAndRefresh();
            } else if (coin.symbol === 'SOL') {
                const signature = await blockchain.sendSol(coin.privateKey, recipient, parseFloat(amount));
                setMessage(`Transaction sent! Confirming...`);
                await pollForSolanaConfirmation(signature);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
            setSending(false);
        }
    };

    // ... (keep the rest of your transaction handling functions from AssetCard)

    return (
        <div className="max-w-2xl mx-auto">
            {/* Coin Header */}
            <div className="flex items-center mb-6">
                <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.symbol === 'BTC' ? '1' : coin.symbol === 'ETH' ? '1027' : '5426'}.png`}
                    alt={coin.symbol}
                    className="w-12 h-12 mr-4"
                />
                <div>
                    <h2 className="text-2xl font-bold text-white">{coin.name} ({coin.symbol})</h2>
                    <p className="text-gray-400">Balance: {balance !== null ? parseFloat(balance).toFixed(6) : '...'} {coin.symbol}</p>
                </div>
            </div>

            {/* Address */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Your {coin.symbol} Address</span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(coin.address);
                            setMessage('Address copied!');
                            setTimeout(() => setMessage(''), 3000);
                        }}
                        className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
                    >
                        <Copy size={14} className="mr-1" /> Copy
                    </button>
                </div>
                <p className="font-mono text-sm break-all bg-gray-900/50 p-2 rounded">
                    {coin.address}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6">

                {/* send */}
                <button
                    className={`py-3 px-6 font-medium ${activeTab === 'send' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('send')}
                >
                    Send
                </button>

                {/* revive */}
                <button
                    className={`py-3 px-6 font-medium ${activeTab === 'receive' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('receive')}
                >
                    Receive
                </button>
            </div>

            {/* Send Form */}
            {activeTab === 'send' && (
                <form onSubmit={handleSend} className="bg-gray-800/50 rounded-xl p-6">
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm mb-2">Recipient Address</label>
                        <input
                            type="text"
                            placeholder={`Enter ${coin.symbol} address`}
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm mb-2">Amount</label>
                        <input
                            type="text"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={sending || !recipient || !amount}
                        className={`w-full bg-gradient-to-r ${gradientColors[coin.symbol]} hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${sending ? 'opacity-80' : ''}`}
                    >
                        {sending ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <Send size={16} />
                        )}
                        Send {coin.symbol}
                    </button>
                </form>
            )}

            {/* Receive Section */}
            {activeTab === 'receive' && (
                <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                    <div className="bg-gray-900/50 p-6 rounded-lg mb-4">
                        <p className="text-gray-300 text-sm mb-4">Your {coin.symbol} Address</p>
                        <p className="font-mono text-sm break-all mb-6">{coin.address}</p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(coin.address);
                                setMessage('Address copied!');
                                setTimeout(() => setMessage(''), 3000);
                            }}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 mx-auto"
                        >
                            <Copy size={14} /> Copy Address
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Share this address to receive {coin.symbol} payments
                    </p>
                </div>
            )}

            {/* Messages */}
            {message && (
                <div className="mt-6 p-4 bg-green-900/30 text-green-400 text-sm rounded-lg border border-green-800/50">
                    {message}
                </div>
            )}
            {error && (
                <div className="mt-6 p-4 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-800/50">
                    {error}
                </div>
            )}
        </div>
    );
}

export default WalletDashboard;