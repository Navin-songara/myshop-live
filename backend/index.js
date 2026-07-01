const jwt = require("jsonwebtoken");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2;

const app = express();
const port = process.env.PORT || 5000;

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(cors());

// ---------------- ROOT ROUTE FIX ----------------
app.get("/", (req, res) => {
    res.send("🚀 MyShop Backend is Running Successfully");
});

// ---------------- CLOUDINARY CONFIG ----------------
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// ---------------- DATABASE CONNECTION ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected!"))
  .catch(err => console.log("❌ DB Error:", err));

// ---------------- MULTER STORAGE ----------------
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// ---------------- CLOUDINARY UPLOAD ----------------
app.post("/upload", upload.single('product'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: 0, message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        res.json({
            success: 1,
            image_url: result.secure_url
        });

        console.log("Image Uploaded:", result.secure_url);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: 0, message: "Upload failed" });
    }
});

// ---------------- SCHEMAS ----------------
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    mrp: Number,
    img: String,
});

const Product = mongoose.model('Product', productSchema);

const Users = mongoose.model('Users', {
    name: String,
    email: { type: String, unique: true },
    password: String,
    cartData: Object,
    date: { type: Date, default: Date.now }
});

// ---------------- AUTH MIDDLEWARE ----------------
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');

    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using valid token" });
    }

    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Invalid token" });
    }
};

// ---------------- SIGNUP ----------------
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });

    if (check) {
        return res.status(400).json({ success: false, errors: "User already exists" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');

    res.json({ success: true, token });
});

// ---------------- LOGIN ----------------
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });

    if (!user) {
        return res.json({ success: false, errors: "Wrong Email" });
    }

    if (req.body.password !== user.password) {
        return res.json({ success: false, errors: "Wrong Password" });
    }

    const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');

    res.json({ success: true, token });
});

// ---------------- PRODUCTS ----------------
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/products', fetchUser, async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
});

app.delete('/api/products/:id', fetchUser, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ---------------- CART ----------------
app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });

    if (!userData.cartData[req.body.itemId]) {
        userData.cartData[req.body.itemId] = 1;
    } else {
        userData.cartData[req.body.itemId] += 1;
    }

    await Users.findOneAndUpdate(
        { _id: req.user.id },
        { cartData: userData.cartData }
    );

    res.json({ message: "Added" });
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });

    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;

        await Users.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: userData.cartData }
        );

        res.json({ message: "Removed" });
    }
});

app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

// ---------------- START SERVER ----------------
app.listen(port, () => {
    console.log("🚀 Server running on Port " + port);
});
