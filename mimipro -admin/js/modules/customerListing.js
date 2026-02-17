/**
 * Customer Listing Module (Side Nav)
 */

const CustomerListingModule = {
    customers: [],
    areas: [],
    editIndex: -1,
    pendingDeleteId: null,

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
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Edit</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>

            <button class="fab" onclick="CustomerListingModule.openModal()">+</button>

            <!-- Customer Modal -->
            <div class="modal" id="customerModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="customerModalTitle">Add Customer</h3>
                        <button class="modal-close" onclick="CustomerListingModule.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Customer Name</label>
                            <input id="customerName" type="text" placeholder="Enter customer name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mobile Number</label>
                            <input id="customerMobile" type="tel" placeholder="01XXXXXXXXX">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Area</label>
                            <select id="customerArea" style="width: 100%; padding: 12px; border: 1px solid #e1e8ed; border-radius: 8px; font-size: 14px; color: #2c3e50; background: white;">
                                <option value="">Select area</option>
                            </select>
                        </div>
                        <div style="border-top: 2px solid #e9ecef; padding-top: 16px; margin-top: 16px;">
                            <h4 style="font-size: 13px; font-weight: 600; color: #2c3e50; margin-bottom: 12px;">Login Credentials</h4>
                            <div class="form-group">
                                <label class="form-label">Customer ID</label>
                                <input id="customerId" type="text" placeholder="Auto-generated" readonly style="background: #f8f9fa; cursor: not-allowed;">
                                <small style="color: #6c757d; font-size: 11px;">Auto-generated • Customer uses this to login</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Login Password</label>
                                <input id="customerPassword" type="text" placeholder="Enter password for customer" style="width: 100%; padding: 12px; border: 1px solid #e1e8ed; border-radius: 8px; font-size: 14px; color: #2c3e50; background: white;">
                                <small style="color: #6c757d; font-size: 11px;">Admin-provided password • Customer uses this to login</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="CustomerListingModule.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="CustomerListingModule.saveCustomer()">Save</button>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Popup -->
            <div class="delete-confirm-overlay" id="customerDeleteConfirmModal">
                <div class="delete-confirm-box" role="dialog" aria-modal="true">
                    <div class="delete-confirm-icon">⚠️</div>
                    <div class="delete-confirm-title">Delete this customer?</div>
                    <div class="delete-confirm-text">This action cannot be undone. Are you sure you want to delete this customer?</div>
                    <div class="delete-confirm-actions">
                        <button class="delete-confirm-btn cancel" onclick="CustomerListingModule.closeDeleteConfirm()">Cancel</button>
                        <button class="delete-confirm-btn delete" onclick="CustomerListingModule.confirmDelete()">Delete</button>
                    </div>
                </div>
            </div>
        `;

        this.attachSwipeEvents();
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
            this.populateAreaSelect();
        } catch (error) {
            console.error('❌ Error loading areas:', error);
        }
    },

    populateAreaSelect() {
        const areaSelect = document.getElementById('customerArea');
        if (!areaSelect) return;

        const currentValue = areaSelect.value;
        areaSelect.innerHTML = '<option value="">Select area</option>';

        this.areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.name;
            option.textContent = area.name;
            areaSelect.appendChild(option);
        });

        areaSelect.value = currentValue;
    },

    renderTable() {
        const tbody = document.querySelector('#customerTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 20px; text-align: center; color: #6c757d;">
                        No customers added yet. Click + to add one.
                    </td>
                </tr>
            `;
            return;
        }

        this.customers.forEach((customer, i) => {
            const tr = document.createElement('tr');
            tr.style.cssText = 'touch-action: pan-y; transition: transform 0.2s;';
            tr.innerHTML = `
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${customer.name}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${customer.mobile}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${customer.area}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">
                    <button class="btn btn-primary btn-small" onclick="CustomerListingModule.editCustomer(${i})" style="background: #5B5FED; color: #fff; padding: 6px 12px; font-size: 12px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                        Edit
                    </button>
                </td>
            `;

            this.addSwipeToDelete(tr, customer.id);
            tbody.appendChild(tr);
        });
    },

    openModal() {
        const modal = document.getElementById('customerModal');
        if (!modal) return;

        document.getElementById('customerModalTitle').textContent = 'Add Customer';
        document.getElementById('customerName').value = '';
        document.getElementById('customerMobile').value = '';
        this.populateAreaSelect();
        document.getElementById('customerArea').value = '';
        this.editIndex = -1;

        // Auto-generate Customer ID only (password entered by admin)
        const sequenceNumber = this.customers.length + 1;
        const generatedCustomerId = window.IdGenerator.generateCustomerId(sequenceNumber);

        document.getElementById('customerId').value = generatedCustomerId;
        document.getElementById('customerPassword').value = ''; // Leave blank for admin to enter

        console.log('🆔 Pre-generated Customer ID:', generatedCustomerId);
        console.log('🔐 Password field: Ready for admin input');

        modal.classList.add('show');
    },

    closeModal() {
        const modal = document.getElementById('customerModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    editCustomer(index) {
        this.editIndex = index;
        const customer = this.customers[index];

        document.getElementById('customerModalTitle').textContent = 'Edit Customer';
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerMobile').value = customer.mobile;
        document.getElementById('customerId').value = customer.customerId || 'N/A';
        document.getElementById('customerPassword').value = ''; // Leave blank so admin can generate new if needed
        this.populateAreaSelect();
        document.getElementById('customerArea').value = customer.area;

        document.getElementById('customerModal').classList.add('show');
    },

    async saveCustomer() {
        console.log('💾 Save customer clicked');
        const name = document.getElementById('customerName').value.trim();
        const mobile = document.getElementById('customerMobile').value.trim();
        const area = document.getElementById('customerArea').value;
        const password = document.getElementById('customerPassword').value.trim();

        console.log('📝 Customer data:', { name, mobile, area });

        if (!name || !mobile || !area || !password) {
            console.warn('⚠️ Validation failed');
            App.showToast('Please fill all fields including password', 'warning');
            return;
        }

        try {
            // Get current user ID from Firebase Auth
            let userId;
            if (window.FirebaseAuth && window.FirebaseAuth.currentUser) {
                userId = window.FirebaseAuth.currentUser.uid;
            } else if (window.FirebaseSync && window.FirebaseSync.currentUser) {
                userId = window.FirebaseSync.currentUser.uid;
            } else {
                const localUserId = localStorage.getItem('localUserId');
                if (localUserId) {
                    userId = localUserId;
                } else {
                    userId = 'local_' + Date.now();
                    localStorage.setItem('localUserId', userId);
                }
            }

            let customerId, plainPassword, passwordHash;

            if (this.editIndex === -1) {
                // NEW CUSTOMER: Auto-generate ID, Admin provides password
                const sequenceNumber = this.customers.length + 1;
                customerId = window.IdGenerator.generateCustomerId(sequenceNumber);
                plainPassword = password; // Use admin-provided password (NOT auto-generated)

                console.log('➕ Adding new customer to DB...');
                console.log('🆔 Generated Customer ID:', customerId);
                console.log('🔐 Admin-provided Password:', plainPassword);

                // Hash password for storage (SHA-256)
                passwordHash = await this.hashPassword(plainPassword);
                console.log('🔒 Password hashed for storage');

                const customerData = {
                    userId: userId,
                    customerId: customerId,
                    name: name,
                    mobile: mobile,
                    phone: mobile,
                    area: area,
                    passwordHash: passwordHash,  // Store hash, not plain password
                    status: 'active',
                    active: true,
                    createdAt: new Date().toISOString()
                };

                const id = await DB.add('customers', customerData);
                console.log('✅ Customer added with ID:', id);
                
                // Show credentials to admin (plain password shown only once)
                const companyId = userId.substring(0, 8).toUpperCase();
                App.showToast(
                    `✅ Customer Added!\n\nCompany ID: ${companyId}\nCustomer ID: ${customerId}\nPassword: ${plainPassword}\n\n👉 Give these credentials to the customer.`,
                    'success',
                    10000
                );
            } else {
                // EDIT EXISTING: Keep existing ID, allow password change
                const existingCustomer = this.customers[this.editIndex];
                const enteredPassword = document.getElementById('customerPassword').value.trim();

                customerId = existingCustomer.customerId;
                
                if (enteredPassword) {
                    plainPassword = enteredPassword;
                    passwordHash = await this.hashPassword(plainPassword);
                    console.log('🔐 Password updated and hashed');
                } else {
                    // Keep existing password hash
                    passwordHash = existingCustomer.passwordHash;
                    console.log('⏭️ Keeping existing password hash');
                }

                const customerData = {
                    id: existingCustomer.id,
                    userId: userId,
                    customerId: customerId,
                    name: name,
                    mobile: mobile,
                    phone: mobile,
                    area: area,
                    passwordHash: passwordHash,
                    status: 'active',
                    active: true,
                    updatedAt: new Date().toISOString()
                };

                console.log('✏️ Updating customer with ID:', customerData.id);
                await DB.update('customers', customerData);
                console.log('✅ Customer updated');
                App.showToast('Customer updated successfully', 'success');
            }

            this.closeModal();
            console.log('🔄 Reloading customers...');
            await this.loadCustomers();
            console.log('✅ Customers reloaded');
        } catch (error) {
            console.error('❌ Error saving customer:', error);
            App.showToast('Error saving customer: ' + error.message, 'error');
        }
    },

    // Hash password using SHA-256 (same as employee app)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    addSwipeToDelete(row, customerId) {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        let hasMoved = false;

        row.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            const point = e.touches[0];
            startX = point.clientX;
            currentX = startX;
            isSwiping = true;
            hasMoved = false;
        }, { passive: false });

        row.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            const point = e.touches[0];
            currentX = point.clientX;
            const diff = startX - currentX;

            if (Math.abs(diff) > 10) {
                hasMoved = true;
                e.preventDefault();
            }

            if (diff > 0 && diff < 150) {
                row.style.transform = `translateX(-${diff}px)`;
                row.style.background = `linear-gradient(90deg, transparent ${100 - diff / 2}%, rgba(220,53,69,0.1) 100%)`;
            }
        }, { passive: false });

        row.addEventListener('touchend', () => {
            if (!isSwiping) return;
            const diff = startX - currentX;

            if (hasMoved && diff > 100) {
                this.showDeleteConfirm(customerId);
                row.style.transform = '';
                row.style.background = '';
            } else {
                row.style.transform = '';
                row.style.background = '';
            }

            isSwiping = false;
            hasMoved = false;
        });
    },

    attachSwipeEvents() {
        // Will be called after table render
    },

    showDeleteConfirm(customerId) {
        this.pendingDeleteId = customerId;
        const modal = document.getElementById('customerDeleteConfirmModal');
        if (modal) {
            modal.classList.add('show');
        }
    },

    closeDeleteConfirm() {
        const modal = document.getElementById('customerDeleteConfirmModal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.pendingDeleteId = null;
    },

    async confirmDelete() {
        if (!this.pendingDeleteId) return;

        try {
            await DB.delete('customers', this.pendingDeleteId);
            App.showToast('Customer deleted', 'success');
            this.closeDeleteConfirm();
            await this.loadCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            App.showToast('Error deleting customer', 'error');
        }
    },

    refresh() {
        this.loadAreas();
        this.loadCustomers();
    },

    destroy() {
        this.customers = [];
        this.areas = [];
        this.editIndex = -1;
        this.pendingDeleteId = null;
    }
};

// Register module
if (window.App) {
    App.registerModule('customerListing', CustomerListingModule);
}

window.CustomerListingModule = CustomerListingModule;
