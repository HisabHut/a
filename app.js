// SPA Application Core
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Set up navigation
        this.setupNavigation();
        
        // Load initial page
        this.loadPage('dashboard');
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'dashboard';
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

        // Update page title
        const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        document.getElementById('page-title').textContent = pageTitle;

        // Load page content
        const content = this.getPageContent(pageName);
        document.getElementById('content').innerHTML = content;

        // Update URL
        if (pushState) {
            history.pushState({ page: pageName }, '', `#${pageName}`);
        }

        this.currentPage = pageName;
    }

    getPageContent(pageName) {
        const pages = {
            dashboard: this.getDashboardContent(),
            orders: this.getOrdersContent(),
            credits: this.getCreditsContent(),
            products: this.getProductsContent(),
            customers: this.getCustomersContent(),
            history: this.getHistoryContent(),
            settings: this.getSettingsContent()
        };

        return pages[pageName] || pages.dashboard;
    }

    getDashboardContent() {
        return `
            <div class="grid grid-4">
                <div class="stat-card">
                    <div class="stat-value">1,234</div>
                    <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <div class="stat-value">₹45,678</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    <div class="stat-value">567</div>
                    <div class="stat-label">Total Products</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                    <div class="stat-value">890</div>
                    <div class="stat-label">Total Customers</div>
                </div>
            </div>

            <div class="grid grid-2" style="margin-top: 2rem;">
                <div class="card">
                    <div class="card-header">Recent Orders</div>
                    <div class="card-body">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#ORD-001</td>
                                        <td>John Doe</td>
                                        <td>₹1,250</td>
                                        <td><span class="badge badge-success">Completed</span></td>
                                    </tr>
                                    <tr>
                                        <td>#ORD-002</td>
                                        <td>Jane Smith</td>
                                        <td>₹2,340</td>
                                        <td><span class="badge badge-warning">Pending</span></td>
                                    </tr>
                                    <tr>
                                        <td>#ORD-003</td>
                                        <td>Mike Johnson</td>
                                        <td>₹890</td>
                                        <td><span class="badge badge-success">Completed</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Top Products</div>
                    <div class="card-body">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Sales</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Product A</td>
                                        <td>234</td>
                                        <td>₹12,340</td>
                                    </tr>
                                    <tr>
                                        <td>Product B</td>
                                        <td>189</td>
                                        <td>₹9,450</td>
                                    </tr>
                                    <tr>
                                        <td>Product C</td>
                                        <td>156</td>
                                        <td>₹7,800</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getOrdersContent() {
        return `
            <div class="card">
                <div class="card-header">All Orders</div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#ORD-001</td>
                                    <td>John Doe</td>
                                    <td>2026-02-10</td>
                                    <td>₹1,250</td>
                                    <td><span class="badge badge-success">Completed</span></td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#ORD-002</td>
                                    <td>Jane Smith</td>
                                    <td>2026-02-10</td>
                                    <td>₹2,340</td>
                                    <td><span class="badge badge-warning">Pending</span></td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#ORD-003</td>
                                    <td>Mike Johnson</td>
                                    <td>2026-02-09</td>
                                    <td>₹890</td>
                                    <td><span class="badge badge-success">Completed</span></td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#ORD-004</td>
                                    <td>Sarah Williams</td>
                                    <td>2026-02-09</td>
                                    <td>₹1,567</td>
                                    <td><span class="badge badge-danger">Cancelled</span></td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#ORD-005</td>
                                    <td>David Brown</td>
                                    <td>2026-02-08</td>
                                    <td>₹3,200</td>
                                    <td><span class="badge badge-success">Completed</span></td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getCreditsContent() {
        return `
            <div class="grid grid-3">
                <div class="stat-card">
                    <div class="stat-value">₹25,000</div>
                    <div class="stat-label">Available Credits</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <div class="stat-value">₹50,000</div>
                    <div class="stat-label">Total Credits Issued</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    <div class="stat-value">₹25,000</div>
                    <div class="stat-label">Credits Used</div>
                </div>
            </div>

            <div class="card" style="margin-top: 2rem;">
                <div class="card-header">Credit Transactions</div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Customer</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#CR-001</td>
                                    <td>John Doe</td>
                                    <td>Credit Added</td>
                                    <td>+₹5,000</td>
                                    <td>2026-02-10</td>
                                    <td><span class="badge badge-success">Completed</span></td>
                                </tr>
                                <tr>
                                    <td>#CR-002</td>
                                    <td>Jane Smith</td>
                                    <td>Credit Used</td>
                                    <td>-₹2,500</td>
                                    <td>2026-02-09</td>
                                    <td><span class="badge badge-success">Completed</span></td>
                                </tr>
                                <tr>
                                    <td>#CR-003</td>
                                    <td>Mike Johnson</td>
                                    <td>Credit Added</td>
                                    <td>+₹10,000</td>
                                    <td>2026-02-08</td>
                                    <td><span class="badge badge-success">Completed</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getProductsContent() {
        return `
            <div class="card">
                <div class="card-header">Product Listing</div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#PRD-001</td>
                                    <td>Product A</td>
                                    <td>Electronics</td>
                                    <td>₹1,250</td>
                                    <td>45</td>
                                    <td><span class="badge badge-success">Active</span></td>
                                    <td><button class="btn btn-primary">Edit</button></td>
                                </tr>
                                <tr>
                                    <td>#PRD-002</td>
                                    <td>Product B</td>
                                    <td>Clothing</td>
                                    <td>₹850</td>
                                    <td>120</td>
                                    <td><span class="badge badge-success">Active</span></td>
                                    <td><button class="btn btn-primary">Edit</button></td>
                                </tr>
                                <tr>
                                    <td>#PRD-003</td>
                                    <td>Product C</td>
                                    <td>Books</td>
                                    <td>₹450</td>
                                    <td>5</td>
                                    <td><span class="badge badge-warning">Low Stock</span></td>
                                    <td><button class="btn btn-primary">Edit</button></td>
                                </tr>
                                <tr>
                                    <td>#PRD-004</td>
                                    <td>Product D</td>
                                    <td>Home & Garden</td>
                                    <td>₹2,100</td>
                                    <td>0</td>
                                    <td><span class="badge badge-danger">Out of Stock</span></td>
                                    <td><button class="btn btn-primary">Edit</button></td>
                                </tr>
                                <tr>
                                    <td>#PRD-005</td>
                                    <td>Product E</td>
                                    <td>Sports</td>
                                    <td>₹3,500</td>
                                    <td>78</td>
                                    <td><span class="badge badge-success">Active</span></td>
                                    <td><button class="btn btn-primary">Edit</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getCustomersContent() {
        return `
            <div class="card">
                <div class="card-header">Customer Listing</div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#CUST-001</td>
                                    <td>John Doe</td>
                                    <td>john@example.com</td>
                                    <td>+91 98765 43210</td>
                                    <td>15</td>
                                    <td>₹18,750</td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#CUST-002</td>
                                    <td>Jane Smith</td>
                                    <td>jane@example.com</td>
                                    <td>+91 98765 43211</td>
                                    <td>23</td>
                                    <td>₹29,580</td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#CUST-003</td>
                                    <td>Mike Johnson</td>
                                    <td>mike@example.com</td>
                                    <td>+91 98765 43212</td>
                                    <td>8</td>
                                    <td>₹7,120</td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#CUST-004</td>
                                    <td>Sarah Williams</td>
                                    <td>sarah@example.com</td>
                                    <td>+91 98765 43213</td>
                                    <td>31</td>
                                    <td>₹48,620</td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                                <tr>
                                    <td>#CUST-005</td>
                                    <td>David Brown</td>
                                    <td>david@example.com</td>
                                    <td>+91 98765 43214</td>
                                    <td>12</td>
                                    <td>₹15,400</td>
                                    <td><button class="btn btn-primary">View</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getHistoryContent() {
        return `
            <div class="card">
                <div class="card-header">Activity History</div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Activity ID</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>User</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#ACT-001</td>
                                    <td>Order</td>
                                    <td>New order #ORD-001 created</td>
                                    <td>Admin</td>
                                    <td>2026-02-10 14:30</td>
                                    <td><span class="badge badge-success">Success</span></td>
                                </tr>
                                <tr>
                                    <td>#ACT-002</td>
                                    <td>Product</td>
                                    <td>Product #PRD-005 updated</td>
                                    <td>Admin</td>
                                    <td>2026-02-10 13:15</td>
                                    <td><span class="badge badge-success">Success</span></td>
                                </tr>
                                <tr>
                                    <td>#ACT-003</td>
                                    <td>Customer</td>
                                    <td>New customer #CUST-005 registered</td>
                                    <td>System</td>
                                    <td>2026-02-10 11:20</td>
                                    <td><span class="badge badge-success">Success</span></td>
                                </tr>
                                <tr>
                                    <td>#ACT-004</td>
                                    <td>Credit</td>
                                    <td>Credit #CR-003 added to customer</td>
                                    <td>Admin</td>
                                    <td>2026-02-09 16:45</td>
                                    <td><span class="badge badge-success">Success</span></td>
                                </tr>
                                <tr>
                                    <td>#ACT-005</td>
                                    <td>Order</td>
                                    <td>Order #ORD-004 cancelled</td>
                                    <td>Admin</td>
                                    <td>2026-02-09 10:30</td>
                                    <td><span class="badge badge-danger">Cancelled</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsContent() {
        return `
            <div class="grid grid-2">
                <div class="card">
                    <div class="card-header">General Settings</div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Application Name</label>
                            <input type="text" class="form-input" value="HisabHut App" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Time Zone</label>
                            <input type="text" class="form-input" value="Asia/Kolkata" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Currency</label>
                            <input type="text" class="form-input" value="INR (₹)" />
                        </div>
                        <button class="btn btn-primary">Save Changes</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Database Settings</div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Database Host</label>
                            <input type="text" class="form-input" value="localhost" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Database Name</label>
                            <input type="text" class="form-input" value="hisabhut_db" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Sync with Admin App</label>
                            <input type="checkbox" checked /> Enabled
                        </div>
                        <button class="btn btn-primary">Save Changes</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">User Profile</div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-input" value="Admin User" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" value="admin@hisabhut.com" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone</label>
                            <input type="tel" class="form-input" value="+91 98765 43210" />
                        </div>
                        <button class="btn btn-primary">Update Profile</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Notifications</div>
                    <div class="card-body">
                        <div class="form-group">
                            <input type="checkbox" checked /> Email Notifications
                        </div>
                        <div class="form-group">
                            <input type="checkbox" checked /> Order Updates
                        </div>
                        <div class="form-group">
                            <input type="checkbox" /> Low Stock Alerts
                        </div>
                        <div class="form-group">
                            <input type="checkbox" checked /> Customer Messages
                        </div>
                        <button class="btn btn-primary">Save Preferences</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
