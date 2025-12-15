import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// 🔥 1. Banner Images (Wahi purani 3 images jo tumne di thi)
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

// 🔥 3. Best of Electronics (Updated with YOUR Images)
const bestOfElectronics = [
  { name: "Monitors", price: "From ₹6,599", img: "https://rukminim2.flixcart.com/image/200/200/xif0q/monitor/s/g/u/-original-imagzrf84gyqeste.jpeg?q=70" },
  { name: "Power Banks", price: "From ₹499", img: "https://rukminim2.flixcart.com/image/612/612/xif0q/power-bank/u/7/y/energyhub-200000-pb100-miox-original-imahehuctrtuwzbh.jpeg?q=70" }, // Updated
  { name: "Printers", price: "From ₹2,399", img: "https://rukminim2.flixcart.com/image/612/612/k4a7c7k0/printer/y/j/z/canon-e3370-original-imafn2wyyxjjvzd6.jpeg?q=70" }, // Updated
  { name: "Projectors", price: "From ₹5,299", img: "https://rukminim2.flixcart.com/image/612/612/xif0q/projector/b/y/f/vision-pro-fully-smart-android-13-native-1080p-4k-support-original-imahehuv7zgr5zju.jpeg?q=70" }, // Updated
  { name: "Trimmers", price: "From ₹399", img: "https://rukminim2.flixcart.com/image/612/612/xif0q/shopsy-trimmer/a/2/k/trimmer-1-20-mm-stainless-steel-power-play-nxt-beard-trimmer-i-original-imahazyzffanxhrw.jpeg?q=70" } // Updated
];

function App() {
  const [products, setProducts] = useState([]); // 👈 Default items deleted (Empty Array)
  const [cart, setCart] = useState([]); 
  const [view, setView] = useState('home'); 
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  
  // Login States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [loginStep, setLoginStep] = useState('details'); 
  const [formData, setFormData] = useState({ name: "", mobile: "" });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Product Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [img, setImg] = useState("");

  useEffect(() => {
    fetchProducts();
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
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data); // Sirf database ke product dikhenge
    } catch (error) { 
        console.log("Database Empty or Offline");
    }
  };

  const handleRequestOtp = () => {
    if(!formData.name || !formData.mobile) return alert("Please enter Name & Mobile!");
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setLoginStep('otp');
    alert(`🔐 Your OTP is: ${code}`); 
  };

  const handleVerifyOtp = () => {
    if(otp === generatedOtp) {
        setIsLoggedIn(true);
        setUserName(formData.name);
        setView('home');
        showToast(`Welcome ${formData.name}!`);
        setLoginStep('details');
        setFormData({ name: "", mobile: "" });
        setOtp("");
    } else { alert("Wrong OTP!"); }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    showToast(`🛒 Added to Cart!`);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
    showToast("❌ Removed!");
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const addProduct = async () => {
    if(!name || !price || !mrp || !img) return showToast("⚠️ Fill all fields!");
    await axios.post('http://localhost:5000/api/products', { name, price: Number(price), mrp: Number(mrp), img });
    setName(""); setPrice(""); setMrp(""); setImg("");
    fetchProducts();
    showToast("🎉 Product Added!");
  };

  const deleteProduct = async (id) => {
    if(confirm("Delete?")) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
      showToast("🗑️ Deleted!");
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
                <button className="user-btn">👤 {userName}</button>
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
                {cat.dropdown.length > 0 && (
                   <div className="dropdown-menu">
                      {cat.dropdown.map((subItem, i) => <p key={i}>{subItem}</p>)}
                   </div>
                )}
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

                <div className="horizontal-section">
                    <div className="sec-header">
                        <h2>Best of Electronics</h2>
                        <button className="view-all-btn">VIEW ALL</button>
                    </div>
                    <div className="scroll-container">
                        {bestOfElectronics.map((item, idx) => (
                            <div key={idx} className="scroll-card">
                                <img src={item.img} alt={item.name} />
                                <h4>{item.name}</h4>
                                <p className="scroll-price">{item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-box">
                    <h3>📢 Sell New Product</h3>
                    <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                    <input placeholder="Image URL" value={img} onChange={e => setImg(e.target.value)} />
                    <div className="row">
                        <input placeholder="MRP" type="number" value={mrp} onChange={e => setMrp(e.target.value)} />
                        <input placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                    <button className="add-btn" onClick={addProduct}>Publish</button>
                </div>

                <h2 style={{margin:'20px 0'}}>Suggested for You</h2>
                
                {filteredProducts.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px', color:'#888'}}>
                        <h3>No Products Found!</h3>
                        <p>Use the form above to add products.</p>
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
                                    <button className="del-btn" onClick={() => deleteProduct(p._id)}>🗑️</button>
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
                                    <button className="remove-btn" onClick={() => removeFromCart(index)}>Remove</button>
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
                        <h2>{loginStep === 'details' ? 'Login' : 'Verify OTP'}</h2>
                        <p>{loginStep === 'details' ? 'Get access to your Orders, Wishlist and Recommendations' : `Enter OTP sent to ${formData.mobile}`}</p>
                        <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png" alt="Login Graphic" />
                    </div>
                    <div className="login-right">
                        {loginStep === 'details' ? (
                            <>
                                <div className="login-input-group">
                                    <input type="text" placeholder="Enter Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                    <input type="number" placeholder="Enter Mobile Number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                                </div>
                                <button className="request-otp-btn" onClick={handleRequestOtp}>Request OTP</button>
                            </>
                        ) : (
                            <>
                                <div className="login-input-group">
                                    <input type="text" placeholder="Enter 4-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={4} style={{textAlign:'center', letterSpacing:'5px', fontSize:'24px'}} />
                                </div>
                                <button className="request-otp-btn" onClick={handleVerifyOtp}>Verify</button>
                                <p className="create-account" onClick={() => setLoginStep('details')} style={{marginTop:'20px'}}>Back</p>
                            </>
                        )}
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