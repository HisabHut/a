/**
 * Customer Listing Module (Side Nav)
 */

const CustomerListingModule = {
    customers: [],
    areas: [],

    init() {
        this.render();
        this.loadAreas();
        this.loadCustomers();
    },

    render() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 16px;">Customer List</h3>
                <table id="customerTable" style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Name</th>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Mobile</th>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Area</th>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Info</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>

            <!-- Customer Info Modal -->
            <div class="modal" id="customerInfoModal">
                <div class="modal-content" style="width: 90%; max-width: 400px;">
                    <div class="modal-header">
                        <h3 id="customerInfoTitle">Customer Information</h3>
                        <button class="modal-close" onclick="CustomerListingModule.closeInfoModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; color: #495057; margin-bottom: 8px; font-size: 12px;">Company ID</label>
                            <div style="display: flex; align-items: center; background: #f8f9fa; padding: 12px; border-radius: 8px; gap: 8px;">
                                <span id="companyIdDisplay" style="flex: 1; font-family: monospace; font-size: 12px; color: #2c3e50; word-break: break-all;">-</span>
                                <button onclick="CustomerListingModule.copyToClipboard('companyIdDisplay')" style="background: #5B5FED; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; color: #495057; margin-bottom: 8px; font-size: 12px;">Customer ID</label>
                            <div style="display: flex; align-items: center; background: #f8f9fa; padding: 12px; border-radius: 8px; gap: 8px;">
                                <span id="customerIdDisplay" style="flex: 1; font-family: monospace; font-size: 12px; color: #2c3e50; word-break: break-all;">-</span>
                                <button onclick="CustomerListingModule.copyToClipboard('customerIdDisplay')" style="background: #5B5FED; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; color: #495057; margin-bottom: 8px; font-size: 12px;">Customer Login ID</label>
                            <div style="display: flex; align-items: center; background: #f8f9fa; padding: 12px; border-radius: 8px; gap: 8px;">
                                <span id="customerLoginIdDisplay" style="flex: 1; font-family: monospace; font-size: 12px; color: #2c3e50; word-break: break-all;">-</span>
                                <button onclick="CustomerListingModule.copyToClipboard('customerLoginIdDisplay')" style="background: #5B5FED; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; color: #495057; margin-bottom: 8px; font-size: 12px;">Customer Password</label>
                            <div style="display: flex; align-items: center; background: #f8f9fa; padding: 12px; border-radius: 8px; gap: 8px;">
                                <span id="customerPasswordDisplay" style="flex: 1; font-family: monospace; font-size: 12px; color: #2c3e50; word-break: break-all;">-</span>
                                <button onclick="CustomerListingModule.copyToClipboard('customerPasswordDisplay')" style="background: #5B5FED; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="CustomerListingModule.closeInfoModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
    },

    async loadCustomers() {
        try {
            console.log('📥 Loading customers from DB...');
            this.customers = await DB.getAll('customers');
            console.log(`✅ Loaded ${this.customers.length} customers:`, this.customers);
            this.renderTable();
        } catch (error) {
            console.error('❌ Error loading customers:', error);
        }
    },

    async loadAreas() {
        try {
            this.areas = await DB.getAll('areas');
        } catch (error) {
            console.error('❌ Error loading areas:', error);
        }
    },

    renderTable() {
        const tbody = document.querySelector('#customerTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 20px; text-align: center; color: #6c757d;">
                        No customers available
                    </td>
                </tr>
            `;
            return;
        }

        this.customers.forEach((customer) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${customer.name}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${customer.mobile}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${customer.area}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">
                    <button onclick="CustomerListingModule.showInfoModal(${customer.id})" style="background: none; border: none; cursor: pointer; padding: 4px 8px; display: flex; align-items: center; justify-content: center;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #5B5FED;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    showInfoModal(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        // Get Company ID from:
        // 1. localStorage companySession (if set by Admin app sync)
        // 2. OR Firebase Auth current user UID (if user is logged in)
        let companyId = 'N/A';
        
        // Try to get from session first
        const sessionStr = localStorage.getItem('companySession');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                companyId = session.companyId || 'N/A';
            } catch (error) {
                console.error('Error parsing company session:', error);
            }
        }
        
        // If not found in session, try to get from Firebase Auth
        if (!companyId || companyId === 'N/A') {
            try {
                const currentUser = window.firebase?.auth?.currentUser;
                if (currentUser && currentUser.uid) {
                    companyId = currentUser.uid;
                    console.log('📱 Using Firebase Auth UID as Company ID:', companyId);
                }
            } catch (error) {
                console.error('Error getting Firebase Auth user:', error);
            }
        }
        
        document.getElementById('companyIdDisplay').textContent = companyId;
        document.getElementById('customerIdDisplay').textContent = customer.id || 'N/A';
        document.getElementById('customerLoginIdDisplay').textContent = customer.customerId || 'Not available';
        document.getElementById('customerPasswordDisplay').textContent = customer.loginPassword || 'Not available';

        const modal = document.getElementById('customerInfoModal');
        if (modal) {
            modal.classList.add('show');
        }
    },

    closeInfoModal() {
        const modal = document.getElementById('customerInfoModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const text = element.textContent.trim();
        if (!text || text === '-') {
            App.showToast('Nothing to copy', 'warning');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            App.showToast('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            App.showToast('Failed to copy', 'error');
        });
    },

    attachSwipeEvents() {
        // No swipe functionality for read-only view
    },

    refresh() {
        this.loadAreas();
        this.loadCustomers();
    },

    destroy() {
        this.customers = [];
        this.areas = [];
    }
};

// Register module
if (window.App) {
    App.registerModule('customerListing', CustomerListingModule);
}

window.CustomerListingModule = CustomerListingModule;
