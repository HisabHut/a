/**
 * Dashboard Module
 */

const DashboardModule = {
    orders: [],
    credits: [],
    customers: [],
    products: [],
    areas: [],

    init() {
        this.render();
        this.loadDashboardData();
    },

    render() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: 16px;">
                <div>
                    <h2 style="color: white; font-size: 20px; margin: 0 0 4px 0;">Dashboard</h2>
                    <p style="opacity: 0.9; font-size: 13px; margin: 0;">Business overview and performance</p>
                </div>
                <div id="dashboardDate" style="font-size: 12px; opacity: 0.9; margin-top: 8px;"></div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div class="card" style="text-align: center; padding: 16px;">
                    <div style="font-size: 11px; color: #6c757d; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Today's Orders</div>
                    <div id="todayOrders" style="font-size: 24px; font-weight: 700; color: #2c3e50;">0</div>
                    <div style="font-size: 11px; color: #28a745; margin-top: 4px;">Total: <span id="todayOrdersTotal">৳0</span></div>
                </div>
                <div class="card" style="text-align: center; padding: 16px;">
                    <div style="font-size: 11px; color: #6c757d; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Pending Credits</div>
                    <div id="pendingCredits" style="font-size: 24px; font-weight: 700; color: #dc3545;">৳0</div>
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;"><span id="creditCustomers">0</span> customers</div>
                </div>
                <div class="card" style="text-align: center; padding: 16px;">
                    <div style="font-size: 11px; color: #6c757d; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Total Orders</div>
                    <div id="totalOrders" style="font-size: 24px; font-weight: 700; color: #2c3e50;">0</div>
                    <div style="font-size: 11px; color: #28a745; margin-top: 4px;">Total: <span id="totalOrdersAmount">৳0</span></div>
                </div>
                <div class="card" style="text-align: center; padding: 16px;">
                    <div style="font-size: 11px; color: #6c757d; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">Customers</div>
                    <div id="totalCustomers" style="font-size: 24px; font-weight: 700; color: #2c3e50;">0</div>
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">Active</div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 16px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 12px;">Quick Actions</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    <button class="btn btn-secondary" onclick="App.navigateTo('ordersPage')" style="padding: 10px; font-size: 13px;">📦 Orders</button>
                    <button class="btn btn-secondary" onclick="App.navigateTo('creditsPage')" style="padding: 10px; font-size: 13px;">💳 Credits</button>
                    <button class="btn btn-secondary" onclick="App.navigateTo('productListingPage')" style="padding: 10px; font-size: 13px;">📝 Products</button>
                    <button class="btn btn-secondary" onclick="App.navigateTo('customerListingPage')" style="padding: 10px; font-size: 13px;">👥 Customers</button>
                </div>
            </div>

            <div class="card" style="margin-bottom: 16px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 12px;">Recent Orders</h3>
                <div id="recentOrdersList" style="max-height: 300px; overflow-y: auto;"></div>
            </div>

            <div class="card">
                <h3 style="font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 12px;">Top Customers</h3>
                <div id="topCustomersList"></div>
            </div>
        `;

        this.updateDate();
    },

    updateDate() {
        const dateEl = document.getElementById('dashboardDate');
        if (!dateEl) return;

        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    },

    async loadDashboardData() {
        try {
            // Load all data with better error handling
            try {
                this.orders = await DB.getAll('orders') || [];
            } catch (error) {
                console.error('Error loading orders:', error);
                this.orders = [];
            }

            try {
                this.credits = await DB.getAll('credits') || [];
            } catch (error) {
                console.error('Error loading credits:', error);
                this.credits = [];
            }

            try {
                this.customers = await DB.getAll('customers') || [];
            } catch (error) {
                console.error('Error loading customers:', error);
                this.customers = [];
            }

            try {
                this.products = await DB.getAll('products') || [];
            } catch (error) {
                console.error('Error loading products:', error);
                this.products = [];
            }

            try {
                this.areas = await DB.getAll('areas') || [];
            } catch (error) {
                console.error('Error loading areas:', error);
                this.areas = [];
            }

            // Update statistics
            this.updateStatistics();
            this.renderRecentOrders();
            this.renderTopCustomers();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            App.showToast('Failed to load dashboard data: ' + error.message, 'error');
        }
    },

    updateStatistics() {
        // Today's orders
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.orders.filter(order => {
            try {
                const dateStr = order.createdAt || order.date;
                if (!dateStr) return false;
                const orderDate = new Date(dateStr).toISOString().split('T')[0];
                return orderDate === today;
            } catch (error) {
                console.warn('Error filtering order date:', error);
                return false;
            }
        });
        
        const todayOrdersCount = todayOrders.length;
        const todayOrdersTotal = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        const todayOrdersEl = document.getElementById('todayOrders');
        const todayOrdersTotalEl = document.getElementById('todayOrdersTotal');
        if (todayOrdersEl) todayOrdersEl.textContent = todayOrdersCount;
        if (todayOrdersTotalEl) todayOrdersTotalEl.textContent = '৳' + Math.round(todayOrdersTotal);

        // Total orders
        const totalOrdersCount = this.orders.length;
        const totalOrdersAmount = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);

        const totalOrdersEl = document.getElementById('totalOrders');
        const totalOrdersAmountEl = document.getElementById('totalOrdersAmount');
        if (totalOrdersEl) totalOrdersEl.textContent = totalOrdersCount;
        if (totalOrdersAmountEl) totalOrdersAmountEl.textContent = '৳' + Math.round(totalOrdersAmount);

        // Pending credits
        const customerCredits = {};
        this.credits.forEach(credit => {
            if (!customerCredits[credit.customerId]) {
                customerCredits[credit.customerId] = {
                    total: 0,
                    paid: 0
                };
            }
            customerCredits[credit.customerId].total += credit.amount || 0;
            customerCredits[credit.customerId].paid += credit.paidAmount || 0;
        });

        let totalPending = 0;
        let customersWithCredit = 0;

        Object.values(customerCredits).forEach(data => {
            const balance = data.total - data.paid;
            if (balance > 0) {
                totalPending += balance;
                customersWithCredit++;
            }
        });

        const pendingCreditsEl = document.getElementById('pendingCredits');
        const creditCustomersEl = document.getElementById('creditCustomers');
        if (pendingCreditsEl) pendingCreditsEl.textContent = '৳' + Math.round(totalPending);
        if (creditCustomersEl) creditCustomersEl.textContent = customersWithCredit;

        // Total customers
        const totalCustomersEl = document.getElementById('totalCustomers');
        if (totalCustomersEl) totalCustomersEl.textContent = this.customers.length;
    },

    renderRecentOrders() {
        try {
            const container = document.getElementById('recentOrdersList');
            if (!container) return;

            // Get last 5 orders
            const recentOrders = [...this.orders]
                .sort((a, b) => {
                    try {
                        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
                    } catch (error) {
                        return 0;
                    }
                })
                .slice(0, 5);

            if (recentOrders.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d; font-size: 13px;">No orders yet</div>';
                return;
            }

            container.innerHTML = '';

            recentOrders.forEach(order => {
                try {
                    const orderDate = order.createdAt || order.date;
                    const displayDate = orderDate ? new Date(orderDate).toLocaleDateString() : 'Unknown';
                    const card = document.createElement('div');
                    card.style.cssText = 'padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px;';
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600; font-size: 13px; color: #1f2937;">${order.customerName || 'Unknown'}</div>
                                <div style="font-size: 11px; color: #6c757d; margin-top: 2px;">${displayDate} • ${(order.items || []).length || 0} items</div>
                                ${order.saveAsCredit ? '<div style="font-size: 10px; color: #dc3545; margin-top: 2px; font-weight: 600;">💳 CREDIT</div>' : ''}
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 14px; font-weight: 700; color: #28a745;">৳${Math.round(order.total || 0)}</div>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                } catch (error) {
                    console.warn('Error rendering order:', error);
                }
            });
        } catch (error) {
            console.error('Error in renderRecentOrders:', error);
        }
    },

    renderTopCustomers() {
        try {
            const container = document.getElementById('topCustomersList');
            if (!container) return;

            // Calculate customer totals
            const customerTotals = {};
            this.orders.forEach(order => {
                if (!customerTotals[order.customerId]) {
                    customerTotals[order.customerId] = {
                        name: order.customerName || 'Unknown',
                        total: 0,
                        orderCount: 0
                    };
                }
                customerTotals[order.customerId].total += order.total || 0;
                customerTotals[order.customerId].orderCount++;
            });

            // Get top 5 customers
            const topCustomers = Object.values(customerTotals)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);

            if (topCustomers.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d; font-size: 13px;">No orders yet</div>';
                return;
            }

            container.innerHTML = '';

            topCustomers.forEach((customer, index) => {
                try {
                    const card = document.createElement('div');
                    card.style.cssText = 'padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px;';
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">${index + 1}</div>
                                <div>
                                    <div style="font-weight: 600; font-size: 13px; color: #1f2937;">${customer.name || 'Unknown'}</div>
                                    <div style="font-size: 11px; color: #6c757d;">${customer.orderCount || 0} orders</div>
                                </div>
                            </div>
                            <div style="font-size: 14px; font-weight: 700; color: #28a745;">৳${Math.round(customer.total || 0)}</div>
                        </div>
                    `;
                    container.appendChild(card);
                } catch (error) {
                    console.warn('Error rendering customer:', error);
                }
            });
        } catch (error) {
            console.error('Error in renderTopCustomers:', error);
        }
    }
};

// Register module
if (window.App) {
    App.registerModule('dashboard', DashboardModule);
}
