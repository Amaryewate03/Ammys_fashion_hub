const adminApi = '/api/admin';
const adminTokenKey = 'adminToken';
let products = [];
let orders = [];
let customers = [];
let enquiries = [];

function getAdminToken() {
  return sessionStorage.getItem(adminTokenKey);
}

function adminHeaders() {
  return { 'Authorization': `Bearer ${getAdminToken() || ''}`, 'Content-Type': 'application/json' };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function showMessage(message, type = '') {
  const element = document.getElementById('adminMessage');
  element.textContent = message;
  element.className = `admin-message ${type}`;
}

async function adminFetch(path, options = {}) {
  const response = await fetch(adminApi + path, { ...options, headers: { ...adminHeaders(), ...(options.headers || {}) } });
  if (response.status === 401 || response.status === 403) {
    logoutAdmin();
    throw new Error('Admin session expired');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function showDashboard(admin) {
  const loginView = document.getElementById('adminLoginView');
  const dashboardView = document.getElementById('adminDashboardView');
  loginView.hidden = true;
  loginView.style.display = 'none';
  dashboardView.hidden = false;
  dashboardView.style.display = 'block';
  document.getElementById('adminName').textContent = admin.name;
  loadDashboard();
}

function logoutAdmin() {
  sessionStorage.removeItem(adminTokenKey);
  localStorage.removeItem(adminTokenKey);
  window.location.href = '/admin';
}

async function loadDashboard() {
  try {
    const stats = await adminFetch('/stats');
    document.getElementById('statProducts').textContent = stats.products;
    document.getElementById('statUsers').textContent = stats.users;
    document.getElementById('statOrders').textContent = stats.orders;
    document.getElementById('statEnquiries').textContent = stats.enquiries;
    document.getElementById('statRevenue').textContent = '₹' + Number(stats.revenue).toLocaleString('en-IN');
    await Promise.all([loadProducts(), loadOrders(), loadCustomers(), loadEnquiries()]);
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function loadProducts() {
  products = await adminFetch('/products');
  document.getElementById('productsTable').innerHTML = products.map(product => `
    <tr>
      <td><strong>${escapeHtml(product.title)}</strong><small>${escapeHtml(product.gender)} · ${escapeHtml(product.style)}</small></td>
      <td>${escapeHtml(product.category)}</td>
      <td>₹${Number(product.price).toLocaleString('en-IN')}</td>
      <td>${product.stock}</td>
      <td>${product.featured ? 'Yes' : 'No'}</td>
      <td class="admin-actions"><button class="table-action" data-edit-product="${product._id}">Edit</button><button class="table-action danger" data-delete-product="${product._id}">Delete</button></td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="admin-empty">No products found.</td></tr>';
}

async function loadOrders() {
  orders = await adminFetch('/orders');
  document.getElementById('ordersTable').innerHTML = orders.map(order => `
    <tr>
      <td><strong>#${escapeHtml(order.orderId)}</strong><small>${order.items?.length || 0} item(s)</small></td>
      <td>${escapeHtml(order.user?.name || 'Unknown')}<small>${escapeHtml(order.user?.email || '')}</small></td>
      <td>₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
      <td>${escapeHtml(order.paymentMethod)}<small>${escapeHtml(order.transactionId || '')}</small></td>
      <td>${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
      <td><select class="status-select" data-order-status="${order._id}">${['Pending', 'Completed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(status => `<option ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
      <td class="admin-actions"><button class="table-action" data-edit-order="${order._id}">Edit</button><button class="table-action danger" data-delete-order="${order._id}">Delete</button></td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="admin-empty">No orders found.</td></tr>';
}

async function loadCustomers() {
  customers = await adminFetch('/users');
  document.getElementById('customersTable').innerHTML = customers.map(customer => `
    <tr><td><strong>${escapeHtml(customer.name)}</strong></td><td>${escapeHtml(customer.email)}</td><td>${escapeHtml(customer.phone || '-')}</td><td>${new Date(customer.createdAt).toLocaleDateString('en-IN')}</td><td class="admin-actions"><button class="table-action" data-edit-customer="${customer._id}">Edit</button><button class="table-action danger" data-delete-customer="${customer._id}">Delete</button></td></tr>
  `).join('') || '<tr><td colspan="5" class="admin-empty">No customers found.</td></tr>';
}

async function loadEnquiries() {
  enquiries = await adminFetch('/enquiries');
  document.getElementById('enquiriesTable').innerHTML = enquiries.map(enquiry => `
    <tr><td><strong>${escapeHtml(enquiry.name)}</strong><small>${escapeHtml(enquiry.email)}</small></td><td>${escapeHtml(enquiry.message)}</td><td>${new Date(enquiry.createdAt).toLocaleDateString('en-IN')}</td><td><select class="status-select" data-enquiry-status="${enquiry._id}">${['New', 'In Progress', 'Resolved'].map(status => `<option ${status === enquiry.status ? 'selected' : ''}>${status}</option>`).join('')}</select></td><td class="admin-actions"><button class="table-action" data-edit-enquiry="${enquiry._id}">Edit</button><button class="table-action danger" data-delete-enquiry="${enquiry._id}">Delete</button></td></tr>
  `).join('') || '<tr><td colspan="5" class="admin-empty">No enquiries found.</td></tr>';
}

function resetProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('productStock').value = 50;
  document.getElementById('productFormTitle').textContent = 'Add Product';
  document.getElementById('productFormPanel').hidden = true;
}

function editProduct(id) {
  const product = products.find(item => item._id === id);
  if (!product) return;
  document.getElementById('productFormPanel').hidden = false;
  document.getElementById('productFormTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = product._id;
  document.getElementById('productTitle').value = product.title;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productGender').value = product.gender;
  document.getElementById('productStyle').value = product.style;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productImage').value = product.image;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productSizes').value = (product.sizes || []).join(', ');
  document.getElementById('productColors').value = (product.colors || []).join(', ');
  document.getElementById('productFeatured').checked = product.featured;
  document.getElementById('productFormPanel').scrollIntoView({ behavior: 'smooth' });
}

function editOrder(id) {
  const order = orders.find(item => item._id === id);
  if (!order) return;
  document.getElementById('orderFormPanel').hidden = false;
  document.getElementById('orderId').value = order._id;
  document.getElementById('orderTotal').value = order.totalAmount;
  document.getElementById('orderPayment').value = order.paymentMethod;
  document.getElementById('orderStatus').value = order.status;
  document.getElementById('orderTransaction').value = order.transactionId || '';
  document.getElementById('orderFullName').value = order.shippingAddress?.fullName || '';
  document.getElementById('orderPhone').value = order.shippingAddress?.phone || '';
  document.getElementById('orderAddress').value = order.shippingAddress?.address || '';
  document.getElementById('orderCity').value = order.shippingAddress?.city || '';
  document.getElementById('orderPincode').value = order.shippingAddress?.pincode || '';
  document.getElementById('orderFormPanel').scrollIntoView({ behavior: 'smooth' });
}

function editCustomer(id) {
  const customer = customers.find(item => item._id === id);
  if (!customer) return;
  document.getElementById('customerFormPanel').hidden = false;
  document.getElementById('customerId').value = customer._id;
  document.getElementById('customerName').value = customer.name;
  document.getElementById('customerEmail').value = customer.email;
  document.getElementById('customerPhone').value = customer.phone || '';
  document.getElementById('customerPassword').value = '';
  document.getElementById('customerFormPanel').scrollIntoView({ behavior: 'smooth' });
}

function editEnquiry(id) {
  const enquiry = enquiries.find(item => item._id === id);
  if (!enquiry) return;
  document.getElementById('enquiryFormPanel').hidden = false;
  document.getElementById('enquiryId').value = enquiry._id;
  document.getElementById('enquiryName').value = enquiry.name;
  document.getElementById('enquiryEmail').value = enquiry.email;
  document.getElementById('enquiryStatus').value = enquiry.status;
  document.getElementById('enquiryMessage').value = enquiry.message;
  document.getElementById('enquiryFormPanel').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('adminLoginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const message = document.getElementById('adminLoginMessage');
  try {
    const response = await fetch(adminApi + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: document.getElementById('adminEmail').value.trim(), password: document.getElementById('adminPassword').value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    sessionStorage.setItem(adminTokenKey, data.token);
    window.location.href = '/admin/dashboard';
  } catch (error) {
    message.textContent = error.message;
  }
});

document.getElementById('adminLogout').addEventListener('click', logoutAdmin);
document.getElementById('newProductButton').addEventListener('click', () => {
  resetProductForm();
  document.getElementById('productFormPanel').hidden = false;
});
document.getElementById('cancelProduct').addEventListener('click', resetProductForm);
document.getElementById('cancelOrder').addEventListener('click', () => {
  document.getElementById('orderForm').reset();
  document.getElementById('orderFormPanel').hidden = true;
});
document.getElementById('cancelCustomer').addEventListener('click', () => {
  document.getElementById('customerForm').reset();
  document.getElementById('customerFormPanel').hidden = true;
});
document.getElementById('cancelEnquiry').addEventListener('click', () => {
  document.getElementById('enquiryForm').reset();
  document.getElementById('enquiryFormPanel').hidden = true;
});

document.querySelectorAll('.admin-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.admin-tab').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById('section-' + tab.dataset.section).classList.add('active');
}));

document.getElementById('productForm').addEventListener('submit', async event => {
  event.preventDefault();
  const id = document.getElementById('productId').value;
  const payload = {
    title: document.getElementById('productTitle').value.trim(),
    price: document.getElementById('productPrice').value,
    category: document.getElementById('productCategory').value,
    gender: document.getElementById('productGender').value,
    style: document.getElementById('productStyle').value,
    stock: document.getElementById('productStock').value,
    image: document.getElementById('productImage').value.trim(),
    description: document.getElementById('productDescription').value.trim(),
    sizes: document.getElementById('productSizes').value.split(',').map(value => value.trim()).filter(Boolean),
    colors: document.getElementById('productColors').value.split(',').map(value => value.trim()).filter(Boolean),
    featured: document.getElementById('productFeatured').checked
  };
  try {
    await adminFetch(id ? `/products/${id}` : '/products', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    resetProductForm();
    showMessage('Product saved successfully.', 'success');
    await loadProducts();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document.getElementById('orderForm').addEventListener('submit', async event => {
  event.preventDefault();
  const shippingAddress = {
    fullName: document.getElementById('orderFullName').value.trim(),
    phone: document.getElementById('orderPhone').value.trim(),
    address: document.getElementById('orderAddress').value.trim(),
    city: document.getElementById('orderCity').value.trim(),
    pincode: document.getElementById('orderPincode').value.trim()
  };
  try {
    await adminFetch('/orders/' + document.getElementById('orderId').value, { method: 'PUT', body: JSON.stringify({
      totalAmount: document.getElementById('orderTotal').value,
      paymentMethod: document.getElementById('orderPayment').value,
      status: document.getElementById('orderStatus').value,
      transactionId: document.getElementById('orderTransaction').value.trim(),
      shippingAddress
    }) });
    document.getElementById('orderForm').reset();
    document.getElementById('orderFormPanel').hidden = true;
    showMessage('Order updated successfully.', 'success');
    await loadOrders();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document.getElementById('customerForm').addEventListener('submit', async event => {
  event.preventDefault();
  const payload = {
    name: document.getElementById('customerName').value.trim(),
    email: document.getElementById('customerEmail').value.trim(),
    phone: document.getElementById('customerPhone').value.trim(),
    password: document.getElementById('customerPassword').value
  };
  try {
    await adminFetch('/users/' + document.getElementById('customerId').value, { method: 'PUT', body: JSON.stringify(payload) });
    document.getElementById('customerForm').reset();
    document.getElementById('customerFormPanel').hidden = true;
    showMessage('Customer updated successfully.', 'success');
    await loadCustomers();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document.getElementById('enquiryForm').addEventListener('submit', async event => {
  event.preventDefault();
  const payload = {
    name: document.getElementById('enquiryName').value.trim(),
    email: document.getElementById('enquiryEmail').value.trim(),
    message: document.getElementById('enquiryMessage').value.trim(),
    status: document.getElementById('enquiryStatus').value
  };
  try {
    await adminFetch('/enquiries/' + document.getElementById('enquiryId').value, { method: 'PUT', body: JSON.stringify(payload) });
    document.getElementById('enquiryForm').reset();
    document.getElementById('enquiryFormPanel').hidden = true;
    showMessage('Enquiry updated successfully.', 'success');
    await loadEnquiries();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document.addEventListener('click', async event => {
  const editButton = event.target.closest('[data-edit-product]');
  const deleteButton = event.target.closest('[data-delete-product]');
  const editOrderButton = event.target.closest('[data-edit-order]');
  const deleteOrderButton = event.target.closest('[data-delete-order]');
  const editCustomerButton = event.target.closest('[data-edit-customer]');
  const deleteCustomerButton = event.target.closest('[data-delete-customer]');
  const editEnquiryButton = event.target.closest('[data-edit-enquiry]');
  const deleteEnquiryButton = event.target.closest('[data-delete-enquiry]');
  if (editButton) editProduct(editButton.dataset.editProduct);
  if (editOrderButton) editOrder(editOrderButton.dataset.editOrder);
  if (editCustomerButton) editCustomer(editCustomerButton.dataset.editCustomer);
  if (editEnquiryButton) editEnquiry(editEnquiryButton.dataset.editEnquiry);
  if (deleteButton && confirm('Delete this product?')) {
    try {
      await adminFetch('/products/' + deleteButton.dataset.deleteProduct, { method: 'DELETE' });
      showMessage('Product deleted.', 'success');
      await loadProducts();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }
  if (deleteOrderButton && confirm('Delete this order?')) {
    try {
      await adminFetch('/orders/' + deleteOrderButton.dataset.deleteOrder, { method: 'DELETE' });
      showMessage('Order deleted.', 'success');
      await loadOrders();
    } catch (error) { showMessage(error.message, 'error'); }
  }
  if (deleteCustomerButton && confirm('Delete this customer and their orders?')) {
    try {
      await adminFetch('/users/' + deleteCustomerButton.dataset.deleteCustomer, { method: 'DELETE' });
      showMessage('Customer deleted.', 'success');
      await Promise.all([loadCustomers(), loadOrders()]);
    } catch (error) { showMessage(error.message, 'error'); }
  }
  if (deleteEnquiryButton && confirm('Delete this enquiry?')) {
    try {
      await adminFetch('/enquiries/' + deleteEnquiryButton.dataset.deleteEnquiry, { method: 'DELETE' });
      showMessage('Enquiry deleted.', 'success');
      await loadEnquiries();
    } catch (error) { showMessage(error.message, 'error'); }
  }
});

document.addEventListener('change', async event => {
  if (!event.target.matches('[data-order-status]')) return;
  try {
    await adminFetch('/orders/' + event.target.dataset.orderStatus + '/status', { method: 'PUT', body: JSON.stringify({ status: event.target.value }) });
    showMessage('Order status updated.', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

document.addEventListener('change', async event => {
  if (!event.target.matches('[data-enquiry-status]')) return;
  const enquiry = enquiries.find(item => item._id === event.target.dataset.enquiryStatus);
  if (!enquiry) return;
  try {
    await adminFetch('/enquiries/' + enquiry._id, { method: 'PUT', body: JSON.stringify({ name: enquiry.name, email: enquiry.email, message: enquiry.message, status: event.target.value }) });
    showMessage('Enquiry status updated.', 'success');
    await loadEnquiries();
  } catch (error) { showMessage(error.message, 'error'); }
});

(async function initAdmin() {
  localStorage.removeItem(adminTokenKey);
  const token = getAdminToken();
  if (!token) return;
  try {
    const data = await adminFetch('/me');
    showDashboard(data.admin);
  } catch (error) {
    sessionStorage.removeItem(adminTokenKey);
  }
})();
