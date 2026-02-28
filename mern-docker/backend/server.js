const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Allow requests from all origins (for development env)
app.use(cors({
    origin: '*' // In production, replace '*' with your frontend URL
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    const mongoStatus = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoStatus === 1) {
        res.status(200).json({ status: 'UP', database: 'connected' });
    } else {
        res.status(503).json({ status: 'DOWN', database: 'disconnected' });
    }
});

// Connect to MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017/mern_db';
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define User schema
const userSchema = new mongoose.Schema({
    email: String,
    mobile: String
});

const User = mongoose.model('User', userSchema);

// POST /users - create a new user
app.post('/users', async (req, res) => {
    const { email, mobile } = req.body;
    try {
        const user = new User({ email, mobile });
        await user.save();
        res.json({ message: 'User created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// GET /users - fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Start backend server
app.listen(5000, '0.0.0.0', () => console.log('Backend running on port 5000'));

