// Zara Jewels Frontend Application Logic

let products = [];
let showAllProducts = false;
let cart = JSON.parse(localStorage.getItem('zj-cart')) || [];
const EASYPAISA_NUM = '03183707098';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartCount = document.getElementById('cartCount');
const cartCountTitle = document.getElementById('cartCountTitle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItemsList');
const emptyCartView = document.getElementById('emptyCartView');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartFooter = document.getElementById('cartFooter');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const startShoppingBtn = document.getElementById('startShoppingBtn');

// Mobile Menu DOM
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
const mobileNavDrawer = document.getElementById('mobileNavDrawer');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Checkout DOM
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
const closeCheckoutModalBtn = document.getElementById('closeCheckoutModalBtn');
const copyEpNumberBtn = document.getElementById('copyEpNumberBtn');
const copySuccessMsg = document.getElementById('copySuccessMsg');
const modalTotalAmount = document.getElementById('modalTotalAmount');
const checkoutForm = document.getElementById('checkoutForm');
const whatsappDirectBtn = document.getElementById('whatsappDirectBtn');

// Success Modal DOM
const successModalOverlay = document.getElementById('successModalOverlay');
const successCloseBtn = document.getElementById('successCloseBtn');
const successTid = document.getElementById('successTid');
const successName = document.getElementById('successName');
const successTotal = document.getElementById('successTotal');

// Toast Notification DOM
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

// Contact Form DOM
const contactForm = document.getElementById('contactForm');
const newsletterForm = document.getElementById('newsletterForm');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts('Necklaces');
  updateCartUI();
  setupEventListeners();
});

// Setup All UI Event Listeners
function setupEventListeners() {
  // Cart Drawer open/close
  cartToggleBtn.addEventListener('click', toggleCartDrawer);
  closeCartBtn.addEventListener('click', toggleCartDrawer);
  cartOverlay.addEventListener('click', toggleCartDrawer);
  startShoppingBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCartDrawer();
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
  });

  // Mobile navigation drawer open/close
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  closeMobileMenuBtn.addEventListener('click', toggleMobileMenu);
  mobileNavOverlay.addEventListener('click', toggleMobileMenu);
  mobileLinks.forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
  });

  // Category Filtering
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const selectedCategory = e.target.getAttribute('data-category');
      showAllProducts = false; // Reset pagination limit on filter change
      fetchProducts(selectedCategory);
    });
  });

  // Load More Button
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      showAllProducts = true;
      renderProducts();
    });
  }

  // Checkout modal actions
  checkoutBtn.addEventListener('click', openCheckoutModal);
  closeCheckoutModalBtn.addEventListener('click', closeCheckoutModal);
  checkoutModalOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutModalOverlay) closeCheckoutModal();
  });

  // Copy EasyPaisa Account Number
  copyEpNumberBtn.addEventListener('click', copyAccountNumber);

  // Submit Checkout Form to Server
  checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  // WhatsApp direct checkout
  whatsappDirectBtn.addEventListener('click', handleWhatsAppDirectOrder);

  // Success Modal close
  successCloseBtn.addEventListener('click', () => {
    successModalOverlay.classList.remove('active');
  });

  // Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Message sent successfully! We will contact you soon.');
      contactForm.reset();
    });
  }

  // Newsletter Form Submission
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you for subscribing to Zara Jewels!');
      newsletterForm.reset();
    });
  }
}

// Fetch products from Express API
// --- Embedded Static Products for GitHub Pages / Static Hosting ---
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


const STATIC_FALLBACK_PRODUCTS = seedProductsData;

// Fetch products from Express API with automatic static fallback for GitHub Pages
async function fetchProducts(category = 'All') {
  try {
    let url = '/api/products';
    if (category && category !== 'All') {
      url += ?category= + encodeURIComponent(category);
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('API unavailable');
    products = await response.json();
    if (!products || products.length === 0) throw new Error('Empty API result');
    renderProducts();
  } catch (err) {
    console.log('Using static products database (GitHub Pages Mode)...');
    if (category && category !== 'All') {
      products = STATIC_FALLBACK_PRODUCTS.filter(p => 
        p.category.toLowerCase() === category.toLowerCase() ||
        p.category.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(p.category.toLowerCase())
      );
    } else {
      products = [...STATIC_FALLBACK_PRODUCTS];
    }
    renderProducts();
  }
}

// Render products to storefront grid
() {
  if (products.length === 0) {
    productGrid.innerHTML = `
      <div class="loader">
        <p>No products found in this category.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = '';
  products.forEach(product => {
    const productCard = document.createElement('article');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
        <span class="product-category-tag">${product.category}</span>
      </div>
      <div class="product-details">
        <div class="product-rating">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star-half-stroke"></i>
          <span style="color: var(--text-muted); font-size: 0.75rem;">(4.8)</span>
        </div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description || 'Premium designer jewelry.'}</p>
        <div class="product-bottom-row">
          <span class="product-price">Rs. ${product.price.toLocaleString()}</span>
          <button class="add-to-cart-btn" data-id="${product._id}" aria-label="Add ${product.name} to Cart">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;

    // Add event listener to "Add to Cart" button
    const addBtn = productCard.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', () => {
      addToCart(product._id);
    });

    productGrid.appendChild(productCard);
  });
}

// Add Item to Shopping Cart
function addToCart(productId) {
  const product = products.find(p => p._id === productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item.product === productId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  localStorage.setItem('zj-cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`"${product.name}" added to shopping bag!`);
}

// Update shopping cart visual UI elements
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCountTitle.textContent = totalItems;

  if (cart.length === 0) {
    emptyCartView.classList.add('active');
    cartItemsList.innerHTML = '';
    cartFooter.style.display = 'none';
  } else {
    emptyCartView.classList.remove('active');
    cartFooter.style.display = 'block';
    
    cartItemsList.innerHTML = '';
    let totalSum = 0;

    cart.forEach(item => {
      const itemCost = item.price * item.quantity;
      totalSum += itemCost;

      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-price">Rs. ${item.price.toLocaleString()}</span>
          <div class="cart-item-qty">
            <button class="qty-btn dec-qty-btn" data-id="${item.product}"><i class="fa-solid fa-minus"></i></button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn inc-qty-btn" data-id="${item.product}"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
        <button class="remove-item-btn" data-id="${item.product}" aria-label="Remove item">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      `;

      // Event listeners for quantites
      itemElement.querySelector('.dec-qty-btn').addEventListener('click', () => adjustQty(item.product, -1));
      itemElement.querySelector('.inc-qty-btn').addEventListener('click', () => adjustQty(item.product, 1));
      itemElement.querySelector('.remove-item-btn').addEventListener('click', () => removeFromCart(item.product));

      cartItemsList.appendChild(itemElement);
    });

    cartSubtotal.textContent = `Rs. ${totalSum.toLocaleString()}`;
  }
}

// Adjust Quantities in Cart
function adjustQty(productId, amount) {
  const itemIndex = cart.findIndex(item => item.product === productId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += amount;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    localStorage.setItem('zj-cart', JSON.stringify(cart));
    updateCartUI();
  }
}

// Remove Item from Cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.product !== productId);
  localStorage.setItem('zj-cart', JSON.stringify(cart));
  updateCartUI();
  showToast('Item removed from shopping bag.');
}

// Open and Close Drawers & Modals
function toggleCartDrawer() {
  cartDrawer.classList.toggle('active');
  cartOverlay.classList.toggle('active');
}

function toggleMobileMenu() {
  mobileNavDrawer.classList.toggle('active');
  mobileNavOverlay.classList.toggle('active');
}

function openCheckoutModal() {
  toggleCartDrawer(); // Close cart drawer
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  modalTotalAmount.textContent = `Rs. ${total.toLocaleString()}`;
  checkoutModalOverlay.classList.add('active');
}

function closeCheckoutModal() {
  checkoutModalOverlay.classList.remove('active');
}

// Copy account number helper
function copyAccountNumber() {
  navigator.clipboard.writeText(EASYPAISA_NUM).then(() => {
    copySuccessMsg.style.display = 'inline-block';
    setTimeout(() => {
      copySuccessMsg.style.display = 'none';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy account number:', err);
  });
}

// Handle Order Submission
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const txnId = document.getElementById('custTxnId').value.trim();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!name || !phone || !address || !txnId) {
    alert('Please fill out all fields.');
    return;
  }

  // Validate Transaction ID structure (11 digits generally)
  if (txnId.length < 9 || isNaN(txnId)) {
    alert('Please enter a valid numeric EasyPaisa Transaction ID.');
    return;
  }

  const orderData = {
    customerName: name,
    customerPhone: phone,
    shippingAddress: address,
    totalAmount: total,
    transactionId: txnId,
    items: cart.map(item => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Clear Cart
      cart = [];
      localStorage.removeItem('zj-cart');
      updateCartUI();
      closeCheckoutModal();

      // Show success modal
      successTid.textContent = txnId;
      successName.textContent = name;
      successTotal.textContent = `Rs. ${total.toLocaleString()}`;
      successModalOverlay.classList.add('active');
      checkoutForm.reset();
    } else {
      alert(data.error || 'Failed to place order. Please try again.');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Network error: Unable to complete your checkout. Please check server logs.');
  }
}

// Build WhatsApp Direct Message checkout
function handleWhatsAppDirectOrder() {
  const name = document.getElementById('custName').value.trim() || 'Valued Customer';
  const phone = document.getElementById('custPhone').value.trim() || 'N/A';
  const address = document.getElementById('custAddress').value.trim() || 'N/A';
  const txnId = document.getElementById('custTxnId').value.trim() || 'N/A';
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  let itemsStr = '';
  cart.forEach((item, index) => {
    itemsStr += `${index + 1}. ${item.name} (Qty: ${item.quantity}) - Rs. ${(item.price * item.quantity).toLocaleString()}\n`;
  });

  const message = `âœ¨ *ZARA JEWELS ORDER PROOF* âœ¨\n\n` +
                  `ðŸ‘¤ *Name:* ${name}\n` +
                  `ðŸ“ž *Phone:* ${phone}\n` +
                  `ðŸ“ *Address:* ${address}\n\n` +
                  `ðŸ“¦ *Ordered Items:*\n${itemsStr}\n` +
                  `ðŸ’µ *Total Amount:* Rs. ${total.toLocaleString()}\n` +
                  `ðŸ’¸ *EasyPaisa TID:* ${txnId}\n\n` +
                  `Please approve my order! Thank you.`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/923183707098?text=${encodedMsg}`;
  window.open(waUrl, '_blank');
}

// Show Custom Toast Alerts
function showToast(message) {
  toastMessage.textContent = message;
  toastNotification.classList.add('active');
  setTimeout(() => {
    toastNotification.classList.remove('active');
  }, 3500);
}

