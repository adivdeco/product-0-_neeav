import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getSolanaTransaction } from '../services/blockchain';

const TransactionDetails = ({ coin, transactionHash, onClose }) => {
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                setLoading(true);
                const data = await getSolanaTransaction(transactionHash);
                setTransaction(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch transaction details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (transactionHash) {
            fetchTransaction();
        }
    }, [transactionHash]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (!transactionHash) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">
                            Transaction Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            &times;
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">
                            {error}
                        </div>
                    ) : transaction ? (
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Status</span>
                                    {transaction.meta.err ? (
                                        <span className="text-red-400 flex items-center">
                                            <XCircle className="mr-1" size={16} /> Failed
                                        </span>
                                    ) : (
                                        <span className="text-green-400 flex items-center">
                                            <CheckCircle className="mr-1" size={16} /> Confirmed
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400">Block</span>
                                    <span className="text-white">{transaction.slot}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Fee</span>
                                    <span className="text-white">
                                        {(transaction.meta.fee / 1000000000).toFixed(9)} SOL
                                    </span>
                                </div>
                            </div>

                            {/* Transaction Hash */}
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Transaction ID</span>
                                    <button
                                        onClick={() => copyToClipboard(transactionHash)}
                                        className="text-cyan-400 hover:text-cyan-300 flex items-center"
                                    >
                                        <Copy size={14} className="mr-1" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="font-mono text-sm break-all">
                                        {transactionHash}
                                    </p>
                                    <a
                                        href={`https://solscan.io/tx/${transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 hover:text-cyan-300 ml-2 flex items-center"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <h4 className="text-gray-300 mb-2">Instructions</h4>
                                {transaction.transaction.message.instructions.map((inst, i) => (
                                    <div key={i} className="mb-3 last:mb-0">
                                        <div className="flex items-center text-sm text-gray-400 mb-1">
                                            <span>Program:</span>
                                            <span className="font-mono ml-2 text-white">
                                                {inst.programId}
                                            </span>
                                        </div>
                                        {inst.accounts && (
                                            <div className="text-sm">
                                                <span className="text-gray-400">Accounts:</span>
                                                <ul className="list-disc list-inside ml-4">
                                                    {inst.accounts.map((acc, j) => (
                                                        <li key={j} className="font-mono text-white">
                                                            {acc}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Balance Changes */}
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                <h4 className="text-gray-300 mb-2">Balance Changes</h4>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-400 border-b border-gray-700">
                                            <th className="text-left pb-2">Account</th>
                                            <th className="text-right pb-2">Before</th>
                                            <th className="text-right pb-2">After</th>
                                            <th className="text-right pb-2">Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transaction.meta.preBalances.map((preBalance, i) => {
                                            const postBalance = transaction.meta.postBalances[i];
                                            const change = postBalance - preBalance;
                                            return (
                                                <tr key={i} className="border-b border-gray-800">
                                                    <td className="py-2 text-white font-mono text-xs truncate max-w-xs">
                                                        {transaction.transaction.message.accountKeys[i]}
                                                    </td>
                                                    <td className="py-2 text-right text-white">
                                                        {(preBalance / 1000000000).toFixed(4)} SOL
                                                    </td>
                                                    <td className="py-2 text-right text-white">
                                                        {(postBalance / 1000000000).toFixed(4)} SOL
                                                    </td>
                                                    <td className={`py-2 text-right ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {change >= 0 ? '+' : ''}{(change / 1000000000).toFixed(4)} SOL
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            No transaction data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionDetails;