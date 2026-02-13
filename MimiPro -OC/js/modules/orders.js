/**
 * Orders Module - Order Viewing and Management
 */

const OrdersModule = {
    orders: [],
    customers: [],
    products: [],
    areas: [],
    selectedDate: new Date().toISOString().split('T')[0],
    orderItems: [],
    editingOrderIndex: -1,

    init() {
        this.render();
        this.loadOrders();
        this.loadCustomers();
        this.loadProducts();
        this.loadAreas();
    },

    render() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #2c3e50; margin: 0;">Orders</h3>
                    <button class="fab" onclick="OrdersModule.openAddModal()" style="position: relative; width: auto; padding: 8px 12px; margin: 0;">
                        + Add Order
                    </button>
                </div>
                
                <div style="margin-bottom: 16px; display: flex; gap: 12px;">
                    <div style="flex: 1;">
                        <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Filter by Date</label>
                        <input type="date" id="dateFilter" value="${this.selectedDate}" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                    </div>
                    <div style="flex: 1;">
                        <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Search by Customer</label>
                        <input type="text" id="orderSearch" placeholder="Type customer name..." style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                    </div>
                    <div style="flex: 1;">
                        <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Filter by Status</label>
                        <select id="statusFilter" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #fff;">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>
                </div>

                <div id="ordersList" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>

            <!-- Add/Edit Order Modal -->
            <div class="modal" id="orderModal">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3 id="orderModalTitle">Add Order</h3>
                        <button class="modal-close" onclick="OrdersModule.closeAddModal()">&times;</button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        <div class="form-group">
                            <label class="form-label">Area</label>
                            <select id="orderArea" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #fff;">
                                <option value="">Select area</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Customer</label>
                            <select id="orderCustomer" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #fff;">
                                <option value="">Select customer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Order ID (Auto-Generated)</label>
                            <input id="orderId" type="text" readonly style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #f8f9fa; cursor: not-allowed;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date</label>
                            <input id="orderDate" type="date" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                        </div>

                        <div style="border-top: 2px solid #e9ecef; padding-top: 16px; margin-top: 16px;">
                            <h4 style="font-size: 13px; font-weight: 600; color: #2c3e50; margin-bottom: 12px;">Add Products</h4>
                            
                            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                                <select id="productSelect" style="flex: 1; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #fff;">
                                    <option value="">Select product</option>
                                </select>
                                <input id="productCartons" type="number" min="0" placeholder="Cartons" style="width: 80px; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                                <input id="productPcs" type="number" min="0" placeholder="Pcs" style="width: 80px; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937;">
                                <button onclick="OrdersModule.addProductToOrder()" class="btn btn-primary" style="padding: 8px 12px; font-size: 12px;">Add</button>
                            </div>

                            <div style="overflow-x: auto; margin-bottom: 12px;">
                                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                                    <thead>
                                        <tr style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
                                            <th style="padding: 8px 4px; text-align: center;">Product</th>
                                            <th style="padding: 8px 4px; text-align: center; width: 50px;">C</th>
                                            <th style="padding: 8px 4px; text-align: center; width: 50px;">P</th>
                                            <th style="padding: 8px 4px; text-align: center; width: 70px;">Price</th>
                                            <th style="padding: 8px 4px; text-align: center; width: 70px;">Total</th>
                                            <th style="padding: 8px 4px; text-align: center; width: 40px;">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody id="orderItemsTable">
                                    </tbody>
                                </table>
                            </div>

                            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #28a745;">
                                    <span>Order Total:</span>
                                    <span id="orderTotal">৳0</span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select id="orderStatus" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; background: #fff;">
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="credit">Credit</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea id="orderNotes" rows="2" style="width: 100%; padding: 8px 10px; border: 1px solid #dbe4f0; border-radius: 6px; font-size: 12px; color: #1f2937; resize: vertical;"></textarea>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="OrdersModule.closeAddModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="OrdersModule.saveOrder()">Save Order</button>
                    </div>
                </div>
            </div>

            <!-- Order Detail Modal -->
            <div class="modal" id="orderDetailModal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3 id="orderDetailTitle">Order Details</h3>
                        <button class="modal-close" onclick="OrdersModule.closeDetailModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="orderDetailContent" style="max-height: 400px; overflow-y: auto;"></div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="OrdersModule.closeDetailModal()">Close</button>
                    </div>
                </div>
            </div>
        `;

        this.populateAreaSelect();
        this.populateProductSelect();
        this.bindEvents();
        this.renderTable();
    },

    bindEvents() {
        const dateFilter = document.getElementById('dateFilter');
        const areaFilter = document.getElementById('orderArea');
        const customerFilter = document.getElementById('orderCustomer');
        const searchInput = document.getElementById('orderSearch');
        const statusFilter = document.getElementById('statusFilter');
        const productSelect = document.getElementById('productSelect');

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.renderTable();
            });
        }

        if (areaFilter) {
            areaFilter.addEventListener('change', () => this.filterCustomersByArea());
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderTable());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.renderTable());
        }

        if (productSelect) {
            productSelect.addEventListener('change', () => this.updateProductPrice());
        }
    },

    populateAreaSelect() {
        const select = document.getElementById('orderArea');
        if (!select) return;

        select.innerHTML = '<option value="">Select area</option>';
        this.areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.name;
            select.appendChild(option);
        });
    },

    populateProductSelect() {
        const select = document.getElementById('productSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Select product</option>';
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            select.appendChild(option);
        });
    },

    filterCustomersByArea() {
        const areaId = document.getElementById('orderArea').value;
        const customerSelect = document.getElementById('orderCustomer');
        
        if (!customerSelect) return;

        customerSelect.innerHTML = '<option value="">Select customer</option>';

        const filteredCustomers = areaId 
            ? this.customers.filter(c => c.area === this.areas.find(a => a.id == areaId)?.name)
            : this.customers;

        filteredCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            customerSelect.appendChild(option);
        });
    },

    updateProductPrice() {
        const productSelect = document.getElementById('productSelect');
        if (!productSelect || !productSelect.value) return;

        const product = this.products.find(p => p.id == productSelect.value);
        // Price will be shown when adding to table
    },

    addProductToOrder() {
        const productId = document.getElementById('productSelect').value;
        const cartons = parseInt(document.getElementById('productCartons').value) || 0;
        const pcs = parseInt(document.getElementById('productPcs').value) || 0;

        if (!productId) {
            App.showToast('Please select a product', 'warning');
            return;
        }

        if (cartons === 0 && pcs === 0) {
            App.showToast('Please enter quantity (Cartons or Pcs)', 'warning');
            return;
        }

        const product = this.products.find(p => p.id == productId);
        const price = product?.price || 0;
        const total = (cartons * price) + (pcs * (price / 12)); // Assuming 12 pieces per carton

        // Check if product already exists in order
        const existingItem = this.orderItems.find(item => item.productId == productId);
        if (existingItem) {
            existingItem.cartons += cartons;
            existingItem.pcs += pcs;
            existingItem.total = (existingItem.cartons * existingItem.price) + (existingItem.pcs * (existingItem.price / 12));
        } else {
            this.orderItems.push({
                productId,
                productName: product?.name,
                cartons,
                pcs,
                price,
                total: Math.round(total)
            });
        }

        // Reset inputs
        document.getElementById('productSelect').value = '';
        document.getElementById('productCartons').value = '';
        document.getElementById('productPcs').value = '';

        this.renderOrderItemsTable();
    },

    renderOrderItemsTable() {
        const tbody = document.getElementById('orderItemsTable');
        if (!tbody) return;

        tbody.innerHTML = '';
        let grandTotal = 0;

        this.orderItems.forEach((item, index) => {
            grandTotal += item.total;
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom: 1px solid #f1f3f5;';
            tr.innerHTML = `
                <td style="padding: 8px 4px; text-align: center;">${item.productName}</td>
                <td style="padding: 8px 4px; text-align: center;">${item.cartons}</td>
                <td style="padding: 8px 4px; text-align: center;">${item.pcs}</td>
                <td style="padding: 8px 4px; text-align: center;">৳${Math.round(item.price)}</td>
                <td style="padding: 8px 4px; text-align: center; font-weight: 600;">৳${Math.round(item.total)}</td>
                <td style="padding: 8px 4px; text-align: center;">
                    <button onclick="OrdersModule.removeProductFromOrder(${index})" style="background: #dc3545; color: white; border: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-size: 12px;">×</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('orderTotal').textContent = '৳' + Math.round(grandTotal);
    },

    removeProductFromOrder(index) {
        this.orderItems.splice(index, 1);
        this.renderOrderItemsTable();
    },

    async loadOrders() {
        try {
            console.log('📥 Loading orders from DB...');
            this.orders = await DB.getAll('orders');
            console.log(`✅ Loaded ${this.orders.length} orders:`, this.orders);
            this.renderTable();
        } catch (error) {
            console.error('❌ Error loading orders:', error);
        }
    },

    async loadCustomers() {
        try {
            this.customers = await DB.getAll('customers');
        } catch (error) {
            console.error('❌ Error loading customers:', error);
        }
    },

    async loadProducts() {
        try {
            this.products = await DB.getAll('products');
        } catch (error) {
            console.error('❌ Error loading products:', error);
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
        const dateFilter = document.getElementById('dateFilter');
        const searchInput = document.getElementById('orderSearch');
        const statusFilter = document.getElementById('statusFilter');
        const selectedDate = dateFilter ? dateFilter.value : this.selectedDate;
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedStatus = statusFilter ? statusFilter.value : '';

        let filteredOrders = this.orders.filter(order => {
            const orderDate = (order.createdAt || order.date || '').split('T')[0];
            const matchesDate = orderDate === selectedDate;
            const matchesSearch = !searchTerm || (order.customerName || '').toLowerCase().includes(searchTerm);
            const matchesStatus = !selectedStatus || order.status === selectedStatus;
            return matchesDate && matchesSearch && matchesStatus;
        });

        const container = document.getElementById('ordersList');
        if (!container) return;

        container.innerHTML = '';

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #6c757d;">
                    No orders found for ${selectedDate}
                </div>
            `;
            return;
        }

        filteredOrders.forEach((order) => {
            const statusBadge = this.getStatusBadge(order.status);
            const orderDate = new Date(order.createdAt || order.date).toLocaleDateString();
            const itemCount = order.items ? order.items.length : 0;

            const card = document.createElement('div');
            card.style.cssText = 'padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #5B5FED; cursor: pointer; transition: all 0.2s;';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 600; font-size: 13px; color: #1f2937;">${order.customerName || 'Unknown'}</div>
                        <div style="font-size: 11px; color: #6c757d; margin-top: 2px;">Order #${order.orderId || order.id}</div>
                    </div>
                    ${statusBadge}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6c757d;">
                    <div>${orderDate} • ${itemCount} items</div>
                    <div style="font-weight: 700; color: #28a745;">৳${Math.round(order.total || 0)}</div>
                </div>
            `;
            card.addEventListener('click', () => this.showDetailModal(order));
            container.appendChild(card);
        });
    },

    getStatusBadge(status) {
        let bgColor = '#e2e8f0';
        let textColor = '#4b5563';
        let text = 'Pending';

        if (status === 'completed') {
            bgColor = '#d1fae5';
            textColor = '#065f46';
            text = 'Completed';
        } else if (status === 'credit') {
            bgColor = '#fce7f3';
            textColor = '#be185d';
            text = 'Credit';
        }

        return `<span style="background: ${bgColor}; color: ${textColor}; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${text}</span>`;
    },

    openAddModal() {
        this.orderItems = [];
        this.editingOrderIndex = -1;

        document.getElementById('orderModalTitle').textContent = 'Add Order';
        document.getElementById('orderArea').value = '';
        document.getElementById('orderCustomer').value = '';
        document.getElementById('orderId').value = window.IdGenerator ? window.IdGenerator.generateOrderId(this.orders.length + 1) : 'ORD-AUTO';
        document.getElementById('orderDate').value = this.selectedDate;
        document.getElementById('orderStatus').value = 'pending';
        document.getElementById('orderNotes').value = '';
        document.getElementById('orderItemsTable').innerHTML = '';
        document.getElementById('orderTotal').textContent = '৳0';

        this.populateProductSelect();
        document.getElementById('orderModal').classList.add('show');
    },

    closeAddModal() {
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.orderItems = [];
    },

    async saveOrder() {
        const customerId = document.getElementById('orderCustomer').value;
        const orderId = document.getElementById('orderId').value;
        const orderDate = document.getElementById('orderDate').value;
        const status = document.getElementById('orderStatus').value;
        const notes = document.getElementById('orderNotes').value;

        if (!customerId) {
            App.showToast('Please select a customer', 'warning');
            return;
        }

        if (this.orderItems.length === 0) {
            App.showToast('Please add at least one product', 'warning');
            return;
        }

        const customer = this.customers.find(c => c.id == customerId);
        const total = this.orderItems.reduce((sum, item) => sum + item.total, 0);
        const itemCount = this.orderItems.reduce((sum, item) => sum + item.cartons + item.pcs, 0);

        const orderData = {
            orderId,
            customerId,
            customerName: customer?.name || '',
            items: this.orderItems,
            total: Math.round(total),
            itemCount,
            status,
            notes,
            createdAt: orderDate ? new Date(orderDate).toISOString() : new Date().toISOString(),
            isCredit: status === 'credit'
        };

        try {
            await DB.add('orders', orderData);
            App.showToast('Order saved successfully', 'success');
            this.closeAddModal();
            await this.loadOrders();
        } catch (error) {
            console.error('Error saving order:', error);
            App.showToast('Failed to save order', 'error');
        }
    },

    showDetailModal(order) {
        const modal = document.getElementById('orderDetailModal');
        if (!modal) return;

        const customer = this.customers.find(c => c.id === order.customerId);
        const orderDate = new Date(order.createdAt || order.date).toLocaleDateString();

        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = `
                <div style="overflow-x: auto; margin-bottom: 16px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
                                <th style="padding: 8px 4px; text-align: center;">Product</th>
                                <th style="padding: 8px 4px; text-align: center;">C</th>
                                <th style="padding: 8px 4px; text-align: center;">P</th>
                                <th style="padding: 8px 4px; text-align: center;">Price</th>
                                <th style="padding: 8px 4px; text-align: center;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr style="border-bottom: 1px solid #f1f3f5;">
                                    <td style="padding: 6px 4px; text-align: center;">${item.productName}</td>
                                    <td style="padding: 6px 4px; text-align: center;">${item.cartons || 0}</td>
                                    <td style="padding: 6px 4px; text-align: center;">${item.pcs || 0}</td>
                                    <td style="padding: 6px 4px; text-align: center;">৳${Math.round(item.price || 0)}</td>
                                    <td style="padding: 6px 4px; text-align: center; font-weight: 600;">৳${Math.round(item.total || 0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        const detailContent = `
            <div style="margin-bottom: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Customer Details</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-size: 12px;">
                    <div style="margin-bottom: 4px;"><span style="color: #6c757d;">Name:</span> <strong>${customer ? customer.name : 'Unknown'}</strong></div>
                    <div style="margin-bottom: 4px;"><span style="color: #6c757d;">Phone:</span> <strong>${customer ? customer.mobile : 'N/A'}</strong></div>
                    <div style="margin-bottom: 4px;"><span style="color: #6c757d;">Area:</span> <strong>${customer ? customer.area : 'N/A'}</strong></div>
                </div>
            </div>

            <div style="margin-bottom: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Order Items</h4>
                ${itemsHtml}
            </div>

            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-top: 2px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                    <span>Total Items:</span>
                    <span>${order.itemCount || 0}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                    <span>Status:</span>
                    <span style="font-weight: 600;">${order.isCredit ? '💳 Credit' : order.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #28a745; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                    <span>Total:</span>
                    <span>৳${Math.round(order.total || 0)}</span>
                </div>
                <div style="font-size: 11px; color: #6c757d; margin-top: 8px; text-align: right;">${orderDate}</div>
                ${order.notes ? `<div style="font-size: 11px; color: #6c757d; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-style: italic;">${order.notes}</div>` : ''}
            </div>
        `;

        document.getElementById('orderDetailContent').innerHTML = detailContent;
        document.getElementById('orderDetailTitle').textContent = `Order #${order.orderId || order.id}`;

        modal.classList.add('show');
    },

    closeDetailModal() {
        const modal = document.getElementById('orderDetailModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    refresh() {
        this.loadOrders();
        this.loadCustomers();
        this.loadProducts();
        this.loadAreas();
    },

    destroy() {
        this.orders = [];
        this.customers = [];
        this.products = [];
        this.areas = [];
        this.orderItems = [];
    },

    getStatusBadge(status) {
        let bgColor = '#e2e8f0';
        let textColor = '#4b5563';
        let text = 'Pending';

        if (status === 'completed') {
            bgColor = '#d1fae5';
            textColor = '#065f46';
            text = 'Completed';
        } else if (status === 'credit') {
            bgColor = '#fce7f3';
            textColor = '#be185d';
            text = 'Credit';
        }

        return `<span style="background: ${bgColor}; color: ${textColor}; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${text}</span>`;
    },

    showDetailModal(order) {
        const modal = document.getElementById('orderDetailModal');
        if (!modal) return;

        const customer = this.customers.find(c => c.id === order.customerId);
        const orderDate = new Date(order.createdAt || order.date).toLocaleDateString();

        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const product = this.products.find(p => p.id === item.productId);
                const productName = product ? product.name : `Product #${item.productId}`;
                itemsHtml += `
                    <div style="padding: 8px; border-bottom: 1px solid #f1f3f5; display: flex; justify-content: space-between;">
                        <div>
                            <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${productName}</div>
                            <div style="font-size: 11px; color: #6c757d;">Qty: ${item.quantity}</div>
                        </div>
                        <div style="text-align: right; font-weight: 600; color: #28a745;">
                            ৳${Math.round((item.price || 0) * (item.quantity || 1))}
                        </div>
                    </div>
                `;
            });
        }

        const detailContent = `
            <div style="margin-bottom: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Customer Details</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-size: 12px;">
                    <div style="margin-bottom: 4px;"><span style="color: #6c757d;">Name:</span> <strong>${customer ? customer.name : 'Unknown'}</strong></div>
                    <div style="margin-bottom: 4px;"><span style="color: #6c757d;">Phone:</span> <strong>${customer ? customer.mobile : 'N/A'}</strong></div>
                    <div style="margin-bottom: 4px;"><span style="color: #6c757d;">Area:</span> <strong>${customer ? customer.area : 'N/A'}</strong></div>
                </div>
            </div>

            <div style="margin-bottom: 16px;">
                <h4 style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Order Details</h4>
                <div style="background: #f8f9fa; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    ${itemsHtml || '<div style="padding: 8px; text-align: center; color: #6c757d;">No items</div>'}
                </div>
            </div>

            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-top: 2px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                    <span>Subtotal:</span>
                    <span>৳${Math.round((order.subtotal || order.total || 0))}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                    <span>Status:</span>
                    <span style="font-weight: 600;">${order.status === 'credit' ? '💳 Credit' : order.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #28a745; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                    <span>Total:</span>
                    <span>৳${Math.round(order.total || 0)}</span>
                </div>
                <div style="font-size: 11px; color: #6c757d; margin-top: 8px; text-align: right;">${orderDate}</div>
            </div>
        `;

        document.getElementById('orderDetailContent').innerHTML = detailContent;
        document.getElementById('orderDetailTitle').textContent = `Order #${order.id}`;

        modal.classList.add('show');
    },

    closeDetailModal() {
        const modal = document.getElementById('orderDetailModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    refresh() {
        this.loadOrders();
        this.loadCustomers();
        this.loadProducts();
        this.loadAreas();
    },

    destroy() {
        this.orders = [];
        this.customers = [];
        this.products = [];
        this.areas = [];
    }
};

// Register module
if (window.App) {
    App.registerModule('orders', OrdersModule);
}

window.OrdersModule = OrdersModule;
