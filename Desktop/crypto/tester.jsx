// Add this function to your existing blockchain service
export const getSolanaTransaction = async (signature) => {
    try {
        const response = await axios.post(SOL_RPC_URL, {
            jsonrpc: "2.0",
            id: 1,
            method: "getTransaction",
            params: [
                signature,
                {
                    encoding: "jsonParsed",
                    commitment: "confirmed"
                }
            ]
        }, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data.result;
    } catch (error) {
        console.error("Error fetching transaction:", error);
        throw error;
    }
};