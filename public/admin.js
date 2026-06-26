// Zara Jewels Admin Dashboard Application Logic

let orders = [];

// DOM Elements
const loginLockOverlay = document.getElementById('loginLockOverlay');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPass = document.getElementById('adminPass');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard metrics
const statRevenue = document.getElementById('statRevenue');
const statTotalOrders = document.getElementById('statTotalOrders');
const statPending = document.getElementById('statPending');
const statShipped = document.getElementById('statShipped');

// Table and Controls
const ordersTableBody = document.getElementById('ordersTableBody');
const adminSearchInput = document.getElementById('adminSearchInput');
const adminStatusFilter = document.getElementById('adminStatusFilter');
const refreshBtn = document.getElementById('refreshBtn');

// Toast DOM
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Check if Admin session is active
function checkAuth() {
  const isLogged = sessionStorage.getItem('zj-admin-logged');
  if (isLogged === 'true') {
    loginLockOverlay.style.display = 'none';
    fetchOrders();
  } else {
    loginLockOverlay.style.display = 'flex';
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Login Form
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = adminPass.value.trim();
    if (password === 'admin123') {
      sessionStorage.setItem('zj-admin-logged', 'true');
      loginLockOverlay.style.display = 'none';
      showToast('Authentication Successful! Dashboard Loaded.');
      fetchOrders();
      adminLoginForm.reset();
    } else {
      alert('Invalid authorization password. Please try again.');
    }
  });

  // Logout / Lock
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('zj-admin-logged');
    loginLockOverlay.style.display = 'flex';
    showToast('Dashboard locked.');
  });

  // Refresh data
  refreshBtn.addEventListener('click', () => {
    fetchOrders();
  });

  // Search & Status filters
  adminSearchInput.addEventListener('input', renderOrders);
  adminStatusFilter.addEventListener('change', renderOrders);
}

// Fetch all orders from backend database
async function fetchOrders() {
  try {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem;">
          <div class="spinner" style="width: 30px; height: 30px;"></div>
          <p style="margin-top: 0.5rem;">Fetching orders list...</p>
        </td>
      </tr>
    `;
    
    const response = await fetch('/api/orders');
    if (!response.ok) throw new Error('Failed to retrieve orders list');
    orders = await response.json();
    
    calculateMetrics();
    renderOrders();
    showToast('Orders loaded successfully.');
  } catch (err) {
    console.error('Error fetching orders:', err);
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem; color: var(--error-color);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
          <p>Failed to retrieve orders from database. Make sure server & MongoDB are running.</p>
        </td>
      </tr>
    `;
  }
}

// Calculate dashboard KPIs
function calculateMetrics() {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped' || o.status === 'Approved').length;
  
  // Revenue is the total sum of Approved or Shipped orders
  const revenue = orders
    .filter(o => o.status === 'Approved' || o.status === 'Shipped')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  statTotalOrders.textContent = totalOrders;
  statPending.textContent = pendingOrders;
  statShipped.textContent = shippedOrders;
  statRevenue.textContent = `Rs. ${revenue.toLocaleString()}`;
}

// Render filtered orders into the table
function renderOrders() {
  const searchTerm = adminSearchInput.value.toLowerCase().trim();
  const statusFilter = adminStatusFilter.value;

  const filteredOrders = orders.filter(order => {
    // 1. Filter by Status
    if (statusFilter !== 'All' && order.status !== statusFilter) {
      return false;
    }
    
    // 2. Filter by search text
    const nameMatch = order.customerName.toLowerCase().includes(searchTerm);
    const phoneMatch = order.customerPhone.toLowerCase().includes(searchTerm);
    const tidMatch = order.transactionId.toLowerCase().includes(searchTerm);
    const addressMatch = order.shippingAddress.toLowerCase().includes(searchTerm);
    
    return nameMatch || phoneMatch || tidMatch || addressMatch;
  });

  if (filteredOrders.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          No orders match the current search or filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  ordersTableBody.innerHTML = '';
  filteredOrders.forEach(order => {
    const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Format ordered items
    let itemsHtml = '<ul>';
    order.items.forEach(item => {
      itemsHtml += `<li>${item.name} (x${item.quantity}) - Rs. ${(item.price * item.quantity).toLocaleString()}</li>`;
    });
    itemsHtml += '</ul>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size: 0.85rem; color: var(--text-muted);">${orderDate}</td>
      <td class="cust-info-cell">
        <p><strong><i class="fa-solid fa-user"></i> ${order.customerName}</strong></p>
        <p><i class="fa-solid fa-phone"></i> ${order.customerPhone}</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-house"></i> ${order.shippingAddress}</p>
      </td>
      <td class="items-list-cell">${itemsHtml}</td>
      <td style="font-weight: 700; color: var(--accent-color);">Rs. ${order.totalAmount.toLocaleString()}</td>
      <td>
        <span class="tid-badge" title="Click to copy Transaction ID">${order.transactionId}</span>
      </td>
      <td>
        <select class="status-select ${order.status.toLowerCase()}" data-id="${order._id}">
          <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Approved" ${order.status === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td style="text-align: center;">
        <button class="action-btn-delete" data-id="${order._id}" title="Delete Order">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    `;

    // Copy TID Event
    tr.querySelector('.tid-badge').addEventListener('click', () => {
      navigator.clipboard.writeText(order.transactionId).then(() => {
        showToast(`Copied Transaction ID: ${order.transactionId}`);
      });
    });

    // Update Status dropdown change event
    const statusSelect = tr.querySelector('.status-select');
    statusSelect.addEventListener('change', (e) => {
      updateOrderStatus(order._id, e.target.value, statusSelect);
    });

    // Delete Order click event
    tr.querySelector('.action-btn-delete').addEventListener('click', () => {
      deleteOrder(order._id);
    });

    ordersTableBody.appendChild(tr);
  });
}

// Update Order status via API
async function updateOrderStatus(orderId, newStatus, selectElement) {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      showToast(`Order status updated to "${newStatus}"`);
      
      // Update local state and calculate KPI metrics
      const index = orders.findIndex(o => o._id === orderId);
      if (index > -1) {
        orders[index].status = newStatus;
      }
      
      // Update css class for select element colors
      selectElement.className = `status-select ${newStatus.toLowerCase()}`;
      
      calculateMetrics();
    } else {
      alert(data.error || 'Failed to update order status.');
      fetchOrders(); // Revert back
    }
  } catch (err) {
    console.error('Error updating order status:', err);
    alert('Network error: Unable to update order status.');
    fetchOrders(); // Revert back
  }
}

// Delete Order from database via API
async function deleteOrder(orderId) {
  const confirmDelete = confirm('Are you sure you want to permanently delete this order record? This cannot be undone.');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (response.ok && data.success) {
      showToast('Order record deleted successfully.');
      orders = orders.filter(o => o._id !== orderId);
      calculateMetrics();
      renderOrders();
    } else {
      alert(data.error || 'Failed to delete order.');
    }
  } catch (err) {
    console.error('Error deleting order:', err);
    alert('Network error: Unable to delete order.');
  }
}

// Show Custom Toast alerts
function showToast(message) {
  toastMessage.textContent = message;
  toastNotification.classList.add('active');
  setTimeout(() => {
    toastNotification.classList.remove('active');
  }, 3500);
}
