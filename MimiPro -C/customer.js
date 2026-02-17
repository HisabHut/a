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
                    <div id="productGrid" class="product-grid">
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
            let doc = await db.collection('users')
                .doc(session.companyId)
                .collection('customers')
                .doc(session.customerId)
                .get();

            if (!doc.exists) {
                const snapshot = await db.collection('users')
                    .doc(session.companyId)
                    .collection('customers')
                    .where('customerId', '==', session.customerId)
                    .limit(1)
                    .get();
                if (snapshot.empty) return null;
                doc = snapshot.docs[0];
            }

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

    static updateProductsUI(products) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        if (!products || products.length === 0) {
            grid.innerHTML = '<div style="padding: 12px; color: #6c757d;">No products available</div>';
            return;
        }

        grid.innerHTML = products.map(product => this.renderProductCard(product)).join('');
    }

    static startRealtimeProducts(session) {
        HomePage.stopRealtimeProducts();

        HomePage.productsUnsubscribe = db.collection('users')
            .doc(session.companyId)
            .collection('products')
            .where('active', '==', true)
            .onSnapshot(snapshot => {
                const products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    stock: doc.data().stock || 0
                }));
                HomePage.updateProductsUI(products);
            }, error => {
                console.error('Realtime products listener error:', error);
            });
    }

    static stopRealtimeProducts() {
        if (HomePage.productsUnsubscribe) {
            HomePage.productsUnsubscribe();
            HomePage.productsUnsubscribe = null;
        }
    }
}

HomePage.productsUnsubscribe = null;

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

class CreditsPage {
    static async render() {
        const session = getCustomerSession();
        const customerData = await this.getCustomerData(session);
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        if (!customerData) {
            return `
                <section class="page-section">
                    <h2>Credits</h2>
                    <p>Unable to load customer data</p>
                </section>
            `;
        }

        // Calculate outstanding balance across all months
        const allCredits = await this.getAllCredits(session, customerData.customerKey);
        const totalCredit = allCredits.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = allCredits.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
        const totalBalance = totalCredit - totalPaid;

        const monthCredits = await this.getCreditsForMonth(session, customerData.customerKey, currentMonth);

        CreditsPage.cachedCredits = allCredits;
        CreditsPage.cachedCustomerData = customerData;
        
        return `
            <section class="page-section">
                <div class="list-container">
                    <!-- Back Button & Title -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                        <div style="font-size: 14px; font-weight: 600; color: #1f2937;">Customer Details</div>
                    </div>

                    <!-- Customer Header Card -->
                    <div style="text-align: center; margin-bottom: 16px; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${customerData.name || 'Unknown'}</div>
                        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 12px; letter-spacing: 0.5px;">${customerData.loginId || customerData.customerId || session.customerId}</div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: left;">
                            <div style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 10px;">
                                <div style="font-size: 10px; opacity: 0.8; margin-bottom: 2px;">Area</div>
                                <div style="font-size: 13px; font-weight: 600;">${customerData.area || 'N/A'}</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 8px 10px;">
                                <div style="font-size: 10px; opacity: 0.8; margin-bottom: 2px;">Mobile</div>
                                <div style="font-size: 13px; font-weight: 600;">${customerData.phone || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Month Filter -->
                    <div style="display: flex; gap: 8px; margin-bottom: 16px; align-items: center; justify-content: center;">
                        <label style="font-size: 12px; font-weight: 600; color: #6c757d;">Filter by Month/Year</label>
                        <input 
                            type="month" 
                            id="creditMonthFilter" 
                            style="padding: 8px 12px; border: 1px solid #e9ecef; border-radius: 6px; font-size: 12px; cursor: pointer;"
                            value="${currentMonth}"
                        />
                    </div>

                    <!-- Total Outstanding -->
                    <div style="margin-bottom: 16px; padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                        <div style="font-size: 12px; color: #92400e; font-weight: 600; margin-bottom: 4px;">Total Outstanding (All Time)</div>
                        <div id="totalOutstandingValue" style="font-size: 24px; font-weight: 700; color: #b45309;">₹${totalBalance.toLocaleString()}</div>
                    </div>

                    <!-- Credits for Selected Month -->
                    <h3 style="font-size: 14px; font-weight: 600; color: #2c3e50; margin: 16px 0 12px 0;">Credits for Selected Month</h3>
                    <div id="monthCreditsList" style="display: flex; flex-direction: column; gap: 10px;">
                        ${monthCredits.length === 0 ? `
                            <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 13px;">
                                No credits for this month
                            </div>
                        ` : monthCredits.map(credit => this.renderCreditCard(credit, session)).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    static renderCreditCard(credit, session) {
        const creditBalance = (credit.amount || 0) - (credit.paidAmount || 0);
        const date = CreditsPage.formatCreditDate(credit);
        const orderInfo = credit.orderNumber ? `<div style="font-size: 11px; color: #667eea; font-weight: 600;">Order: ${credit.orderNumber}</div>` : '';
        const paymentInfo = credit.paidAmount > 0 ? `<div style="font-size: 11px; color: #28a745; margin-top: 4px;">💰 Paid: ₹${(credit.paidAmount || 0).toLocaleString()}</div>` : '';
        
        return `
            <div class="list-item" style="display: block; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onclick="CreditsPage.showCreditDetails('${credit.id}', '${session.companyId}', '${session.customerId}')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">📅 ${date}</div>
                        ${orderInfo}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 4px;">₹${(credit.amount || 0).toLocaleString()}</div>
                        <div style="font-size: 11px; color: ${creditBalance > 0 ? '#dc3545' : '#28a745'}; font-weight: 600;">Balance: ₹${creditBalance.toLocaleString()}</div>
                    </div>
                </div>
                ${paymentInfo}
                ${credit.notes ? `<div style="font-size: 11px; color: #6c757d; margin-top: 8px;">📝 ${credit.notes}</div>` : ''}
            </div>
        `;
    }

    static async showCreditDetails(creditId, companyId, customerId) {
        try {
            const creditDoc = await db.collection('users')
                .doc(companyId)
                .collection('credits')
                .doc(creditId)
                .get();
            
            if (!creditDoc.exists) {
                alert('Credit details not found');
                return;
            }

            const credit = creditDoc.data();
            const balance = (credit.amount || 0) - (credit.paidAmount || 0);
            const paymentHistory = Array.isArray(credit.paymentHistory) ? credit.paymentHistory : [];

            let details = `
                <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">💳 Credit Summary</div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px;">
                        <div>
                            <span style="color: #6c757d;">Amount:</span>
                            <div style="font-weight: 600; color: #1f2937;">₹${(credit.amount || 0).toLocaleString()}</div>
                        </div>
                        <div>
                            <span style="color: #6c757d;">Paid:</span>
                            <div style="font-weight: 600; color: #28a745;">₹${(credit.paidAmount || 0).toLocaleString()}</div>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <span style="color: #6c757d;">Balance:</span>
                            <div style="font-weight: 700; color: ${balance > 0 ? '#dc3545' : '#28a745'}; font-size: 14px;">₹${balance.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            `;

            if (paymentHistory.length > 0) {
                details += `
                    <div>
                        <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">💰 Payment History</div>
                        ${paymentHistory.map(payment => `
                            <div style="padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 6px; font-size: 12px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span style="color: #6c757d;">${payment.date || 'N/A'}</span>
                                    <span style="font-weight: 700; color: #28a745;">₹${(payment.amount || 0).toLocaleString()}</span>
                                </div>
                                ${payment.method ? `<div style="font-size: 11px; color: #667eea;">Method: ${payment.method}</div>` : ''}
                                ${payment.notes ? `<div style="font-size: 11px; color: #6c757d;">Note: ${payment.notes}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                details += '<div style="padding: 12px; background: #fef3c7; border-radius: 6px; font-size: 12px; color: #92400e;">No payments recorded</div>';
            }

            // Show as modal-like overlay
            const detailsHtml = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 1000;">
                    <div style="width: 100%; background: white; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto;  animation: slideUp 0.3s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">Credit Details</h2>
                            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #9ca3af;">×</button>
                        </div>
                        ${details}
                    </div>
                </div>
            `;

            const modal = document.createElement('div');
            modal.innerHTML = detailsHtml;
            modal.onclick = (e) => {
                if (e.target === modal.firstElementChild) modal.remove();
            };
            document.body.appendChild(modal);

        } catch (error) {
            console.error('Error fetching credit details:', error);
            alert('Error loading credit details');
        }
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
            const docId = doc.id;
            const numericId = data.id || (docId && !isNaN(Number(docId)) ? Number(docId) : null);
            return {
                name: data.name || 'Customer',
                email: data.email || '',
                phone: data.phone || '',
                area: data.area || '',
                loginId: data.loginId || data.customerId || '',
                customerId: data.customerId || '',
                customerKey: numericId || data.customerId || session.customerId
            };
        } catch (error) {
            console.error('Error fetching customer data:', error);
            return null;
        }
    }

    static async getAllCredits(session, customerKey) {
        try {
            const queryRef = CreditsPage.buildCreditsQuery(session, customerKey);
            const snapshot = await queryRef.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching all credits:', error);
            return [];
        }
    }

    static async getCreditsForMonth(session, customerKey, monthStr) {
        try {
            const queryRef = CreditsPage.buildCreditsQuery(session, customerKey);
            const snapshot = await queryRef.get();

            // Filter by month string in client since Firestore query is simpler
            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(credit => CreditsPage.getCreditMonthKey(credit) === monthStr)
                .sort((a, b) => CreditsPage.getCreditSortKey(b).localeCompare(CreditsPage.getCreditSortKey(a)));
        } catch (error) {
            console.error('Error fetching credits for month:', error);
            return [];
        }
    }

    static buildCreditsQuery(session, customerKey) {
        const creditsCollection = db.collection('users')
            .doc(session.companyId)
            .collection('credits');

        const values = [customerKey, session.customerId]
            .filter(value => value !== undefined && value !== null && value !== '')
            .filter((value, index, arr) => arr.indexOf(value) === index);

        if (values.length === 0) {
            return creditsCollection; // Guard clause for empty values
        }
        if (values.length > 1) {
            return creditsCollection.where('customerId', 'in', values);
        }

        return creditsCollection.where('customerId', '==', values[0]);
    }

    static updateCreditsUI(credits, session, monthStr) {
        CreditsPage.cachedCredits = credits || [];

        const totalCredit = CreditsPage.cachedCredits.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = CreditsPage.cachedCredits.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
        const totalBalance = totalCredit - totalPaid;

        const totalOutstandingEl = document.getElementById('totalOutstandingValue');
        if (totalOutstandingEl) {
            totalOutstandingEl.textContent = `₹${totalBalance.toLocaleString()}`;
        }

        const monthCredits = CreditsPage.cachedCredits
            .filter(credit => CreditsPage.getCreditMonthKey(credit) === monthStr)
            .sort((a, b) => CreditsPage.getCreditSortKey(b).localeCompare(CreditsPage.getCreditSortKey(a)));

        const creditsList = document.getElementById('monthCreditsList');
        if (!creditsList) return;

        if (monthCredits.length === 0) {
            creditsList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 13px;">
                    No credits for this month
                </div>
            `;
            return;
        }

        creditsList.innerHTML = monthCredits.map(credit => CreditsPage.renderCreditCard(credit, session)).join('');
    }

    static startRealtimeListener(session, customerKey) {
        CreditsPage.stopRealtimeListener();

        const queryRef = CreditsPage.buildCreditsQuery(session, customerKey);
        CreditsPage.realtimeUnsubscribe = queryRef.onSnapshot(snapshot => {
            const credits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const monthFilter = document.getElementById('creditMonthFilter');
            const monthStr = monthFilter ? monthFilter.value : new Date().toISOString().slice(0, 7);
            CreditsPage.updateCreditsUI(credits, session, monthStr);
        }, error => {
            console.error('Realtime credits listener error:', error);
        });
    }

    static stopRealtimeListener() {
        if (CreditsPage.realtimeUnsubscribe) {
            CreditsPage.realtimeUnsubscribe();
            CreditsPage.realtimeUnsubscribe = null;
        }
    }

    static getCreditSortKey(credit) {
        const date = CreditsPage.getCreditDateObject(credit);
        return date ? date.toISOString() : '';
    }

    static getCreditMonthKey(credit) {
        const date = CreditsPage.getCreditDateObject(credit);
        if (!date) return '';
        return date.toISOString().slice(0, 7);
    }

    static formatCreditDate(credit) {
        const date = CreditsPage.getCreditDateObject(credit);
        if (!date) return '';
        return date.toLocaleDateString('en-IN');
    }

    static getCreditDateObject(credit) {
        if (!credit || !credit.date) return null;
        if (typeof credit.date === 'string') {
            const parsed = new Date(credit.date);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        if (credit.date.toDate) {
            return credit.date.toDate();
        }
        if (credit.date instanceof Date) {
            return credit.date;
        }
        return null;
    }
}

CreditsPage.realtimeUnsubscribe = null;
CreditsPage.cachedCredits = [];
CreditsPage.cachedCustomerData = null;

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
        credits: CreditsPage,
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

        if (this.currentPage === 'home' && pageName !== 'home') {
            HomePage.stopRealtimeProducts();
        }
        if (this.currentPage === 'credits' && pageName !== 'credits') {
            CreditsPage.stopRealtimeListener();
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
            credits: 'Credits',
            profile: 'Profile'
        };
        document.getElementById('pageTitle').textContent = titleMap[pageName] || 'Home';

        // Render page
        try {
            const pageContent = document.getElementById('pageContent');
            const html = await this.pages[pageName].render();
            pageContent.innerHTML = html;

            // Setup page-specific event listeners
            await this.setupPageEventListeners(pageName);
        } catch (error) {
            console.error('Error rendering page:', error);
            document.getElementById('pageContent').innerHTML = '<p>Error loading page content</p>';
        }
    },

    async setupPageEventListeners(pageName) {
        if (pageName === 'profile') {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    logout();
                });
            }
        }
        
        if (pageName === 'credits') {
            const monthFilter = document.getElementById('creditMonthFilter');
            if (monthFilter) {
                monthFilter.addEventListener('change', async (e) => {
                    const session = getCustomerSession();
                    const selectedMonth = e.target.value; // YYYY-MM
                    const customerData = CreditsPage.cachedCustomerData || await CreditsPage.getCustomerData(session);
                    const credits = CreditsPage.cachedCredits.length > 0
                        ? CreditsPage.cachedCredits
                        : await CreditsPage.getAllCredits(session, customerData?.customerKey || session.customerId);

                    CreditsPage.updateCreditsUI(credits, session, selectedMonth);
                });
            }

            const session = getCustomerSession();
            const customerData = CreditsPage.cachedCustomerData || await CreditsPage.getCustomerData(session);
            if (customerData) {
                CreditsPage.startRealtimeListener(session, customerData.customerKey || session.customerId);
            }
        }

        if (pageName === 'home') {
            const session = getCustomerSession();
            if (session) {
                HomePage.startRealtimeProducts(session);
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

            // Query customers from Firestore to find by customerId
            const snapshot = await db.collection('users')
                .doc(companyId)
                .collection('customers')
                .where('customerId', '==', customerId)
                .limit(1)
                .get();

            if (snapshot.empty) {
                showLoginError('Invalid Customer ID or Company ID');
                loginBtn.disabled = false;
                loginBtnText.style.display = 'inline';
                loginSpinner.classList.remove('active');
                return;
            }

            const customerDoc = snapshot.docs[0];
            const customerData = customerDoc.data();

            // Debug log
            console.log('🔍 Login attempt:', {
                enteredPassword: password,
                enteredHash: passwordHash,
                storedHash: customerData.passwordHash,
                match: customerData.passwordHash === passwordHash,
                fullCustomerData: customerData
            });

            // Verify password
            if (customerData.passwordHash !== passwordHash) {
                showLoginError('Invalid password');
                loginBtn.disabled = false;
                loginBtnText.style.display = 'inline';
                loginSpinner.classList.remove('active');
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
