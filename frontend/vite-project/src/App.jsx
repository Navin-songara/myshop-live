import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// --- CONFIGURATION ---
const adminEmail = "deepak@gmail.com"; 
const API_URL = "http://localhost:5000"; 

// 🔥 1. Banner Images
const bannerImages = [
  "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/a64908ba9bf2fe36.jpg?q=60",
  "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/1338bd4fc60390d8.jpg?q=60",
  "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/e94a135f02381d3a.jpg?q=60"
];

// 🔥 2. Categories
const categories = [
  { name: "Top Offers", img: "https://rukminim1.flixcart.com/flap/128/128/image/f15c02bfeb02d15d.png?q=100", dropdown: [] },
  { name: "Mobiles", img: "https://rukminim1.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png?q=100", dropdown: ["Samsung", "iPhone", "Pixel"] },
  { name: "Electronics", img: "https://rukminim1.flixcart.com/flap/128/128/image/69c6589653afdb9a.png?q=100", dropdown: ["Laptop", "Audio", "Cameras"] },
  { name: "TVs & App", img: "https://rukminim1.flixcart.com/flap/128/128/image/ab7e2b022a4587dd.jpg?q=100", dropdown: ["Smart TV", "AC", "Washing Machine"] },
  { name: "Fashion", img: "https://rukminim1.flixcart.com/flap/128/128/image/82b3ca5fb2301045.png?q=100", dropdown: ["Men's Wear", "Women's Wear", "Kids"] },
  { name: "Beauty", img: "https://rukminim1.flixcart.com/flap/128/128/image/dff3f7adcf3a90c6.png?q=100", dropdown: ["Makeup", "Skin Care", "Perfumes"] },
  { name: "Home", img: "https://rukminim1.flixcart.com/flap/128/128/image/ab7e2b022a4587dd.jpg?q=100", dropdown: ["Furniture", "Decor", "Kitchen"] },
  { name: "Flights", img: "https://rukminim1.flixcart.com/flap/128/128/image/71050627a56cb900.png?q=100", dropdown: [] },
  { name: "Grocery", img: "https://rukminim1.flixcart.com/flap/128/128/image/29327f40e9c4d26b.png?q=100", dropdown: ["Rice", "Oil", "Snacks"] }
];

function App() {
  const [products, setProducts] = useState([]); 
  const [cart, setCart] = useState([]); 
  const [view, setView] = useState('home'); 
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(""); 
  const [authMode, setAuthMode] = useState('login'); 
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [imgUrl, setImgUrl] = useState(""); 
  const [imageFile, setImageFile] = useState(null); 

  // --- 🆕 USE EFFECT WITH DATABASE CART LOGIC ---
  useEffect(() => {
    
    // Ek function banaya jo pehle Product layega, fir Cart layega
    const loadData = async () => {
        try {
            // 1. Fetch Products from Database
            const productRes = await axios.get(`${API_URL}/api/products`);
            const allProducts = productRes.data;
            setProducts(allProducts);

            // 2. Check Login & Fetch Cart
            const token = localStorage.getItem('auth-token');
            const savedEmail = localStorage.getItem('user-email');
            
            if(token) {
                setIsLoggedIn(true);
                if(savedEmail) setUserEmail(savedEmail);

                // 3. Database se Cart maango
                const cartRes = await axios.post(`${API_URL}/getcart`, {}, {headers:{'auth-token':token}});
                const cartData = cartRes.data; // Ye ID aur Quantity deta hai: { "id_123": 2 }

                // 4. Cart ki IDs ko Real Products se match karo
                const loadedCart = [];
                if(allProducts.length > 0) {
                    for(const itemId in cartData) {
                        const addedItem = allProducts.find(product => product._id === itemId);
                        if(addedItem) {
                            // Agar Quantity 2 hai, to 2 baar push karo
                            for(let i = 0; i < cartData[itemId]; i++) {
                                loadedCart.push(addedItem);
                            }
                        }
                    }
                }
                setCart(loadedCart);
                console.log("Cart Sync Complete!");
            }
        } catch (error) {
            console.log("Error loading data:", error);
        }
    };

    loadData(); // Function run karo

    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchProducts = async () => {
      // Helper function for updates
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
  };

  const handleAuth = async () => {
    if(!formData.email || !formData.password) return alert("Please fill details");
    let endpoint = authMode === 'login' ? '/login' : '/signup';
    try {
        const res = await axios.post(`${API_URL}${endpoint}`, formData);
        if(res.data.success) {
            localStorage.setItem('auth-token', res.data.token);
            localStorage.setItem('user-email', formData.email);
            setIsLoggedIn(true);
            setUserEmail(formData.email);
            setView('home');
            showToast("✅ Successfully Logged In!");
            setFormData({ username: "", email: "", password: "" });
            
            // Login ke baad page reload taaki cart fetch ho jaye
            window.location.reload(); 
        } else {
            alert(res.data.errors);
        }
    } catch (error) {
        alert("Authentication Failed. Check Server.");
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-email');
      setIsLoggedIn(false);
      setUserEmail("");
      setCart([]); // Logout par cart khali karo
      setView('home');
      showToast("Logged Out");
  }

  // --- 🆕 ADD TO CART (Database Connected) ---
  const addToCart = async (product) => {
    setCart([...cart, product]); // Frontend Update (Instant)
    showToast(`🛒 Added to Cart!`);

    // Backend Update
    if(localStorage.getItem('auth-token')) {
        await axios.post(`${API_URL}/addtocart`, 
            { itemId: product._id }, 
            { headers: { 'auth-token': localStorage.getItem('auth-token') } }
        );
    }
  };

  // --- 🆕 REMOVE FROM CART (Database Connected) ---
  const removeFromCart = async (index, productId) => {
    setCart(cart.filter((_, i) => i !== index)); // Frontend Update
    showToast("❌ Removed!");

    // Backend Update
    if(localStorage.getItem('auth-token') && productId) {
        await axios.post(`${API_URL}/removefromcart`, 
            { itemId: productId }, 
            { headers: { 'auth-token': localStorage.getItem('auth-token') } }
        );
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  // --- SMART ADD PRODUCT ---
  const addProduct = async () => {
    if(!name || !price || !mrp) return showToast("⚠️ Fill Name, Price & MRP!");
    if(!imgUrl && !imageFile) return showToast("⚠️ Provide Image Link OR Upload File!");
    
    try {
        const token = localStorage.getItem('auth-token');
        let finalImageUrl = imgUrl; 

        if (imageFile) {
            const formData = new FormData();
            formData.append('product', imageFile);
            const uploadRes = await axios.post(`${API_URL}/upload`, formData);
            if(uploadRes.data.success) {
                finalImageUrl = uploadRes.data.image_url; 
            }
        }

        await axios.post(`${API_URL}/api/products`, 
            { name, price: Number(price), mrp: Number(mrp), img: finalImageUrl },
            { headers: { 'auth-token': token } }
        );

        setName(""); setPrice(""); setMrp(""); setImgUrl(""); setImageFile(null);
        fetchProducts();
        showToast("🎉 Product Added Successfully!");
        
    } catch (error) {
        console.error(error);
        showToast("⛔ Failed! Check Server/Login.");
    }
  };

  const deleteProduct = async (id) => {
    if(confirm("Are you sure?")) {
        try {
            const token = localStorage.getItem('auth-token');
            await axios.delete(`${API_URL}/api/products/${id}`, {
                headers: { 'auth-token': token }
            });
            fetchProducts();
            showToast("🗑️ Deleted!");
        } catch (error) {
            showToast("⛔ Only Admin can delete!");
        }
    }
  };

  const getOff = (mrp, price) => {
    if(mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="app-wrapper">
      {notification && <div className="toast-notification">{notification}</div>}

      <div className="navbar">
        <div className="nav-logo" onClick={() => setView('home')}>
             <h2 style={{fontStyle:'italic', color:'#fff'}}>MyShop <span style={{fontSize:'12px', color:'#ffe500'}}>Plus+</span></h2>
        </div>
        <div className="search-bar">
            <input placeholder="Search for products, brands and more" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="search-icon">🔍</button>
        </div>
        <div className="nav-btns">
            {isLoggedIn ? (
                <button className="user-btn" onClick={handleLogout}>🚪 Logout ({userEmail.split('@')[0]})</button>
            ) : (
                <button className="login-btn" onClick={() => setView('login')}>Login</button>
            )}
            <button onClick={() => setView('home')}>Home</button>
            <button onClick={() => setView('cart')} className="cart-btn">Cart {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}</button>
        </div>
      </div>

      {view === 'home' && (
        <div className="category-bar">
           {categories.map((cat, index) => (
             <div key={index} className="category-item">
                <img src={cat.img} alt={cat.name} onError={(e) => e.target.src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"} />
                <span>{cat.name}</span>
             </div>
           ))}
        </div>
      )}

      <div className="container">
        {view === 'home' && (
            <>
                <div className="banner-carousel">
                    <img src={bannerImages[bannerIndex]} alt="Banner" className="banner-img-slide" />
                </div>

                {isLoggedIn && userEmail === adminEmail && (
                    <div className="form-box" style={{border: '2px dashed orange'}}>
                        <h3>🔐 Admin Panel: Add Product</h3>
                        <p style={{fontSize:'12px', color:'green'}}>Welcome Admin!</p>
                        
                        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                        
                        <input 
                            placeholder="Enter Image URL (Link Paste karein)" 
                            value={imgUrl} 
                            onChange={e => {setImgUrl(e.target.value); setImageFile(null);}} 
                            disabled={imageFile !== null} 
                        />

                        <div style={{textAlign: 'center', margin: '5px', color: '#888', fontWeight: 'bold'}}>OR</div>

                        <div style={{margin: '10px 0', textAlign: 'left', background: '#f0f0f0', padding: '10px', borderRadius: '5px'}}>
                            <label style={{fontSize:'12px', color:'#555', display: 'block', marginBottom: '5px'}}>Upload from Computer (Optional):</label>
                            <input 
                                type="file" 
                                onChange={(e) => {setImageFile(e.target.files[0]); setImgUrl("");}} 
                                style={{fontSize: '12px'}} 
                            />
                        </div>

                        <div className="row">
                            <input placeholder="MRP" type="number" value={mrp} onChange={e => setMrp(e.target.value)} />
                            <input placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                        </div>
                        <button className="add-btn" onClick={addProduct}>Publish Product</button>
                    </div>
                )}
                
                <h2 style={{margin:'20px 0'}}>Just For You</h2>
                
                {filteredProducts.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px', color:'#888'}}>
                        <h3>Loading Products...</h3>
                        <p>Make sure Backend is running on Port 5000</p>
                    </div>
                ) : (
                    <div className="grid">
                        {filteredProducts.map((p) => (
                        <div key={p._id || p.name} className="card">
                            <div className="img-box">
                                <img src={p.img} alt={p.name} onError={e => e.target.src="https://via.placeholder.com/200?text=No+Image"}/>
                            </div>
                            <div className="details">
                                <h3>{p.name}</h3>
                                <div className="price-tag">
                                    <span className="price">₹{p.price}</span>
                                    <span className="mrp">₹{p.mrp}</span>
                                    <span className="off">{getOff(p.mrp, p.price)}% Off</span>
                                </div>
                                <div className="btn-row">
                                    <button className="buy-btn" onClick={() => addToCart(p)}>Add to Cart</button>
                                    
                                    {isLoggedIn && userEmail === adminEmail && (
                                        <button className="del-btn" onClick={() => deleteProduct(p._id)}>🗑️</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </>
        )}

        {view === 'cart' && (
            <div className="cart-container">
                <h2>Your Cart</h2>
                {cart.length === 0 ? <h3>Cart is Empty</h3> : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {cart.map((item, index) => (
                                <div key={index} className="cart-card">
                                    <img src={item.img} alt={item.name} />
                                    <div className="cart-info"><h4>{item.name}</h4><p>₹{item.price}</p></div>
                                    <button className="remove-btn" onClick={() => removeFromCart(index, item._id)}>Remove</button>
                                </div>
                            ))}
                        </div>
                        <div className="bill-box">
                            <h3>Total: ₹{totalAmount}</h3>
                            <button className="checkout-btn" onClick={() => showToast("Order Placed!")}>Place Order</button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {view === 'login' && (
            <div className="login-overlay">
                <div className="login-modal">
                    <div className="login-left">
                        <h2>{authMode === 'login' ? 'Login' : 'Signup'}</h2>
                        <p>Get access to your Orders, Wishlist and Recommendations</p>
                        <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" alt="Login Graphic" />
                    </div>
                    <div className="login-right">
                        <div className="login-input-group">
                            {authMode === 'signup' && (
                                <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                            )}
                            <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>

                        <button className="request-otp-btn" onClick={handleAuth}>
                            {authMode === 'login' ? 'Login' : 'Signup'}
                        </button>
                        
                        <p style={{marginTop:'15px', cursor:'pointer', color:'#2874f0', fontWeight:'bold'}} 
                           onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                            {authMode === 'login' ? "New here? Create an account" : "Already have an account? Login"}
                        </p>
                        <p style={{marginTop:'10px', cursor:'pointer'}} onClick={() => setView('home')}>Close</p>
                    </div>
                </div>
            </div>
        )}
      </div>
      
      {view !== 'login' && <footer className="footer"><p>© 2025 MyShop (Flipkart Clone)</p></footer>}
    </div>
  );
}

export default App;