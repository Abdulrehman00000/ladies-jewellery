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
async function fetchProducts(category = 'All') {
  try {
    let url = '/api/products';
    if (category && category !== 'All') {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load products');
    products = await response.json();
    renderProducts();
  } catch (err) {
    console.error('Error fetching products:', err);
    productGrid.innerHTML = `
      <div class="loader">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--error-color); margin-bottom: 1rem;"></i>
        <p>Unable to load items right now. Please check if server is running.</p>
      </div>
    `;
  }
}

// Render products to storefront grid
function renderProducts() {
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

  const message = `✨ *ZARA JEWELS ORDER PROOF* ✨\n\n` +
                  `👤 *Name:* ${name}\n` +
                  `📞 *Phone:* ${phone}\n` +
                  `📍 *Address:* ${address}\n\n` +
                  `📦 *Ordered Items:*\n${itemsStr}\n` +
                  `💵 *Total Amount:* Rs. ${total.toLocaleString()}\n` +
                  `💸 *EasyPaisa TID:* ${txnId}\n\n` +
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
