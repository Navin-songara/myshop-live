const jwt = require("jsonwebtoken");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require("multer");
const path = require("path");

// --- 1. CLOUDINARY CONFIGURATION (NEW) ---
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dvb0u2reb', 
  api_key: '688693675995311', 
  api_secret: 'us8wO7vlD1M8Pka8eAD23mfWh7o' 
});

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// --- 2. DATABASE CONNECTION ---
mongoose.connect('mongodb+srv://navinsongara:41922141@cluster0.12mlbgv.mongodb.net/?appName=Cluster0')
    .then(() => console.log("🔥 MongoDB Connected!"))
    .catch(err => console.log("❌ DB Error:", err));

// --- 3. IMAGE STORAGE ENGINE (Local Temporary Storage) ---
// Note: File pehle yahan aayegi, fir Cloudinary jayegi
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

// --- 4. CLOUDINARY UPLOAD ENDPOINT (Updated) ---
// Local URL ki jagah ab Cloudinary ka URL return karega
app.post("/upload", upload.single('product'), async (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({ success: 0, message: "No file uploaded" });
        }

        // 1. Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // 2. Return Cloudinary URL
        res.json({
            success: 1,
            image_url: result.secure_url 
        });
        
        console.log("Image Uploaded to Cloudinary:", result.secure_url);

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: 0, message: "Upload failed" });
    }
});

// --- 5. PRODUCT SCHEMA ---
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    mrp: Number,
    img: String, 
});
const Product = mongoose.model('Product', productSchema);

// --- USER SCHEMA ---
const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now }
})

// --- MIDDLEWARE (Security Guard) ---
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" })
    } 
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "Please authenticate using a valid token" })
        }
    }
}

// ==============================================
// --- AUTHENTICATION ENDPOINTS ---
// ==============================================

// 1. SIGNUP
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "Existing user found with same email address" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });
    await user.save();

    const data = { user: { id: user.id } }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
})

// 2. LOGIN
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = { user: { id: user.id } }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    }
    else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
})

// ==============================================
// --- API ROUTES (Products) ---
// ==============================================

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

// ==============================================
// --- CART ENDPOINTS ---
// ==============================================

// 1. ADD TO CART
app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({_id: req.user.id});
    if(!userData.cartData[req.body.itemId]) {
        userData.cartData[req.body.itemId] = 1;
    } else {
        userData.cartData[req.body.itemId] += 1;
    }
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.json({message: "Added"});
});

// 2. REMOVE FROM CART
app.post('/removefromcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({_id: req.user.id});
    if(userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
        res.json({message: "Removed"});
    }
});

// 3. GET CART
app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({_id: req.user.id});
    res.json(userData.cartData);
});

// --- START SERVER ---
app.listen(port, (error) => {
    if(!error) console.log("🚀 Server running on Port " + port);
    else console.log("Error: " + error);
});