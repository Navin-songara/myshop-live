const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Database Connection
mongoose.connect('mongodb+srv://navinsongara:<41922141>@cluster0.12mlbgv.mongodb.net/?appName=Cluster0')
    .then(() => console.log("🔥 MongoDB Connected!"))
    .catch(err => console.log("❌ DB Error:", err));

// 2. Product Design (Schema)
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    mrp: Number,
    img: String
});
const Product = mongoose.model('Product', productSchema);

// 3. API Routes
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.listen(5000, () => {
    console.log("🚀 Server running on Port 5000");
});