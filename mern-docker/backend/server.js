const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/mern_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'));

const userSchema = new mongoose.Schema({
    email: String,
    mobile: String
});

const User = mongoose.model('User', userSchema);

app.post('/users', async (req, res) => {
    const { email, mobile } = req.body;
    try {
        const user = new User({ email, mobile });
        await user.save();
        res.json({ message: 'User created successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.listen(5000, () => console.log('Backend running on port 5000'));
