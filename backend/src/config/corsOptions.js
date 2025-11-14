

const getCorsOptions = () => {

    const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];


    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.some(allowed =>
                origin === allowed ||
                origin.startsWith(allowed.replace('*', ''))
            )) {
                return callback(null, true);
            }

            callback(new Error(`CORS Error: The origin '${origin}' is not allowed.`));
        },
        credentials: true,
        methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    };
};

module.exports = { getCorsOptions };