const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Enable CORS for all origins (development)
app.use(cors());

// parse JSON bodies
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/mern', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample model
const Item = mongoose.model('Item', new mongoose.Schema({ name: String }));

app.get('/api/items', async (_, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const item = await Item.create(req.body);
  res.json(item);
});

app.listen(5000, () => console.log('Backend running on port 5000'));
