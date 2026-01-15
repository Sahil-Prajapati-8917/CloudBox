const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const { errorHandler } = require('./middleware/errorMiddleware');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));

app.get('/', (req, res) => {
    res.send('CloudBox Backend API is running');
});

app.use(errorHandler);

// Start Server
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            if (!process.env.JWT_SECRET) {
                console.warn('WARNING: JWT_SECRET is not set in .env! Authentication will fail.');
            }
        });
        // Increase timeout to 5 minutes for large uploads
        server.timeout = 300000;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
