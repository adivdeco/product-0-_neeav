import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { generateMnemonic, validateMnemonic } from '../services/wallet'; // Make sure validateMnemonic is imported
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [mnemonic, setMnemonic] = useState(Array(12).fill(''));
    const [newMnemonic, setNewMnemonic] = useState('');
    const { login } = useWallet();

    const handleInputChange = (index, value) => {
        const newMnemonic = [...mnemonic];
        newMnemonic[index] = value.toLowerCase().trim();
        setMnemonic(newMnemonic);
    };

    const handleImport = async (e) => {
        e.preventDefault();
        const phrase = mnemonic.join(' ').trim();

        // First check if all fields are filled
        if (!phrase || mnemonic.some(word => !word) || mnemonic.length !== 12) {
            toast.error('Please enter all 12 words of your mnemonic phrase', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return;
        }

        if (!validateMnemonic(phrase)) {
            toast.error('Invalid mnemonic phrase. Please check and try again.', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return;
        }

        try {
            await login(phrase);
        } catch (err) {
            toast.error('Failed to import wallet. Please try again.', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };

    const handleCreate = () => {
        setNewMnemonic(generateMnemonic());
        toast.success('New wallet generated successfully!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
    };

    const proceedWithNewMnemonic = async () => {
        await login(newMnemonic);
        toast.info('Wallet created successfully!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
    };

    if (newMnemonic) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-purple-900 overflow-y-auto py-8 px-4">

                <div className="absolute inset-0 overflow-hidden opacity-60">
                    <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-500/60 rounded-full mix-blend-overlay filter blur-[100px] animate-blob"></div>
                    <div className="absolute top-0 -right-30 w-96 h-96 bg-cyan-400/70 rounded-full mix-blend-overlay filter blur-[100px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-overlay filter blur-[100px] animate-blob animation-delay-4000"></div>
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white/5"
                            style={{
                                width: `${Math.random() * 4 + 15}px`,
                                height: `${Math.random() * 4 + 15}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    ))}
                </div>

                <div className="w-full z-50 max-w-md bg-gray-800/40 rounded-xl shadow-2xl p-8 border border-gray-700 mx-4">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                        Save Your Secret Phrase</h2>
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
                        <p className="font-bold text-yellow-400">IMPORTANT!</p>
                        <p className="text-yellow-300 text-sm mt-1">
                            Write this 12-word phrase down and store it securely. This is the only way to recover your wallet.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {newMnemonic.split(' ').map((word, index) => (
                            <div key={index} className="bg-black/30 p-3 rounded-lg flex">
                                <span className="text-gray-400 mr-2">{index + 1}.</span>
                                <span className="font-mono text-white">{word}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={proceedWithNewMnemonic}
                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30 active:scale-95"
                    >
                        I've Saved It, Continue
                    </button>
                </div>
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />

                <style jsx>{`
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
            0% { transform: translateY(0) translateX(0); opacity: 1; }
            50% { transform: translateY(-100px) translateX(20px); opacity: 0.8; }
            100% { transform: translateY(-200px) translateX(0); opacity: 0; }
        }
        .animate-blob {
            animation: blob 7s infinite ease-in-out;
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animation-delay-4000 {
            animation-delay: 4s;
        }
    `}</style>
            </div>
        );
    }

    return (

        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-purple-900 overflow-y-auto py-8 px-4">
            <div className="absolute inset-0 overflow-hidden opacity-60">
                <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-500/60 rounded-full mix-blend-overlay filter blur-[100px] animate-blob"></div>
                <div className="absolute top-0 -right-30 w-96 h-96 bg-cyan-400/70 rounded-full mix-blend-overlay filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-overlay filter blur-[100px] animate-blob animation-delay-4000"></div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/5"
                        style={{
                            width: `${Math.random() * 4 + 15}px`,
                            height: `${Math.random() * 4 + 15}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-lg mx-auto z-50">
                {/* Logo section with enhanced styling */}
                <div className="text-center mb-8 transform transition-all hover:scale-105 duration-300">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                        Accord
                    </h1>
                    <p className="text-gray-300 font-light tracking-wider">
                        ENTERPRISE-GRADE SECURITY FOR YOUR DIGITAL ASSETS
                    </p>
                </div>

                {/* Import Wallet Card - Enhanced */}
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-gray-700/50 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                        <p className="bg-gradient-to-r from-cyan-400 to-purple-400 items-center text-center w-full bg-clip-text text-transparent">
                            Import Existing Wallet
                        </p>
                    </h2>
                    <form onSubmit={handleImport}>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="relative group">
                                    <span className="absolute left-3 top-2 text-xs text-gray-400 group-focus-within:text-cyan-400 transition-colors">
                                        {index + 1}.
                                    </span>
                                    <input
                                        type="text"
                                        value={mnemonic[index]}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-2 pl-8 pr-2 text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent outline-none transition-all duration-200 group-hover:border-cyan-400/30"
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 active:scale-95"
                        >
                            Import Wallet
                        </button>
                    </form>
                </div>

                {/* Create Wallet Card - Enhanced */}
                <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 hover:border-purple-400/30 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
                    <h2 className="text-2xl font-semibold mb-2 text-white flex items-center">
                        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Create New Wallet
                        </span>
                        <span className="ml-2 text-purple-400">+</span>
                    </h2>
                    <p className="text-gray-300 mb-4">Generate a new secure wallet</p>
                    <button
                        onClick={handleCreate}
                        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30 active:scale-95"
                    >
                        Create New Wallet
                    </button>
                </div>
            </div>

            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <style jsx>{`
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
            0% { transform: translateY(0) translateX(0); opacity: 1; }
            50% { transform: translateY(-100px) translateX(20px); opacity: 0.8; }
            100% { transform: translateY(-200px) translateX(0); opacity: 0; }
        }
        .animate-blob {
            animation: blob 7s infinite ease-in-out;
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animation-delay-4000 {
            animation-delay: 4s;
        }
    `}</style>
        </div>
    );
}



export default Login;