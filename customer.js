// Customer App Core
class CustomerApp {
    constructor() {
        this.currentPage = 'home';
        this.customerData = this.loadCustomerData();
        this.init();
    }

    init() {
        // Set up navigation (always do this)
        this.setupNavigation();
        
        // Update customer name in header
        this.updateCustomerName();
        
        // Check if customer is logged in
        if (!this.customerData.isLoggedIn) {
            // Show login overlay or redirect
            this.showLoginOverlay();
        } else {
            // Load initial page from URL or default to home
            const initialPage = window.location.hash.slice(1) || 'home';
            this.loadPage(initialPage, false);
        }
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            this.loadPage(page, false);
        });
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.loadPage(page);
            });
        });
    }

    loadPage(pageName, pushState = true) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageName) {
                item.classList.add('active');
            }
        });

        // Update page title - handle camelCase names
        const pageTitle = pageName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
        document.getElementById('page-title').textContent = pageTitle;

        // Load page content
        const content = this.getPageContent(pageName);
        document.getElementById('content').innerHTML = content;

        // Set up page-specific event listeners
        this.setupPageEventListeners(pageName);

        // Update URL
        if (pushState) {
            history.pushState({ page: pageName }, '', `#${pageName}`);
        }

        this.currentPage = pageName;
    }

    setupPageEventListeners(pageName) {
        // Handle logout button on customer details page
        if (pageName === 'customerDetails') {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.handleLogout();
                });
            }
        }
    }

    getPageContent(pageName) {
        const pages = {
            home: this.getHomeContent(),
            orders: this.getOrdersContent(),
            customerDetails: this.getCustomerDetailsContent()
        };

        return pages[pageName] || pages.home;
    }

    getHomeContent() {
        return `
            <div class="grid grid-2">
                <div class="stat-card">
                    <div class="stat-value">12</div>
                    <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <div class="stat-value">₹15,230</div>
                    <div class="stat-label">Total Spent</div>
                </div>
            </div>

            <div class="card" style="margin-top: 1.5rem;">
                <div class="card-header">Store - Available Products</div>
                <div class="card-body">
                    <div class="product-grid">
                        <div class="product-card">
                            <div class="product-image">🛍️</div>
                            <div class="product-name">Product A</div>
                            <div class="product-price">₹1,250</div>
                            <div class="product-stock">In Stock: 45 units</div>
                            <button class="btn btn-primary" style="width: 100%;">View Details</button>
                        </div>
                        <div class="product-card">
                            <div class="product-image">📱</div>
                            <div class="product-name">Product B</div>
                            <div class="product-price">₹850</div>
                            <div class="product-stock">In Stock: 120 units</div>
                            <button class="btn btn-primary" style="width: 100%;">View Details</button>
                        </div>
                        <div class="product-card">
                            <div class="product-image">📚</div>
                            <div class="product-name">Product C</div>
                            <div class="product-price">₹450</div>
                            <div class="product-stock">Low Stock: 5 units</div>
                            <button class="btn btn-primary" style="width: 100%;">View Details</button>
                        </div>
                        <div class="product-card">
                            <div class="product-image">⚽</div>
                            <div class="product-name">Product D</div>
                            <div class="product-price">₹2,100</div>
                            <div class="product-stock">Out of Stock</div>
                            <button class="btn btn-secondary" style="width: 100%;" disabled>Unavailable</button>
                        </div>
                        <div class="product-card">
                            <div class="product-image">🎮</div>
                            <div class="product-name">Product E</div>
                            <div class="product-price">₹3,500</div>
                            <div class="product-stock">In Stock: 78 units</div>
                            <button class="btn btn-primary" style="width: 100%;">View Details</button>
                        </div>
                        <div class="product-card">
                            <div class="product-image">🎧</div>
                            <div class="product-name">Product F</div>
                            <div class="product-price">₹1,899</div>
                            <div class="product-stock">In Stock: 32 units</div>
                            <button class="btn btn-primary" style="width: 100%;">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getOrdersContent() {
        return `
            <div class="card">
                <div class="card-header">My Orders</div>
                <div class="card-body">
                    <div class="order-item">
                        <div class="order-header">
                            <span class="order-id">#ORD-001</span>
                            <span class="badge badge-success">Delivered</span>
                        </div>
                        <div class="order-details">
                            <div class="order-detail-item">
                                <span class="order-detail-label">Order Date</span>
                                <span class="order-detail-value">2026-02-08</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Delivery Date</span>
                                <span class="order-detail-value">2026-02-10</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Total Amount</span>
                                <span class="order-detail-value">₹1,250</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Items</span>
                                <span class="order-detail-value">3 items</span>
                            </div>
                        </div>
                    </div>

                    <div class="order-item">
                        <div class="order-header">
                            <span class="order-id">#ORD-002</span>
                            <span class="badge badge-info">Confirmed</span>
                        </div>
                        <div class="order-details">
                            <div class="order-detail-item">
                                <span class="order-detail-label">Order Date</span>
                                <span class="order-detail-value">2026-02-10</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Expected Delivery</span>
                                <span class="order-detail-value">2026-02-15</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Total Amount</span>
                                <span class="order-detail-value">₹2,340</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Items</span>
                                <span class="order-detail-value">5 items</span>
                            </div>
                        </div>
                    </div>

                    <div class="order-item">
                        <div class="order-header">
                            <span class="order-id">#ORD-003</span>
                            <span class="badge badge-warning">Processing</span>
                        </div>
                        <div class="order-details">
                            <div class="order-detail-item">
                                <span class="order-detail-label">Order Date</span>
                                <span class="order-detail-value">2026-02-12</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Expected Delivery</span>
                                <span class="order-detail-value">2026-02-18</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Total Amount</span>
                                <span class="order-detail-value">₹890</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Items</span>
                                <span class="order-detail-value">2 items</span>
                            </div>
                        </div>
                    </div>

                    <div class="order-item">
                        <div class="order-header">
                            <span class="order-id">#ORD-004</span>
                            <span class="badge badge-success">Delivered</span>
                        </div>
                        <div class="order-details">
                            <div class="order-detail-item">
                                <span class="order-detail-label">Order Date</span>
                                <span class="order-detail-value">2026-02-01</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Delivery Date</span>
                                <span class="order-detail-value">2026-02-05</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Total Amount</span>
                                <span class="order-detail-value">₹3,200</span>
                            </div>
                            <div class="order-detail-item">
                                <span class="order-detail-label">Items</span>
                                <span class="order-detail-value">7 items</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCustomerDetailsContent() {
        return `
            <div class="card">
                <div class="card-header">Customer Information</div>
                <div class="card-body">
                    <div class="customer-info-grid">
                        <div class="info-item">
                            <label class="info-label">Full Name</label>
                            <div class="info-value">${this.customerData.name || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">Email</label>
                            <div class="info-value">${this.customerData.email || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">Phone</label>
                            <div class="info-value">${this.customerData.phone || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">Customer ID</label>
                            <div class="info-value">${this.customerData.customerId || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">Company ID</label>
                            <div class="info-value">${this.customerData.companyId || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">Account Status</label>
                            <div class="info-value"><span class="badge badge-success">Active</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top: 1.5rem;">
                <div class="card-header">Credit Information</div>
                <div class="card-body">
                    <div class="grid grid-3">
                        <div class="stat-card">
                            <div class="stat-value">₹5,250</div>
                            <div class="stat-label">Available Credits</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <div class="stat-value">₹12,930</div>
                            <div class="stat-label">Total Credits Issued</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <div class="stat-value">₹7,680</div>
                            <div class="stat-label">Credits Used</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top: 1.5rem;">
                <div class="card-header">Account Actions</div>
                <div class="card-body">
                    <button id="logout-btn" class="btn btn-danger" style="width: 100%;">Logout</button>
                </div>
            </div>
        `;
    }

    showLoginOverlay() {
        // Create login overlay
        const overlay = document.createElement('div');
        overlay.id = 'login-overlay';
        overlay.className = 'login-overlay';
        overlay.innerHTML = `
            <div class="login-card">
                <div class="login-header">
                    <h2>Customer Login</h2>
                    <p>Enter your credentials to access your account</p>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label">Company ID</label>
                        <input type="text" id="company-id" class="form-input" placeholder="Enter company ID" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Customer ID</label>
                        <input type="text" id="customer-id" class="form-input" placeholder="Enter customer ID" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="password" class="form-input" placeholder="Enter password" required />
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">Login</button>
                </form>
                <p style="text-align: center; margin-top: 1rem; color: var(--text-secondary); font-size: 0.875rem;">
                    Credentials are created by the admin app
                </p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Setup login form listener
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    hideLoginOverlay() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    handleLogin() {
        const companyId = document.getElementById('company-id').value;
        const customerId = document.getElementById('customer-id').value;
        const password = document.getElementById('password').value;

        // Mock login validation (in real app, this would be an API call)
        if (companyId && customerId && password) {
            // Simulate successful login
            this.customerData = {
                isLoggedIn: true,
                companyId: companyId,
                customerId: customerId,
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+91 98765 43210'
            };

            // Save to localStorage
            this.saveCustomerData();

            // Update UI
            this.updateCustomerName();

            // Hide login overlay
            this.hideLoginOverlay();

            // Redirect to home
            this.loadPage('home');
        }
    }

    handleLogout() {
        // Clear customer data
        this.customerData = {
            isLoggedIn: false
        };

        // Clear localStorage
        localStorage.removeItem('customerData');

        // Update UI
        this.updateCustomerName();

        // Show login overlay
        this.showLoginOverlay();
    }

    loadCustomerData() {
        const saved = localStorage.getItem('customerData');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            isLoggedIn: false
        };
    }

    saveCustomerData() {
        localStorage.setItem('customerData', JSON.stringify(this.customerData));
    }

    updateCustomerName() {
        const nameElement = document.getElementById('customer-name');
        if (nameElement) {
            nameElement.textContent = this.customerData.isLoggedIn 
                ? this.customerData.name 
                : 'Guest';
        }
    }
}

// Initialize the application
let customerApp;
document.addEventListener('DOMContentLoaded', () => {
    customerApp = new CustomerApp();
});
