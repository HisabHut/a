/**
 * Credits Module - Customer Credit Management
 */

const CreditsModule = {
    credits: [],
    customers: [],
    areas: [],
    orders: [],
    products: [],
    currentCustomer: null,
    currentView: 'list', // 'list' or 'detail'
    selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format

    init() {
        this.render();
        this.bindEvents();
        this.loadAreas();
        this.loadCustomers();
        this.loadCredits();
        this.loadOrders();
        this.loadProducts();
    },

    render() {
        if (this.currentView === 'detail' && this.currentCustomer) {
            this.renderCustomerDetail();
        } else {
            this.renderList();
        }
        this.bindEvents();
    },

    renderList() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 16px;">Customer Credits</h3>
                
                <div style="margin-bottom: 16px; display: flex; gap: 12px;">
                    <div style="flex: 1;">
                        <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Search by Name</label>
                        <input type="text" id="customerSearch" placeholder="Type customer name..." style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                    </div>
                    <div style="flex: 1;">
                        <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Filter by Area</label>
                        <select id="areaFilter" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #fff;">
                            <option value="">All Areas</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #6c757d;">Total Outstanding</span>
                    <span id="totalCredits" style="font-size: 18px; font-weight: 700; color: #dc3545;">৳0</span>
                </div>

                <div id="creditsList" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>

            <button class="fab" onclick="CreditsModule.openAddModal()">+</button>

            <div class="modal" id="creditModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add Credit</h3>
                        <button class="modal-close" onclick="CreditsModule.closeAddModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Customer</label>
                            <select id="creditCustomer" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #fff;">
                                <option value="">Select customer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Amount</label>
                            <input id="creditAmount" type="number" min="0" step="0.01" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date</label>
                            <input id="creditDate" type="date" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea id="creditNotes" rows="3" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; resize: vertical;"></textarea>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="CreditsModule.closeAddModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="CreditsModule.saveCredit()">Save</button>
                    </div>
                </div>
            </div>

            <div class="modal" id="paymentModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Record Payment</h3>
                        <button class="modal-close" onclick="CreditsModule.closePaymentModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #6c757d; font-size: 12px;">Customer:</span>
                                <span id="paymentCustomerName" style="font-weight: 600; font-size: 12px;"></span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #6c757d; font-size: 12px;">Current Balance:</span>
                                <span id="paymentBalance" style="font-weight: 700; color: #dc3545; font-size: 14px;"></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Payment Amount</label>
                            <input id="paymentAmount" type="number" min="0" step="0.01" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Payment Date</label>
                            <input id="paymentDate" type="date" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="CreditsModule.closePaymentModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="CreditsModule.savePayment()">Save Payment</button>
                    </div>
                </div>
            </div>
        `;

        this.populateAreaFilter();
        this.populateCustomerSelect();
        this.renderCustomers();
    },

    bindEvents() {
        if (this.currentView === 'detail') {
            this.bindCustomerDetailEvents();
            return;
        }

        const customerSelect = document.getElementById('creditCustomer');
        const searchInput = document.getElementById('customerSearch');
        const areaFilter = document.getElementById('areaFilter');

        if (customerSelect) {
            customerSelect.addEventListener('change', () => {
                const customerId = parseInt(customerSelect.value, 10);
                const customer = this.customers.find(c => c.id === customerId);
                // Could show customer details here if needed
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderCustomers());
        }

        if (areaFilter) {
            areaFilter.addEventListener('change', () => this.renderCustomers());
        }
    },

    async loadAreas() {
        try {
            this.areas = await DB.getAllAreas();
            this.populateAreaFilter();
        } catch (error) {
            console.error('Error loading areas:', error);
        }
    },

    populateAreaFilter() {
        const select = document.getElementById('areaFilter');
        if (!select) return;

        // Keep the "All Areas" option
        const currentValue = select.value;
        select.innerHTML = '<option value="">All Areas</option>';

        this.areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.name;
            option.textContent = area.name;
            select.appendChild(option);
        });

        select.value = currentValue;
    },

    async loadCustomers() {
        try {
            this.customers = await DB.getAllCustomers();
            this.populateCustomerSelect();
            this.renderCustomers();
        } catch (error) {
            console.error('Error loading customers:', error);
            App.showToast('Failed to load customers', 'error');
        }
    },

    async loadCredits() {
        try {
            this.credits = await DB.getAllCredits();
            this.renderCustomers();
        } catch (error) {
            console.error('Error loading credits:', error);
            App.showToast('Failed to load credits', 'error');
        }
    },

    async loadOrders() {
        try {
            this.orders = await DB.getAllOrders() || [];
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    },

    async loadProducts() {
        try {
            this.products = await DB.getAllProducts() || [];
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    populateCustomerSelect() {
        const select = document.getElementById('creditCustomer');
        if (!select) return;

        select.innerHTML = '<option value="">Select customer</option>';
        this.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            select.appendChild(option);
        });
    },

    renderCustomers() {
        const searchInput = document.getElementById('customerSearch');
        const areaFilter = document.getElementById('areaFilter');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedArea = areaFilter ? areaFilter.value : '';

        // Filter customers based on search and area
        let filteredCustomers = this.customers.filter(customer => {
            const matchesSearch = !searchTerm || customer.name.toLowerCase().includes(searchTerm);
            const matchesArea = !selectedArea || customer.area === selectedArea;
            return matchesSearch && matchesArea;
        });

        const container = document.getElementById('creditsList');
        if (!container) return;

        // Group credits by customer
        const customerCredits = {};
        this.credits.forEach(credit => {
            if (!customerCredits[credit.customerId]) {
                customerCredits[credit.customerId] = {
                    credits: [],
                    totalCredit: 0,
                    totalPaid: 0
                };
            }
            customerCredits[credit.customerId].credits.push(credit);
            customerCredits[credit.customerId].totalCredit += credit.amount || 0;
            customerCredits[credit.customerId].totalPaid += credit.paidAmount || 0;
        });

        container.innerHTML = '';
        let grandTotal = 0;

        if (filteredCustomers.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d; font-size: 14px;">No customers found</div>';
            return;
        }

        filteredCustomers.forEach(customer => {
            const creditData = customerCredits[customer.id] || { totalCredit: 0, totalPaid: 0, credits: [] };
            const balance = creditData.totalCredit - creditData.totalPaid;

            if (balance > 0) {
                grandTotal += balance;
            }

            const card = document.createElement('div');
            card.style.cssText = 'padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;';
            card.onmouseover = () => card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            card.onmouseout = () => card.style.boxShadow = 'none';
            
            const areaName = customer.area || 'No Area';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 4px;">${customer.name || 'Unknown'}</div>
                        <div style="font-size: 11px; color: #6c757d; margin-bottom: 2px;">📞 ${customer.mobile || 'N/A'}</div>
                        <div style="font-size: 11px; color: #6c757d; margin-bottom: 4px;">📍 ${areaName}</div>
                        <div style="font-size: 10px; color: #6c757d;">${creditData.credits.length} transaction(s) | Paid: ৳${Math.round(creditData.totalPaid)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 16px; font-weight: 700; color: ${balance > 0 ? '#dc3545' : '#28a745'}; margin-bottom: 4px;">৳${Math.round(balance)}</div>
                        ${balance > 0 ? `<button onclick="event.stopPropagation(); CreditsModule.openPaymentModal(${customer.id}, ${balance})" 
                                class="btn btn-primary btn-small" 
                                style="padding: 4px 12px; font-size: 11px;">Pay</button>` : '<span style="font-size: 10px; color: #28a745; font-weight: 600;">✓ Paid</span>'}
                    </div>
                </div>
            `;

            card.onclick = () => {
                this.currentCustomer = customer;
                this.currentView = 'detail';
                this.selectedMonth = new Date().toISOString().slice(0, 7);
                this.render();
            };
            container.appendChild(card);
        });

        const totalEl = document.getElementById('totalCredits');
        if (totalEl) totalEl.textContent = '৳' + Math.round(grandTotal);
    },

    renderCustomerDetail() {
        const content = document.getElementById('pageContent');
        if (!content || !this.currentCustomer) return;

        const customer = this.currentCustomer;
        const areaName = customer.area || 'No Area';

        // Calculate total outstanding balance (all months, not filtered)
        const customerCredits = this.credits.filter(c => c.customerId === customer.id);
        const totalCredit = customerCredits.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = customerCredits.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
        const totalBalance = totalCredit - totalPaid;

        content.innerHTML = `
            <div class="card">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <button onclick="CreditsModule.backToList()" style="padding: 8px 12px; background: #f8f9fa; border: 1px solid #dbe4f0; border-radius: 6px; cursor: pointer; font-weight: 600; color: #1f2937;">← Back</button>
                    <div style="font-size: 14px; font-weight: 600; color: #1f2937;">Customer Details</div>
                    <div style="width: 60px;"></div>
                </div>

                <div style="text-align: center; margin-bottom: 16px; padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);">
                    <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px;">${customer.name || 'Unknown'}</div>
                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">${customer.loginId || customer.customerId || 'N/A'}</div>
                    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; text-align: left;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
                            <div style="font-size: 10px; color: #6c757d; margin-bottom: 2px;">Area</div>
                            <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${areaName}</div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
                            <div style="font-size: 10px; color: #6c757d; margin-bottom: 2px;">Mobile</div>
                            <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${customer.mobile || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px; text-align: center;">
                    <label class="form-label" style="font-size: 12px; margin-bottom: 6px; color: #6c757d; display: block;">Filter by Month/Year</label>
                    <input type="month" id="monthFilter" value="${this.selectedMonth}" style="width: 70%; min-width: 180px; max-width: 260px; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 8px; font-size: 12px; color: #1f2937; background: #ffffff;">
                </div>

                <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #6c757d;">Total Outstanding (All Time)</span>
                    <span style="font-size: 18px; font-weight: 700; color: #dc3545;">৳${Math.round(totalBalance)}</span>
                </div>

                <h4 style="font-size: 14px; margin-bottom: 12px; color: #1f2937;">Credits for Selected Month</h4>
                <div id="monthCreditsList" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>

            <div class="modal" id="creditDetailModal">
                <div class="modal-content" style="max-width: 520px;">
                    <div class="modal-header">
                        <h3>Credit Details</h3>
                        <button class="modal-close" onclick="CreditsModule.closeCreditDetailModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="detailHeader" style="text-align: center; margin-bottom: 16px;"></div>

                        <div style="font-size: 13px; color: #1f2937; font-weight: 600; margin-bottom: 8px;">Products</div>
                        <div id="detailProducts" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 16px;"></div>

                        <div id="detailSummary" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 16px;"></div>

                        <div style="font-size: 13px; color: #1f2937; font-weight: 600; margin-bottom: 8px;">Credit History</div>
                        <div id="detailHistory" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 16px;"></div>

                        <div id="detailFooter" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #6c757d;"></div>
                    </div>
                </div>
            </div>
        `;
    },

    viewCustomerCredits(customer, creditData) {
        const balance = creditData.totalCredit - creditData.totalPaid;
        const areaName = customer.area || 'No Area';

        let detailsHtml = `
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; font-size: 16px;">${customer.name || 'Unknown'}</h4>
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">📞 Phone: ${customer.mobile || 'N/A'}</div>
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">📍 Area: ${areaName}</div>
                <div style="font-size: 14px; font-weight: 600; color: #dc3545; margin-top: 8px;">Outstanding: ৳${Math.round(balance)}</div>
            </div>
            <h4 style="font-size: 14px; margin-bottom: 12px;">Credit History</h4>
        `;

        creditData.credits.forEach(credit => {
            const creditBalance = (credit.amount || 0) - (credit.paidAmount || 0);
            detailsHtml += `
                <div style="padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6c757d;">${credit.date || ''}</span>
                        <span style="font-size: 14px; font-weight: 600; color: ${creditBalance > 0 ? '#dc3545' : '#28a745'};">৳${Math.round(credit.amount || 0)}</span>
                    </div>
                    ${credit.notes ? `<div style="font-size: 11px; color: #6c757d; margin-top: 4px;">${credit.notes}</div>` : ''}
                    ${credit.paidAmount > 0 ? `<div style="font-size: 11px; color: #28a745; margin-top: 4px;">Paid: ৳${Math.round(credit.paidAmount)}</div>` : ''}
                </div>
            `;
        });

        App.showToast(`
            <div style="max-width: 400px;">
                ${detailsHtml}
            </div>
        `, 'info', 5000);
    },

    bindCustomerDetailEvents() {
        const monthFilter = document.getElementById('monthFilter');
        if (monthFilter) {
            monthFilter.addEventListener('change', (e) => {
                this.selectedMonth = e.target.value;
                this.renderCustomerCredits();
            });
        }

        // Initial rendering
        this.renderCustomerCredits();
    },

    renderCustomerCredits() {
        if (!this.currentCustomer) return;

        // Filter credits by selected month
        const monthCredits = this.credits.filter(c => {
            if (c.customerId !== this.currentCustomer.id) return false;
            if (!c.date) return false;
            return c.date.startsWith(this.selectedMonth);
        });

        const container = document.getElementById('monthCreditsList');
        if (!container) return;

        container.innerHTML = '';

        if (monthCredits.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">No credits in this month</div>';
            return;
        }

        monthCredits.forEach((credit, index) => {
            const creditBalance = (credit.amount || 0) - (credit.paidAmount || 0);
            const card = document.createElement('div');
            card.style.cssText = 'padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;';
            card.onmouseover = () => card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            card.onmouseout = () => card.style.boxShadow = 'none';

            const notesOrOrder = credit.orderNumber 
                ? `<div style="font-size: 11px; color: #667eea; font-weight: 600;">Order: ${credit.orderNumber}</div>` 
                : (credit.notes ? `<div style="font-size: 11px; color: #6c757d;">${credit.notes}</div>` : '');

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">📅 ${credit.date || ''}</div>
                        ${notesOrOrder}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 4px;">৳${Math.round(credit.amount || 0)}</div>
                        <div style="font-size: 11px; color: ${creditBalance > 0 ? '#dc3545' : '#28a745'};">Balance: ৳${Math.round(creditBalance)}</div>
                    </div>
                </div>
            `;

            card.onclick = () => this.openCreditDetailModal(credit);
            container.appendChild(card);
        });
    },

    openCreditDetailModal(credit) {
        const modal = document.getElementById('creditDetailModal');
        if (!modal) return;

        const customer = this.customers.find(c => c.id === credit.customerId);
        const customerName = customer?.name || 'Unknown';
        const areaName = customer?.area || 'No Area';
        const mobile = customer?.mobile || 'N/A';

        const orderId = credit.orderId || null;
        const order = orderId ? this.orders.find(o => o.id === orderId) : null;

        let productsHtml = '';
        if (order && order.items && order.items.length > 0) {
            const rowsHtml = order.items.map(item => {
                const product = this.products.find(p => p.id === item.productId);
                const productName = item.productName || product?.name || `Product ${item.productId}`;
                const cartons = Math.round(item.cartons || 0);
                const pcs = Math.round(item.pcs || 0);
                const price = Math.round(item.price || 0);
                const total = Math.round(item.total || item.totalPrice || 0);
                return `
                    <tr>
                        <td class="col-product" style="padding: 6px 4px; text-align: center;">${productName}</td>
                        <td class="col-dc col-green" style="padding: 6px 4px; text-align: center;">${cartons}</td>
                        <td class="col-dp col-green" style="padding: 6px 4px; text-align: center;">${pcs}</td>
                        <td class="col-price" style="padding: 6px 4px; text-align: center;">${price}</td>
                        <td class="col-total" style="padding: 6px 4px; text-align: center; font-weight: 600;">${total}</td>
                    </tr>
                `;
            }).join('');

            productsHtml = `
                <div style="overflow-x: auto;">
                    <table class="table delivery-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="col-product">Product</th>
                                <th class="col-dc col-green">C</th>
                                <th class="col-dp col-green">P</th>
                                <th class="col-price">Price</th>
                                <th class="col-total">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            productsHtml = '<div style="padding: 10px 12px; font-size: 12px; color: #6c757d;">No products found</div>';
        }

        const history = Array.isArray(credit.paymentHistory) ? credit.paymentHistory : [];
        const sortedHistory = history
            .slice()
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        const historyTotal = sortedHistory.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        const totalPaid = credit.paidAmount || historyTotal;
        const creditAmount = credit.amount || 0;
        const balance = creditAmount - totalPaid;

        const headerHtml = `
            <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 2px;">${customerName}, ${areaName}</div>
            <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">${mobile}</div>
            <div style="font-size: 12px; color: #6c757d;">${credit.date || ''}</div>
        `;

        const summaryHtml = `
            <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
                <span style="color: #6c757d;">Initial Amount</span>
                <span style="font-weight: 600; color: #1f2937;">৳${Math.round(creditAmount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
                <span style="color: #6c757d;">Paid Amount</span>
                <span style="font-weight: 600; color: #1f2937;">৳${Math.round(totalPaid)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 12px; font-size: 12px;">
                <span style="color: #6c757d;">Remaining Amount</span>
                <span style="font-weight: 700; color: ${balance > 0 ? '#dc3545' : '#28a745'};">৳${Math.round(balance)}</span>
            </div>
        `;

        const historyHtml = sortedHistory.length > 0
            ? sortedHistory.map(entry => `
                <div style="display: flex; justify-content: space-between; padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #6c757d;">${entry.date || ''}</span>
                    <span style="font-weight: 600; color: #1f2937;">৳${Math.round(entry.amount || 0)}</span>
                </div>
            `).join('')
            : '<div style="padding: 10px 12px; font-size: 12px; color: #6c757d;">No payment history recorded</div>';

        const lastPayment = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1] : null;
        const lastPaymentDate = lastPayment?.date || '';
        const footerHtml = `
            <span>Paid: ৳${Math.round(totalPaid)}</span>
            <span>Date: ${lastPaymentDate || 'N/A'}</span>
        `;

        document.getElementById('detailHeader').innerHTML = headerHtml;
        document.getElementById('detailProducts').innerHTML = productsHtml;
        document.getElementById('detailSummary').innerHTML = summaryHtml;
        document.getElementById('detailHistory').innerHTML = historyHtml;
        document.getElementById('detailFooter').innerHTML = footerHtml;

        modal.classList.add('show');
    },

    closeCreditDetailModal() {
        const modal = document.getElementById('creditDetailModal');
        if (modal) modal.classList.remove('show');
    },

    backToList() {
        this.currentCustomer = null;
        this.currentView = 'list';
        this.render();
    },

    openAddModal() {
        const modal = document.getElementById('creditModal');
        if (!modal) return;

        const fab = document.querySelector('.fab');
        if (fab) fab.style.display = 'none';

        // Set default date to today
        const dateInput = document.getElementById('creditDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

        // Clear form
        document.getElementById('creditCustomer').value = '';
        document.getElementById('creditAmount').value = '';
        document.getElementById('creditNotes').value = '';

        modal.classList.add('show');
    },

    closeAddModal() {
        const modal = document.getElementById('creditModal');
        if (modal) modal.classList.remove('show');

        const fab = document.querySelector('.fab');
        if (fab) fab.style.display = '';
    },

    async saveCredit() {
        const customerId = parseInt(document.getElementById('creditCustomer').value, 10);
        const amount = parseFloat(document.getElementById('creditAmount').value || '0');
        const date = document.getElementById('creditDate').value;
        const notes = document.getElementById('creditNotes').value.trim();

        if (!customerId) {
            App.showToast('Please select a customer', 'warning');
            return;
        }

        if (amount <= 0) {
            App.showToast('Please enter a valid amount', 'warning');
            return;
        }

        if (!date) {
            App.showToast('Please select a date', 'warning');
            return;
        }

        const customer = this.customers.find(c => c.id === customerId);

        const credit = {
            customerId,
            customerName: customer?.name || '',
            amount,
            paidAmount: 0,
            paymentHistory: [],
            date,
            notes,
            timestamp: Date.now()
        };

        try {
            await DB.addCredit(credit);
            App.showToast('Credit added successfully', 'success');
            this.closeAddModal();
            await this.loadCredits();
        } catch (error) {
            console.error('Error saving credit:', error);
            App.showToast('Failed to save credit', 'error');
        }
    },

    openPaymentModal(customerId, balance) {
        const modal = document.getElementById('paymentModal');
        if (!modal) return;

        const fab = document.querySelector('.fab');
        if (fab) fab.style.display = 'none';

        const customer = this.customers.find(c => c.id === customerId);
        
        document.getElementById('paymentCustomerName').textContent = customer?.name || '';
        document.getElementById('paymentBalance').textContent = '৳' + Math.round(balance);
        document.getElementById('paymentAmount').value = '';
        document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];

        modal.dataset.customerId = customerId;
        modal.classList.add('show');
    },

    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) modal.classList.remove('show');

        const fab = document.querySelector('.fab');
        if (fab) fab.style.display = '';
    },

    async savePayment() {
        const modal = document.getElementById('paymentModal');
        const customerId = parseInt(modal.dataset.customerId, 10);
        const paymentAmount = parseFloat(document.getElementById('paymentAmount').value || '0');
        const paymentDate = document.getElementById('paymentDate').value;

        if (paymentAmount <= 0) {
            App.showToast('Please enter a valid payment amount', 'warning');
            return;
        }

        if (!paymentDate) {
            App.showToast('Please select a payment date', 'warning');
            return;
        }

        try {
            // Find all unpaid credits for this customer and apply payment
            const customerCredits = this.credits.filter(c => c.customerId === customerId);
            let remainingPayment = paymentAmount;

            for (const credit of customerCredits) {
                if (remainingPayment <= 0) break;

                const creditBalance = (credit.amount || 0) - (credit.paidAmount || 0);
                if (creditBalance <= 0) continue;

                const paymentToApply = Math.min(remainingPayment, creditBalance);
                credit.paidAmount = (credit.paidAmount || 0) + paymentToApply;
                if (!Array.isArray(credit.paymentHistory)) credit.paymentHistory = [];
                credit.paymentHistory.push({ amount: paymentToApply, date: paymentDate, timestamp: Date.now() });
                remainingPayment -= paymentToApply;

                await DB.updateCredit(credit);
            }

            App.showToast('Payment recorded successfully', 'success');
            this.closePaymentModal();
            await this.loadCredits();
        } catch (error) {
            console.error('Error saving payment:', error);
            App.showToast('Failed to record payment', 'error');
        }
    }
};

// Register module
if (window.App) {
    App.registerModule('credits', CreditsModule);
}
