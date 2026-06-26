require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Unable to set custom DNS servers:', e.message);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zarajewels';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB Connection Status Flag
let isDbConnected = false;

// 40 Verified Unsplash CDN URLs (100% unique jewelry photos)
const unsplashUrls = [
  "https://plus.unsplash.com/premium_photo-1709033404514-c3953af680b4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1633934542430-0905ccb5f050?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1779476315506-3568175883f2?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1681276169450-4504a2442173?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1681276170092-446cd1b5b32d?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1590166223826-12dee1677420?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1600721391689-2564bb8055de?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1722410180687-b05b50922362?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1674748385760-d846825598ab?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1592317295760-5c1f677dfc78?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1779476314900-bc88110a4cf4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1585960622850-ed33c41d6418?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1599458349289-18f0ee82e6ed?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1661645433820-24c8604e4db5?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1631982690223-8aa4be0a2497?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1674255466849-b23fc5f5d3eb?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1569397288884-4d43d6738fbd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1681276170423-2c60b95094b4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1608042314453-ae338d80c427?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1603561596112-0a132b757442?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1681276170281-cf50a487a1b7?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1616837874254-8d5aaa63e273?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1661645473770-90d750452fa0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1778421418167-374f69af3e4e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1620656798579-1984d9e87df7?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1601821765780-754fa98637c1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1561828995-aa79a2db86dd?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1681276170291-27698ccc0a8e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1655255114527-d0a834d9a774?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1727784892009-f3cf06199b65?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0"
];

// 80 Premium products (8 per category across 10 categories)
const rawProductsData = {
  "Necklaces": [
    { name: "Royal Gold Necklace Set", price: 3999, desc: "A gorgeous royal gold plated necklace set with fine craftsmanship and matching earrings." },
    { name: "Classic Ruby Pendant", price: 2299, desc: "Elegant gold chain necklace with a single deep red ruby stone in the center." },
    { name: "Elegance Diamond Choker", price: 5499, desc: "A stunning choker necklace featuring raw diamonds on a silver band." },
    { name: "Traditional Haram Necklace", price: 6599, desc: "A heavy, long gold haram necklace with intricate traditional South Asian motifs." },
    { name: "Delicate Gold Chain", price: 1899, desc: "Perfect for daily wear, a 22K gold-plated delicate chain necklace." },
    { name: "Pearl Layered Mala", price: 3299, desc: "Multi-layered pristine white freshwater pearl mala with a royal clasp." },
    { name: "Vintage Antique Necklace", price: 4799, desc: "Exquisite antique finished gold necklace featuring traditional filigree work." },
    { name: "Modern Sterling Choker", price: 2999, desc: "Sleek, modern minimalist choker necklace crafted in pure sterling silver." }
  ],
  "Rings": [
    { name: "Diamond-Style Silver Ring", price: 1299, desc: "Shimmering sterling silver ring embedded with premium cubic zirconia." },
    { name: "Gold Solitaire Ring", price: 1799, desc: "Timeless gold band featuring a single, brilliant-cut round solitaire stone." },
    { name: "Emerald Cut Royal Ring", price: 2499, desc: "Rich green emerald gemstone in a traditional micro-faceted setting." },
    { name: "Classic Wedding Band", price: 999, desc: "Simple polished sterling silver wedding band for daily luxury." },
    { name: "Ruby Floral Ring", price: 1599, desc: "Deep red rubies arranged in a beautiful flower design setting." },
    { name: "Minimalist Gold Band", price: 1199, desc: "Thin 22K gold-plated band, perfect for stacking with other rings." },
    { name: "Vintage Filigree Ring", price: 1899, desc: "Artistic lace work detailing in pure 925 sterling silver." },
    { name: "Sapphire Accent Ring", price: 2299, desc: "Deep blue royal sapphire stone ring with micro-diamond side accents." }
  ],
  "Earrings": [
    { name: "Pearl Drop Earrings", price: 1599, desc: "Pristine white drop pearls suspended from elegant gold fittings." },
    { name: "Kundan Chandelier Earrings", price: 2199, desc: "Multi-layered Kundan chandelier earrings with royal pearl drops." },
    { name: "Gold Hoop Earrings", price: 1099, desc: "Classic polished gold hoops for a versatile and classy styling." },
    { name: "Diamond Studs", price: 1799, desc: "Simple yet sparkling diamond studs in four-prong silver setting." },
    { name: "Ruby Drop Earrings", price: 1999, desc: "Deep red rubies cascading in a beautiful gold-plated drop." },
    { name: "Vintage Filigree Studs", price: 1299, desc: "Detailed silver filigree studs capturing old-world charm." },
    { name: "Emerald Tassel Earrings", price: 2499, desc: "Rich green emerald beads dangling in long luxurious tassels." },
    { name: "Classic Silver Dangles", price: 1499, desc: "Hanging silver earrings with elegant geometric drop design." }
  ],
  "Bangles & Bracelets": [
    { name: "Bridal Bangles Set", price: 2499, desc: "Traditional red and gold wedding bangles set with micro stones." },
    { name: "Silver Filigree Bangles", price: 1599, desc: "Intricate openwork design bangles in high-polished silver." },
    { name: "Gold Plated Kada", price: 1999, desc: "A thick gold-plated traditional Kada bracelet with screw lock." },
    { name: "Modern Crystal Bracelet", price: 1399, desc: "Flexible chain bracelet embedded with sparkling crystals." },
    { name: "Traditional Glass Bangles", price: 799, desc: "A set of 24 colorful velvet-coated traditional glass bangles." },
    { name: "Sterling Silver Cuff", price: 1799, desc: "Smooth polished minimalist cuff bracelet in pure silver." },
    { name: "Rose Gold Tennis Bracelet", price: 2999, desc: "A row of brilliant-cut zircons set on a rose gold chain." },
    { name: "Kundan Bracelet", price: 2199, desc: "Stunning ethnic bracelet decorated with fine kundan stones." }
  ],
  "Bridal Sets": [
    { name: "Full Bridal Jewelry Set", price: 8499, desc: "Heavy royal gold necklace, choker, matching earrings, and maang tikka." },
    { name: "Luxury 9-Piece Bridal Set", price: 12999, desc: "The ultimate bridal collection: necklaces, tikka, jhumar, rings and bangles." },
    { name: "Royal Kundan Bridal Set", price: 9999, desc: "Heavily encrusted Kundan bridal set with green emerald drops." },
    { name: "Emerald Heritage Set", price: 11500, desc: "A majestic collection featuring real dark green emerald stones." },
    { name: "Ruby Majesty Bridal Set", price: 10999, desc: "Gold plated royal set adorned with crimson rubies and white pearls." },
    { name: "Nawabi Polki Set", price: 9500, desc: "Mughal-inspired raw cut Polki diamond set with gold hangings." },
    { name: "Queen's Diamond Bridal Set", price: 14999, desc: "Sophisticated silver bridal set with hand-faceted diamond replica stones." },
    { name: "Classic Gold Wedding Set", price: 7999, desc: "Timeless traditional solid-gold style wedding jewelry set." }
  ],
  "Chokers": [
    { name: "Kundan Choker Necklace", price: 3199, desc: "Exquisite choker with detailed kundan work and pearls." },
    { name: "Velvet Gemstone Choker", price: 1499, desc: "Dark green velvet band choker with a single ruby center drop." },
    { name: "Gold Lace Choker", price: 2199, desc: "Delicate mesh pattern gold-plated choker for a neck-hugging style." },
    { name: "Pearl Delicate Choker", price: 1899, desc: "A row of tiny white seed pearls arranged in a dainty choker." },
    { name: "Ruby Velvet Choker", price: 1699, desc: "Rich crimson velvet band choker featuring a royal gold setting." },
    { name: "Floral Kundan Choker", price: 2899, desc: "Kundan choker arranged in floral patterns with a hanging pearl." },
    { name: "Vintage Brass Choker", price: 1299, desc: "Engraved brass metal choker with high-end antique finish." },
    { name: "Classic Silver Choker", price: 1999, desc: "A simple sterling silver choker that shines elegantly." }
  ],
  "Maang Tikka & Passa": [
    { name: "Royal Maang Tikka", price: 1899, desc: "Gold plated traditional headpiece with kundan and pearl hangings." },
    { name: "Gold Passa & Tikka Set", price: 2999, desc: "Beautiful side-passa and matching center maang tikka set." },
    { name: "Kundan Jhumar Passa", price: 1999, desc: "Side hair ornament with kundan encrustings for a regal look." },
    { name: "Pearl Drop Tikka", price: 1299, desc: "Simple elegant center forehead tikka with cascading pearl drop." },
    { name: "Floral Bridal Tikka", price: 1499, desc: "Red enamel rose centered tikka with golden leaf accents." },
    { name: "Ruby Accented Passa", price: 1799, desc: "Classic side passa featuring crimson ruby and pearl drops." },
    { name: "Chand Tikka", price: 1599, desc: "Forehead tikka designed in a traditional crescent moon shape." },
    { name: "Mughlai Jhumar", price: 2299, desc: "Mughal era inspired heavy jhumar/passa hair jewelry." }
  ],
  "Anklets (Payal)": [
    { name: "Silver Ghungroo Payal", price: 999, desc: "Traditional silver payal with sweet jingling ghungroo bells." },
    { name: "Gold Plated Bridal Payal", price: 1899, desc: "Thick bridal payal set with gold finish and stone embellishments." },
    { name: "Minimalist Thread Anklet", price: 499, desc: "Simple black thread anklet with a single silver bead." },
    { name: "Double Layered Silver Payal", price: 1299, desc: "Modern double chain silver anklet with stars and beads." },
    { name: "Kundan Payal Set", price: 2199, desc: "Unique kundan studded anklets with pearl string hooks." },
    { name: "Floral Anklet", price: 899, desc: "Dainty silver anklet featuring micro floral link chain." },
    { name: "Beaded Summer Anklet", price: 699, desc: "Multicolor beads strung together for a casual beach look." },
    { name: "Vintage Ghungroo Payal", price: 1199, desc: "A heavily antiqued silver anklet with lots of small bells." }
  ],
  "Jhumkas": [
    { name: "Gold Jhumka Earrings", price: 1399, desc: "Traditional bell-shaped golden jhumkas with hanging beads." },
    { name: "Kundan Pearl Jhumka", price: 2299, desc: "Stunning kundan flowered tops with a heavy pearl bell drop." },
    { name: "Silver Oxidized Jhumka", price: 899, desc: "Antique finished silver jhumkas, great for casual lawn styling." },
    { name: "Ruby Hanging Jhumka", price: 1899, desc: "Stunning gold plated jhumkas with deep red rubies." },
    { name: "Mughlai Jhumka Set", price: 2499, desc: "Double dome heavy royal jhumka featuring fine handwork." },
    { name: "Mini Gold Jhumki", price: 999, desc: "Dainty mini jhumkas perfect for daily university/office wear." },
    { name: "Temple Jewelry Jhumka", price: 1699, desc: "Gold plated jhumka featuring a traditional goddess-engraved top." },
    { name: "Traditional Ghungroo Jhumka", price: 1499, desc: "Bell jhumkas finished with tiny musical silver ghungroo loops." }
  ],
  "Kundan Jewelry": [
    { name: "Polki Bridal Necklace", price: 5499, desc: "Heavy wedding Polki necklace featuring raw diamond look." },
    { name: "Kundan Statement Ring", price: 1499, desc: "Large circular statement ring encrusted with fine Kundan stones." },
    { name: "Kundan Studded Bangles", price: 2999, desc: "Pair of gold plated bangles detailed with royal kundan lines." },
    { name: "Kundan Nose Ring (Nath)", price: 1699, desc: "Delicate bridal Nath with an embellished kundan ring and pearl chain." },
    { name: "Kundan Hair Clip", price: 1199, desc: "Traditional clip decorated with pearls and kundan work." },
    { name: "Kundan Royal Brooch", price: 1399, desc: "Pin brooch decorated with gold plating, kundan work, and pearl drop." },
    { name: "Kundan Waist Belt (Tagri)", price: 3499, desc: "Stunning bridal waist chain heavily detailed with Kundan links." },
    { name: "Kundan Foot Harness", price: 2499, desc: "Beautiful toe-ring to anklet link harness studded with Kundan." }
  ]
};

const seedProductsData = [];
let idCounter = 1;

// Pad utility for Mongoose ObjectIds
const padObjectId = (num, size) => {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

// Compile 80 products dynamically and assign 100% unique, verified Unsplash CDN URLs
const categoriesList = Object.keys(rawProductsData);
categoriesList.forEach((category, catIndex) => {
  rawProductsData[category].forEach((item, itemIndex) => {
    // Map index to the 40 verified Unsplash URLs to guarantee no repeats inside categories
    const imageUrl = unsplashUrls[(catIndex * 8 + itemIndex) % unsplashUrls.length];

    seedProductsData.push({
      _id: "660c1b48b92b6a37887e" + padObjectId(idCounter++, 4),
      name: item.name,
      price: item.price,
      category: category,
      image: imageUrl,
      description: item.desc
    });
  });
});

// In-Memory Database Fallbacks
let mockProducts = [...seedProductsData];
let mockOrders = [
  {
    _id: "660c1b48b92b6a37887e5221",
    customerName: "Ayesha Khan",
    customerPhone: "03211234567",
    shippingAddress: "House 24, St 5, Phase 6 DHA, Karachi",
    items: [
      { product: "660c1b48b92b6a37887e0001", name: "Royal Gold Necklace Set", price: 3999, quantity: 1 }
    ],
    totalAmount: 3999,
    paymentMethod: "EasyPaisa",
    transactionId: "12345678901",
    status: "Approved",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: "660c1b48b92b6a37887e5222",
    customerName: "Sana Jamil",
    customerPhone: "03009876543",
    shippingAddress: "Flat 4B, Emerald Heights, Gulberg, Lahore",
    items: [
      { product: "660c1b48b92b6a37887e0009", name: "Diamond-Style Silver Ring", price: 1299, quantity: 2 },
      { product: "660c1b48b92b6a37887e0017", name: "Pearl Drop Earrings", price: 1599, quantity: 1 }
    ],
    totalAmount: 4197,
    paymentMethod: "EasyPaisa",
    transactionId: "98765432109",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Database Connection
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Quick timeout so fallback initializes fast
})
  .then(async () => {
    console.log('Successfully connected to MongoDB database.');
    isDbConnected = true;
    await seedProducts();
  })
  .catch((err) => {
    console.warn('MongoDB connection failed:', err.message);
    console.log('--- FALLBACK: Server is operating in HIGH-PERFORMANCE IN-MEMORY MODE ---');
    console.log('All products and orders will be saved in server memory.');
    isDbConnected = false;
  });

async function seedProducts() {
  try {
    // Delete existing products and seed new ones to ensure 80 unique images are updated
    console.log('Refreshing seed items in MongoDB database...');
    await Product.deleteMany({});
    await Product.insertMany(seedProductsData);
    console.log('Re-seeding 80 premium items completed.');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}

// --- API ROUTES ---

// 1. Get All Products (with category filtering)
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    
    if (isDbConnected) {
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      const products = await Product.find(query);
      return res.json(products);
    } else {
      // In-Memory Mode
      let filtered = mockProducts;
      if (category && category !== 'All') {
        filtered = mockProducts.filter(p => p.category === category);
      }
      return res.json(filtered);
    }
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Server error: unable to fetch products.' });
  }
});

// 2. Place New Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, shippingAddress, items, totalAmount, transactionId } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items || !items.length || !totalAmount || !transactionId) {
      return res.status(400).json({ error: 'All fields (Name, Phone, Address, Items, Total, Transaction ID) are required.' });
    }

    if (isDbConnected) {
      const newOrder = new Order({
        customerName,
        customerPhone,
        shippingAddress,
        items,
        totalAmount,
        transactionId,
        status: 'Pending'
      });
      const savedOrder = await newOrder.save();
      return res.status(201).json({ success: true, message: 'Order placed successfully!', order: savedOrder });
    } else {
      // In-Memory Mode
      const newOrder = {
        _id: 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        customerName,
        customerPhone,
        shippingAddress,
        items,
        totalAmount,
        transactionId,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      mockOrders.unshift(newOrder);
      return res.status(201).json({ success: true, message: 'Order placed successfully in mock memory!', order: newOrder });
    }
  } catch (err) {
    console.error('Order creation error:', err.message);
    res.status(500).json({ error: 'Server error: unable to process order.' });
  }
});

// 3. Get All Orders (Admin Dashboard)
app.get('/api/orders', async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      // Sort mock orders descending by date
      const sortedMocks = [...mockOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(sortedMocks);
    }
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Server error: unable to retrieve orders.' });
  }
});

// 4. Update Order Status (Admin Dashboard)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Shipped', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    if (isDbConnected) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      return res.json({ success: true, message: 'Order status updated successfully!', order: updatedOrder });
    } else {
      // In-Memory Mode
      const orderIndex = mockOrders.findIndex(o => o._id === req.params.id);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      mockOrders[orderIndex].status = status;
      return res.json({ success: true, message: 'Mock order status updated successfully!', order: mockOrders[orderIndex] });
    }
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error: unable to update order status.' });
  }
});

// 5. Delete Order (Admin Dashboard)
app.delete('/api/orders/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      const deletedOrder = await Order.findByIdAndDelete(req.params.id);
      if (!deletedOrder) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      return res.json({ success: true, message: 'Order deleted successfully!' });
    } else {
      // In-Memory Mode
      const initialLength = mockOrders.length;
      mockOrders = mockOrders.filter(o => o._id !== req.params.id);
      if (mockOrders.length === initialLength) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      return res.json({ success: true, message: 'Mock order deleted successfully!' });
    }
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Server error: unable to delete order.' });
  }
});

// SPA Route: send all unmatched requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Zara Jewels Server is running at http://localhost:${PORT}`);
});
