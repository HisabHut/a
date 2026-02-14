/**
 * Orders Module - Order Viewing
 */

const OrdersModule = {
    orders: [],
    selectedDate: new Date().toISOString().split('T')[0],
    products: [],
    areas: [],
    customers: [],
    selectedProducts: [],
    pendingDeleteId: null,

    formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    },

    init() {
        this.render();
        this.loadOrders();
        this.loadData();
    },

    async loadData() {
        try {
            this.products = await DB.getAllProducts() || [];
            this.areas = await DB.getAllAreas() || [];
            this.customers = await DB.getAllCustomers() || [];
        } catch (error) {
            console.error('Error loading data:', error);
        }
    },

    render() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card" style="margin-bottom: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);">
                <input type="date" id="dateFilter" value="${this.selectedDate}" style="width: 100%; padding: 14px 16px; border: none; border-radius: 8px; font-size: 15px; color: #1f2937; font-weight: 500; background: white; box-sizing: border-box; transition: all 0.3s ease; cursor: pointer;">
            </div>

            <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6;">
                    <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">Orders</h3>
                    <button id="addOrderBtn" style="width: 44px; height: 44px; border: none; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'">+</button>
                </div>

                <div id="ordersList" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div class="delete-confirm-overlay" id="orderDeleteConfirmModal">
                <div class="delete-confirm-box" role="dialog" aria-modal="true">
                    <div class="delete-confirm-icon">⚠️</div>
                    <div class="delete-confirm-title">Delete this order?</div>
                    <div class="delete-confirm-text">This action cannot be undone. Are you sure you want to delete this order?</div>
                    <div class="delete-confirm-actions">
                        <button class="delete-confirm-btn cancel" id="orderDeleteCancel">Cancel</button>
                        <button class="delete-confirm-btn delete" id="orderDeleteOk">Delete</button>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.renderOrders();
    },

    bindEvents() {
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.renderOrders();
            });
        }

        const addOrderBtn = document.getElementById('addOrderBtn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', async () => await this.showAddOrderModal());
        }

        const orderDeleteCancel = document.getElementById('orderDeleteCancel');
        const orderDeleteOk = document.getElementById('orderDeleteOk');
        if (orderDeleteCancel) {
            orderDeleteCancel.addEventListener('click', () => this.closeDeleteConfirm());
        }
        if (orderDeleteOk) {
            orderDeleteOk.addEventListener('click', () => this.confirmDelete());
        }
    },

    validateDateFormat(dateStr) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(dateStr)) return false;
        const [day, month, year] = dateStr.split('/').map(Number);
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        return true;
    },

    convertToYYYYMMDD(ddmmyyyy) {
        const [day, month, year] = ddmmyyyy.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    },

    async loadOrders() {
        try {
            this.orders = await DB.getAll('orders') || [];
            this.renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    },

    renderOrders() {
        const container = document.getElementById('ordersList');
        if (!container) return;

        const filteredOrders = this.orders.filter(order => {
            const orderDate = (order.createdAt || '').split('T')[0];
            return orderDate === this.selectedDate;
        }).sort((a, b) => {
            // Latest orders first
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        container.innerHTML = '';

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div style="padding: 32px 20px; text-align: center; color: #9ca3af;">
                    <div style="font-size: 13px; color: #6b7280;">No orders found for</div>
                    <div style="font-size: 15px; font-weight: 600; color: #111827; margin-top: 8px;">${this.formatDateDisplay(this.selectedDate)}</div>
                </div>
            `;
            return;
        }

        filteredOrders.forEach((order) => {
            const orderDate = this.formatDateDisplay((order.createdAt || '').split('T')[0]);
            const card = document.createElement('div');
            card.style.cssText = 'padding: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; border-left: 4px solid #667eea; transition: all 0.3s ease; cursor: default;';
            card.onmouseover = () => {
                card.style.background = '#f3f4f6';
                card.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.12)';
            };
            card.onmouseout = () => {
                card.style.background = '#f9fafb';
                card.style.boxShadow = 'none';
            };
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 600; font-size: 14px; color: #111827;">${order.customerName || 'Unknown'}</div>
                        <div style="font-size: 12px; color: #9ca3af; margin-top: 3px;">${order.orderNumber || 'Order #' + order.id}</div>
                    </div>
                    <div style="font-weight: 700; font-size: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">৳${Math.round(order.total || 0)}</div>
                </div>
                <div style="font-size: 12px; color: #6b7280;">${orderDate}</div>
            `;
            this.addSwipeToDelete(card, order.id);
            container.appendChild(card);
        });
    },

    refresh() {
        this.loadOrders();
    },

    async showAddOrderModal() {
        // Ensure data is loaded
        if (this.customers.length === 0 || this.products.length === 0 || this.areas.length === 0) {
            await this.loadData();
        }
        
        this.selectedProducts = [];
        
        const modal = document.createElement('div');
        modal.id = 'addOrderModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 1000;';
        
        modal.innerHTML = `
            <div style="width: 100%; background: white; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">Add Order</h2>
                    <button id="closeModal" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #9ca3af; padding: 0; line-height: 1;">×</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div>
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">Area</label>
                        <select id="areaSelect" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white; color: #6b7280; box-sizing: border-box; cursor: pointer;">
                            <option value="">Select area</option>
                            ${this.areas.map(area => `<option value="${area.name}">${area.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">Customer</label>
                        <select id="customerSelect" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white; color: #6b7280; box-sizing: border-box; cursor: pointer;">
                            <option value="">Select customer</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">Order ID</label>
                    <input type="text" id="orderId" readonly value="ORD-${Date.now()}" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #f9fafb; color: #6b7280; box-sizing: border-box;">
                </div>

                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 12px;">Products</div>
                    
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; font-size: 13px; color: #6b7280; font-weight: 600; margin-bottom: 10px; text-align: center;">
                        <div style="text-align: left;">Product</div>
                        <div style="background: #d1fae5; padding: 4px; border-radius: 4px;">C</div>
                        <div style="background: #ddd6fe; padding: 4px; border-radius: 4px;">P</div>
                        <div>Price</div>
                        <div>Total</div>
                    </div>

                    <div id="productRows"></div>

                    <button id="addProductBtn" style="width: 100%; padding: 12px; margin-top: 12px; border: none; background: #3b82f6; color: white; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        + Add Product
                    </button>
                </div>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Summary</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 16px; font-weight: 700; color: #111827;">Total</div>
                        <div id="orderTotal" style="font-size: 18px; font-weight: 700; color: #111827;">0</div>
                    </div>
                </div>

                <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin-bottom: 16px; display: flex; align-items: start; gap: 8px;">
                    <input type="checkbox" id="saveAsCredit" checked style="margin-top: 2px; width: 18px; height: 18px; cursor: pointer;">
                    <label for="saveAsCredit" style="font-size: 13px; color: #92400e; cursor: pointer; flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 2px;">Save as Customer Credit</div>
                        <div style="font-size: 12px;">Order will be added to customer's credit balance</div>
                    </label>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button type="button" id="cancelBtn" style="flex: 1; padding: 14px; border: 1px solid #d1d5db; background: white; border-radius: 8px; font-size: 15px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.3s ease;">Cancel</button>
                    <button type="button" id="saveBtn" style="flex: 1; padding: 14px; border: none; background: #3b82f6; border-radius: 8px; font-size: 15px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const areaSelect = document.getElementById('areaSelect');
        const customerSelect = document.getElementById('customerSelect');
        
        // Populate customers initially (all customers)
        customerSelect.innerHTML = '<option value="">Select customer</option>' +
            this.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        areaSelect.addEventListener('change', (e) => {
            const selectedArea = e.target.value;
            
            const filteredCustomers = selectedArea ? 
                this.customers.filter(c => c.area === selectedArea) : 
                this.customers;
            
            customerSelect.innerHTML = '<option value="">Select customer</option>' +
                filteredCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        });

        document.getElementById('addProductBtn').addEventListener('click', () => this.addProductRow());

        const closeModal = () => {
            modal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('cancelBtn').addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.getElementById('saveBtn').addEventListener('click', async () => {
            await this.saveOrder();
            closeModal();
        });

        // Add initial product row
        this.addProductRow();

        // Add slide animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `;
        if (!document.querySelector('style[data-orders-modal]')) {
            style.setAttribute('data-orders-modal', '');
            document.head.appendChild(style);
        }
    },

    addProductRow() {
        const container = document.getElementById('productRows');
        const rowId = 'product-' + Date.now();
        
        const row = document.createElement('div');
        row.id = rowId;
        row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px; align-items: center;';
        
        row.innerHTML = `
            <select class="product-select" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: white; color: #374151; box-sizing: border-box;">
                <option value="">Select</option>
                ${this.products.map(p => `<option value="${p.id}" data-price="${p.price}" data-pcs="${p.pcs || 1}">${p.name}</option>`).join('')}
            </select>
            <input type="number" class="product-carton" min="0" value="0" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; text-align: center; box-sizing: border-box;">
            <input type="number" class="product-packet" min="0" value="0" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; text-align: center; box-sizing: border-box;">
            <input type="number" class="product-price" min="0" value="0" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; text-align: center; box-sizing: border-box;">
            <div class="product-total" style="padding: 8px; font-size: 13px; text-align: center; font-weight: 600; color: #111827;">0</div>
        `;
        
        container.appendChild(row);
        
        const select = row.querySelector('.product-select');
        const carton = row.querySelector('.product-carton');
        const packet = row.querySelector('.product-packet');
        const price = row.querySelector('.product-price');
        const total = row.querySelector('.product-total');
        
        const updateTotal = () => {
            const selectedOption = select.options[select.selectedIndex];
            const pricePerPiece = parseFloat(selectedOption.dataset.price) || 0;
            const pcsPerCarton = parseFloat(selectedOption.dataset.pcs) || 1;
            
            // Only auto-fill price if it's currently 0 or when product changes
            if (price.value == 0 || select.dataset.lastSelected !== select.value) {
                price.value = pricePerPiece;
            }
            select.dataset.lastSelected = select.value;
            
            const cartonQty = parseFloat(carton.value) || 0;
            const packetQty = parseFloat(packet.value) || 0;
            const currentPrice = parseFloat(price.value) || 0;
            
            // Correct calculation: (cartons × pcs/carton + packets) × price
            const totalPcs = (cartonQty * pcsPerCarton) + packetQty;
            const totalPrice = totalPcs * currentPrice;
            
            total.textContent = Math.round(totalPrice);
            this.updateOrderTotal();
        };
        
        select.addEventListener('change', updateTotal);
        carton.addEventListener('input', updateTotal);
        packet.addEventListener('input', updateTotal);
        price.addEventListener('input', updateTotal);
    },

    updateOrderTotal() {
        const container = document.getElementById('productRows');
        const totals = Array.from(container.querySelectorAll('.product-total'));
        const sum = totals.reduce((acc, div) => acc + (parseFloat(div.textContent) || 0), 0);
        document.getElementById('orderTotal').textContent = sum.toFixed(0);
    },

    async saveOrder() {
        try {
            const area = document.getElementById('areaSelect').value;
            const customerId = parseInt(document.getElementById('customerSelect').value);
            const customerSelect = document.getElementById('customerSelect');
            const orderNumber = document.getElementById('orderId').value;
            const saveAsCredit = document.getElementById('saveAsCredit').checked;
            
            if (!customerId) {
                alert('Please select a customer');
                return;
            }
            
            // Get customer name from the selected option
            const customerName = customerSelect.options[customerSelect.selectedIndex].text;
            
            const products = [];
            const rows = document.getElementById('productRows').children;
            
            for (const row of rows) {
                const select = row.querySelector('.product-select');
                const productId = select.value;
                if (!productId) continue;
                
                const selectedOption = select.options[select.selectedIndex];
                const pcsPerCarton = parseFloat(selectedOption.dataset.pcs) || 1;
                
                const carton = parseFloat(row.querySelector('.product-carton').value) || 0;
                const packet = parseFloat(row.querySelector('.product-packet').value) || 0;
                const price = parseFloat(row.querySelector('.product-price').value) || 0;
                const total = parseFloat(row.querySelector('.product-total').textContent) || 0;
                
                if (carton > 0 || packet > 0) {
                    products.push({
                        productId,
                        productName: select.options[select.selectedIndex].text,
                        cartons: carton,
                        pcs: packet,
                        price,
                        pcsPerCarton,
                        total,
                        totalPrice: total
                    });
                }
            }
            
            if (products.length === 0) {
                alert('Please add at least one product');
                return;
            }
            
            const totalAmount = parseFloat(document.getElementById('orderTotal').textContent) || 0;
            
            // Don't set id - let the database auto-generate it
            const order = {
                orderNumber,
                customerId,
                customerName: customerName,
                area,
                items: products,
                total: totalAmount,
                saveAsCredit
            };
            
            // DB.add returns the auto-generated ID
            const orderId = await DB.add('orders', order);
            
            if (saveAsCredit) {
                // Add to credits - don't set id, let database auto-generate
                const credit = {
                    customerId,
                    customerName: customerName,
                    amount: totalAmount,
                    paidAmount: 0,
                    paymentHistory: [],
                    type: 'order',
                    orderId: orderId,  // Link to the actual order ID
                    orderNumber: orderNumber,  // Store order number for display
                    date: this.selectedDate
                };
                await DB.add('credits', credit);
            }
            
            await this.loadOrders();
            
            // Close the modal
            const modal = document.getElementById('addOrderModal');
            if (modal) {
                modal.remove();
            }
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save order');
        }
    },

    addSwipeToDelete(card, orderId) {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        let hasMoved = false;

        card.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return;
            const point = e.touches[0];
            startX = point.clientX;
            currentX = startX;
            isSwiping = true;
            hasMoved = false;
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            const point = e.touches[0];
            currentX = point.clientX;
            const diff = startX - currentX;

            if (Math.abs(diff) > 10) {
                hasMoved = true;
            }

            if (diff > 0 && diff < 150) {
                card.style.transform = `translateX(-${diff}px)`;
                card.style.background = `linear-gradient(90deg, #f9fafb ${100 - diff / 2}%, rgba(220,53,69,0.12) 100%)`;
            }
        }, { passive: true });

        card.addEventListener('touchend', () => {
            if (!isSwiping) return;
            const diff = startX - currentX;
            if (hasMoved && diff > 100) {
                this.showDeleteConfirm(orderId);
            }
            card.style.transform = '';
            card.style.background = '';
            isSwiping = false;
            hasMoved = false;
        });
    },

    showDeleteConfirm(orderId) {
        this.pendingDeleteId = orderId;
        const modal = document.getElementById('orderDeleteConfirmModal');
        if (modal) modal.classList.add('show');
    },

    closeDeleteConfirm() {
        const modal = document.getElementById('orderDeleteConfirmModal');
        if (modal) modal.classList.remove('show');
        this.pendingDeleteId = null;
    },

    async confirmDelete() {
        if (!this.pendingDeleteId) return;
        try {
            await DB.delete('orders', this.pendingDeleteId);
            this.closeDeleteConfirm();
            await this.loadOrders();
            if (window.App && window.App.showToast) {
                window.App.showToast('Order deleted', 'success');
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        }
    },

    destroy() {
        this.orders = [];
    }
};

// Register module
if (window.App) {
    App.registerModule('orders', OrdersModule);
}

window.OrdersModule = OrdersModule;
