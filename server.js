// ⚠️ IMPORTANT: Load environment variables FIRST, before any other requires
// This must be at the very top so that db.js and other modules can access process.env
const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require("./config/db.js")
const userRouter = require("./routes/userRoute.js")
const cartRouter = require("./routes/cartRoute.js")
const orderRouter = require("./routes/orderRoute.js")

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] && !process.env[varName.replace('MONGO_URI', 'MONGO_URL')]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
	console.error('❌ ERROR: Missing required environment variables:', missingVars.join(', '));
	console.error('Please set these variables in your production environment.');
	process.exit(1);
} else if (missingVars.length > 0) {
	console.warn('⚠️  WARNING: Missing environment variables:', missingVars.join(', '));
	console.warn('Some features may not work correctly.');
}

// app config
const app = express()
const port = process.env.PORT || 9000;

// middlewares
app.use(express.json())

// Configure CORS to allow the frontend origin and required headers
// In production, FRONTEND_URL must be set (e.g., https://yourdomain.com)
// For local dev, allow localhost origins
const allowedOrigins = process.env.FRONTEND_URL 
	? process.env.FRONTEND_URL.split(',').map(url => url.trim())
	: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (mobile apps, Postman, etc.) in development
		if (!origin && process.env.NODE_ENV !== 'production') {
			return callback(null, true);
		}
		// Check if origin is in allowed list
		if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization', 'token'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions))

// db connection
 connectDB();

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)

// Health check endpoint
app.get('/', (req, res) => res.json({ 
	success: true, 
	message: 'API is working!', 
	port: port,
	environment: process.env.NODE_ENV || 'development'
}));

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
	console.error('Error:', err);
	if (err.message === 'Not allowed by CORS') {
		return res.status(403).json({ success: false, message: 'CORS error: Origin not allowed' });
	}
	res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(port, () => {
	console.log(`Food app is listening on port ${port}!`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'Not set (using defaults)'}`);
});