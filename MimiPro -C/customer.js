/**
 * MimiPro Customer App - Main Application Controller
 * Mirrors Employee App architecture but connects to customer data
 */

// Firebase Configuration (Same as Employee App)
const firebaseConfig = {
    apiKey: "AIzaSyDwlN548N9A0uRKiRGdvxmoASFCfJtvmo0",
    authDomain: "mimipro-0458.firebaseapp.com",
    projectId: "mimipro-0458",
    storageBucket: "mimipro-0458.firebasestorage.app",
    messagingSenderId: "414929851648",
    appId: "1:414929851648:web:535b52279d5e894bfd8fe5"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// ============ PAGE CLASSES ============

class HomePage {
    static async render() {
        const session = getCustomerSession();
        const customerData = await this.getCustomerData(session);
        const products = await this.getProducts(session);
        
        const totalOrders = customerData?.totalOrders || 0;
        const totalSpent = customerData?.totalSpent || 0;

        return `
            <section class="page-section">
                <h2 style="margin-bottom: 1.5rem;">Dashboard</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-label">Total Orders</div>
                        <div class="stat-value">${totalOrders}</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #4F46E5, #7C3AED);">
                        <div class="stat-icon">💰</div>
                        <div class="stat-label">Total Spent</div>
                        <div class="stat-value">₹${totalSpent.toLocaleString()}</div>
                    </div>
                </div>

                <div class="section" style="margin-top: 2rem;">
                    <h3 class="section-title">Available Products</h3>
                    <div class="product-grid">
                        ${products.map(product => this.renderProductCard(product)).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    static renderProductCard(product) {
        const stockStatus = product.stock > 10 ? 'In Stock' : 
                          product.stock > 0 ? 'Low Stock' : 'Out of Stock';
        const stockColor = product.stock > 10 ? '#28a745' : 
                         product.stock > 0 ? '#ffc107' : '#dc3545';
        
        return `
            <div class="product-card">
                <div class="product-image">${product.icon || '📦'}</div>
                <h4 class="product-name">${product.name}</h4>
                <div class="product-price">₹${product.price}</div>
                <div class="product-stock" style="color: ${stockColor};">
                    ${stockStatus}: ${product.stock} units
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'View Details'}
                </button>
            </div>
        `;
    }

    static async getCustomerData(session) {
        try {
            const doc = await db.collection('users')
                .doc(session.companyId)
                .collection('customers')
                .doc(session.customerId)
                .get();

            if (!doc.exists) return null;

            const data = doc.data();
            return {
                name: data.name || 'Customer',
                email: data.email || '',
                phone: data.phone || '',
                totalOrders: data.totalOrders || 0,
                totalSpent: data.totalSpent || 0,
                availableCredit: data.availableCredit || 0,
                issuedCredit: data.issuedCredit || 0,
                usedCredit: data.usedCredit || 0
            };
        } catch (error) {
            console.error('Error fetching customer data:', error);
            return null;
        }
    }

    static async getProducts(session) {
        try {
            const snapshot = await db.collection('users')
                .doc(session.companyId)
                .collection('products')
                .where('active', '==', true)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                stock: doc.data().stock || 0
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }
}

class OrdersPage {
    static async render() {
        const session = getCustomerSession();
        const orders = await this.getCustomerOrders(session);

        if (orders.length === 0) {
            return `
                <section class="page-section">
                    <h2 style="margin-bottom: 1.5rem;">My Orders</h2>
                    <div class="list-container" style="text-align: center; padding: 2rem;">
                        <p style="color: var(--text-secondary);">No orders yet</p>
                    </div>
                </section>
            `;
        }

        return `
            <section class="page-section">
                <h2 style="margin-bottom: 1.5rem;">My Orders</h2>
                <div class="list-container">
                    ${orders.map(order => this.renderOrderItem(order)).join('')}
                </div>
            </section>
        `;
    }

    static renderOrderItem(order) {
        const statusBadge = this.getStatusBadge(order.status);
        const orderDate = new Date(order.date?.toDate?.() || order.date).toLocaleDateString();
        const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate.toDate?.() || order.deliveryDate).toLocaleDateString() : '-';

        return `
            <div class="list-item" style="display: block; padding: 1rem; border-bottom: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <div style="font-weight: 600; color: var(--text-primary);">#${order.orderId || order.id}</div>
                    <span class="badge badge-${this.getBadgeClass(order.status)}">${order.status}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 0.875rem;">
                    <div>
                        <div style="color: var(--text-secondary); margin-bottom: 0.25rem;">Order Date</div>
                        <div style="color: var(--text-primary); font-weight: 500;">${orderDate}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); margin-bottom: 0.25rem;">Delivery Date</div>
                        <div style="color: var(--text-primary); font-weight: 500;">${deliveryDate}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); margin-bottom: 0.25rem;">Amount</div>
                        <div style="color: var(--text-primary); font-weight: 500;">₹${(order.amount || 0).toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); margin-bottom: 0.25rem;">Items</div>
                        <div style="color: var(--text-primary); font-weight: 500;">${order.itemCount || 0} items</div>
                    </div>
                </div>
            </div>
        `;
    }

    static getStatusBadge(status) {
        const statusMap = {
            'delivered': 'success',
            'confirmed': 'info',
            'processing': 'warning',
            'pending': 'warning',
            'cancelled': 'error'
        };
        return statusMap[status?.toLowerCase()] || 'info';
    }

    static getBadgeClass(status) {
        return this.getStatusBadge(status);
    }

    static async getCustomerOrders(session) {
        try {
            const snapshot = await db.collection('users')
                .doc(session.companyId)
                .collection('orders')
                .where('customerId', '==', session.customerId)
                .orderBy('date', 'desc')
                .limit(50)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }
}

class ProfilePage {
    static async render() {
        const session = getCustomerSession();
        const customerData = await HomePage.getCustomerData(session);

        if (!customerData) {
            return `
                <section class="page-section">
                    <h2>Profile</h2>
                    <p>Unable to load customer data</p>
                </section>
            `;
        }

        return `
            <section class="page-section">
                <h2 style="margin-bottom: 1.5rem;">Customer Information</h2>
                
                <div class="list-container">
                    <div class="list-item" style="display: block;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                            <div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Name</div>
                                <div style="color: var(--text-primary); font-weight: 500;">${customerData.name || 'N/A'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Email</div>
                                <div style="color: var(--text-primary); font-weight: 500;">${customerData.email || 'N/A'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Phone</div>
                                <div style="color: var(--text-primary); font-weight: 500;">${customerData.phone || 'N/A'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Customer ID</div>
                                <div style="color: var(--text-primary); font-weight: 500;">${session.customerId}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Company ID</div>
                                <div style="color: var(--text-primary); font-weight: 500;">${session.companyId}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Status</div>
                                <span class="badge badge-success">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section" style="margin-top: 2rem;">
                    <h3 class="section-title">Credit Information</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Available Credit</div>
                            <div class="stat-value">₹${(customerData.availableCredit || 0).toLocaleString()}</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <div class="stat-label">Total Issued</div>
                            <div class="stat-value">₹${(customerData.issuedCredit || 0).toLocaleString()}</div>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <div class="stat-label">Used Credit</div>
                            <div class="stat-value">₹${(customerData.usedCredit || 0).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div class="section" style="margin-top: 2rem;">
                    <button id="logoutBtn" class="btn btn-error" style="width: 100%; padding: 0.75rem;">Logout</button>
                </div>
            </section>
        `;
    }
}

// ============ APP CONTROLLER ============

const App = {
    currentPage: 'home',
    pages: {
        home: HomePage,
        orders: OrdersPage,
        profile: ProfilePage
    },

    async init() {
        console.log('🚀 Customer App initializing...');
        
        // Check authentication
        const session = getCustomerSession();
        
        if (!session) {
            // Show login overlay
            this.showLoginOverlay();
        } else {
            // Hide login overlay and show app
            this.hideLoginOverlay();
            this.showAppContainer();
            
            // Update header
            this.updateCustomerName(session);
            
            // Initialize navigation
            this.initNavigation();
            
            // Navigate to home
            await this.navigateTo('home');
        }
    },

    initNavigation() {
        // Bottom nav buttons
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.dataset.page;
                this.navigateTo(page);
            });
        });

        // Menu button (for future side nav implementation)
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                console.log('Menu clicked');
            });
        }

        // Sync button
        const syncBtn = document.getElementById('syncBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                console.log('Sync clicked');
                // TODO: Implement sync functionality
            });
        }
    },

    async navigateTo(pageName) {
        if (!this.pages[pageName]) {
            console.error('Page not found:', pageName);
            return;
        }

        this.currentPage = pageName;

        // Update active nav button
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            if (btn.dataset.page === pageName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update page title
        const titleMap = {
            home: 'Home',
            orders: 'Orders',
            profile: 'Profile'
        };
        document.getElementById('pageTitle').textContent = titleMap[pageName] || 'Home';

        // Render page
        try {
            const pageContent = document.getElementById('pageContent');
            const html = await this.pages[pageName].render();
            pageContent.innerHTML = html;

            // Setup page-specific event listeners
            this.setupPageEventListeners(pageName);
        } catch (error) {
            console.error('Error rendering page:', error);
            document.getElementById('pageContent').innerHTML = '<p>Error loading page content</p>';
        }
    },

    setupPageEventListeners(pageName) {
        if (pageName === 'profile') {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    logout();
                });
            }
        }
    },

    updateCustomerName(session) {
        const nameDisplay = document.getElementById('customerNameDisplay');
        if (nameDisplay) {
            nameDisplay.textContent = session.name || session.customerId;
        }
    },

    showLoginOverlay() {
        const overlay = document.getElementById('loginOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
        
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.classList.add('hidden');
        }

        // Setup login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    },

    hideLoginOverlay() {
        const overlay = document.getElementById('loginOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    showAppContainer() {
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.classList.remove('hidden');
        }
    },

    async handleLogin(e) {
        e.preventDefault();

        const companyId = document.getElementById('companyId').value.trim();
        const customerId = document.getElementById('customerId').value.trim();
        const password = document.getElementById('password').value;

        if (!companyId || !customerId || !password) {
            showLoginError('Please enter Company ID, Customer ID and Password');
            return;
        }

        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginSpinner = document.getElementById('loginSpinner');

        // Show loading state
        loginBtn.disabled = true;
        loginBtnText.style.display = 'none';
        loginSpinner.classList.add('active');

        try {
            // Hash password
            const passwordHash = await hashPassword(password);
            console.log('🔐 Password hash generated');

            // Query customer from Firestore
            const snapshot = await db.collection('users')
                .doc(companyId)
                .collection('customers')
                .where('customerId', '==', customerId)
                .limit(1)
                .get();

            if (snapshot.empty) {
                showLoginError('Invalid Customer ID');
                return;
            }

            const customerDoc = snapshot.docs[0];
            const customerData = customerDoc.data();

            // Verify password
            if (customerData.passwordHash !== passwordHash) {
                showLoginError('Invalid password');
                return;
            }

            console.log('✅ Customer authenticated');

            // Save session
            const sessionData = {
                companyId: companyId,
                customerId: customerId,
                name: customerData.name || customerId,
                email: customerData.email || '',
                phone: customerData.phone || '',
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('customerSession', JSON.stringify(sessionData));
            console.log('💾 Session saved');

            // Hide login and show app
            this.hideLoginOverlay();
            this.showAppContainer();
            this.updateCustomerName(sessionData);
            this.initNavigation();
            
            // Navigate to home
            await this.navigateTo('home');

        } catch (error) {
            console.error('❌ Login error:', error);
            showLoginError('Login failed: ' + error.message);
        } finally {
            loginBtn.disabled = false;
            loginBtnText.style.display = 'inline';
            loginSpinner.classList.remove('active');
        }
    }
};

// ============ HELPER FUNCTIONS ============

// SHA-256 Hash Function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get customer session
function getCustomerSession() {
    const sessionData = localStorage.getItem('customerSession');
    if (!sessionData) return null;
    
    try {
        return JSON.parse(sessionData);
    } catch (error) {
        console.error('Session parse error:', error);
        return null;
    }
}

// Logout
function logout() {
    localStorage.removeItem('customerSession');
    window.location.href = 'customer.html';
}

// Show login error
function showLoginError(message) {
    const errorDiv = document.getElementById('loginErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

// ============ INITIALIZATION ============

window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded - Initializing App');
    App.init();
});
