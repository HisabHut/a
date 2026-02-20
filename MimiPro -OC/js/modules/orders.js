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
                    <div style="display: flex; gap: 8px; align-items: center;">

                            <button id="summaryBtn" style="width: 44px; height: 44px; border: none; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'" title="View Summary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                        </button>
                        <!-- all-print button next to add/summary -->
                        <button id="allPrintBtn" style="width: 44px; height: 44px; border: none; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'" title="Print All">
                            🖨
                        </button>
                        <button id="addOrderBtn" style="width: 44px; height: 44px; border: none; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'">+</button>
                    </div>
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

        const summaryBtn = document.getElementById('summaryBtn');
        if (summaryBtn) {
            summaryBtn.addEventListener('click', () => this.showSummaryModal());
        }

        const allPrintBtn = document.getElementById('allPrintBtn');
        if (allPrintBtn) {
            allPrintBtn.addEventListener('click', () => this.openPrintAll());
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

    // opens a single print page containing every order for the selected date
    openPrintAll() {
        const filtered = this.orders.filter(o => (o.createdAt||'').split('T')[0] === this.selectedDate);
        if (filtered.length === 0) {
            if (window.App && window.App.showToast) window.App.showToast('No orders to print', 'info');
            return;
        }
        // gather seller info and then send to print-all.html
        const sendPayload = (info) => {
            // attach customer mobiles where available
            const ordersWithPhones = filtered.map(order => {
                const o = Object.assign({}, order);
                const cust = this.customers.find(c => c.id === order.customerId);
                if (cust && cust.mobile) o.customerMobile = cust.mobile;
                return o;
            });
            const payload = {
                date: this.selectedDate,
                orders: ordersWithPhones,
                sellerName: info.sellerName || '',
                sellerPhone: info.sellerPhone || ''
            };
            localStorage.setItem('printAllOrders', JSON.stringify(payload));
            window.open('print-all.html', '_blank');
        };

        this._getSellerInfo().then(sendPayload).catch(() => {
            sendPayload({ sellerName: '', sellerPhone: '' });
        });
    },

    // opens dedicated print page containing the summary data
    openPrintSummary() {
        const filteredOrders = this.orders.filter(order => {
            const orderDate = (order.createdAt || '').split('T')[0];
            return orderDate === this.selectedDate;
        });
        if (filteredOrders.length === 0) {
            if (window.App && window.App.showToast) window.App.showToast('No orders to summarize', 'info');
            return;
        }

        const productSummary = {};
        filteredOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const productId = item.productId;
                if (!productSummary[productId]) {
                    productSummary[productId] = {
                        productId,
                        productName: item.productName,
                        cartons: 0,
                        pcs: 0,
                        price: item.price || 0,
                        total: 0,
                        customerCount: new Set()
                    };
                }
                productSummary[productId].cartons += item.cartons || 0;
                productSummary[productId].pcs += item.pcs || 0;
                productSummary[productId].total += item.total || 0;
                productSummary[productId].customerCount.add(order.customerId);
            });
        });
        const summaryArray = Object.values(productSummary).map(item => ({
            ...item,
            customerCount: item.customerCount.size
        }));
        const grandTotal = summaryArray.reduce((sum, item) => sum + item.total, 0);
        // include seller info
        const send = (info) => {
            const payload = { date: this.selectedDate, ordersCount: filteredOrders.length, summaryArray, grandTotal, sellerName: info.sellerName||'', sellerPhone: info.sellerPhone||'' };
            const key = `printSummary-${Date.now()}`;
            localStorage.setItem(key, JSON.stringify(payload));
            window.open(`print-summary.html?key=${key}`, '_blank');
        };
        this._getSellerInfo().then(send).catch(() => send({ sellerName: '', sellerPhone: '' }));
    },

    async loadOrders() {
        try {
            this.orders = await DB.getAll('orders') || [];
            this.renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    },

    // Return sellerName and sellerPhone — prefer logged-in username, then Settings, then DB/localStorage
    async _getSellerInfo() {
        try {
            // 1) If a Firebase-auth user with displayName exists, use that as sellerName
            const fbUser = (window.FirebaseAuth && window.FirebaseAuth.currentUser) || (window.firebase && window.firebase.auth && window.firebase.auth().currentUser);
            if (fbUser && fbUser.displayName) {
                // phone: prefer SettingsModule._sellerPhone, then DB setting, then session
                let phone = '';
                if (window.SettingsModule && typeof window.SettingsModule._sellerPhone !== 'undefined') {
                    phone = window.SettingsModule._sellerPhone || '';
                } else {
                    phone = await window.DB.getSetting('sellerPhone') || '';
                    const sessionStr = localStorage.getItem('companySession');
                    if (!phone && sessionStr) {
                        try { phone = JSON.parse(sessionStr).phone || ''; } catch(e) { /* ignore */ }
                    }
                }
                return { sellerName: fbUser.displayName || '', sellerPhone: phone || '' };
            }

            // 2) Prefer explicit SettingsModule sellerName/Phone when present
            if (window.SettingsModule && typeof window.SettingsModule._sellerName !== 'undefined' && window.SettingsModule._sellerName) {
                return {
                    sellerName: window.SettingsModule._sellerName || '',
                    sellerPhone: window.SettingsModule._sellerPhone || ''
                };
            }

            // 3) Fallback to IndexedDB settings
            const [phoneSetting, nameSetting] = await Promise.all([
                window.DB.getSetting('sellerPhone'),
                window.DB.getSetting('sellerName')
            ]);
            if (nameSetting || phoneSetting) return { sellerName: nameSetting || '', sellerPhone: phoneSetting || '' };

            // 4) Last resort — localStorage companySession
            const sessionStr = localStorage.getItem('companySession');
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    return { sellerName: session.name || '', sellerPhone: session.phone || '' };
                } catch (e) { /* ignore */ }
            }

            return { sellerName: '', sellerPhone: '' };
        } catch (err) {
            return { sellerName: '', sellerPhone: '' };
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
            card.style.cssText = 'padding: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; border-left: 4px solid #667eea; transition: all 0.3s ease; cursor: pointer;';
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
            card.addEventListener('click', (e) => {
                // Only open view modal if not swiping
                if (e.target.closest('button')) return;
                this.showViewOrderModal(order);
            });
            this.addSwipeToDelete(card, order.id);
            container.appendChild(card);
        });
    },

    refresh() {
        this.loadOrders();
    },

    showSummaryModal() {
        // Filter orders by selected date
        const filteredOrders = this.orders.filter(order => {
            const orderDate = (order.createdAt || '').split('T')[0];
            return orderDate === this.selectedDate;
        });

        if (filteredOrders.length === 0) {
            if (window.App && window.App.showToast) {
                window.App.showToast('No orders found for this date', 'info');
            }
            return;
        }

        // Aggregate products from all orders
        const productSummary = {};

        filteredOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const productId = item.productId;
                if (!productSummary[productId]) {
                    productSummary[productId] = {
                        productId: productId,
                        productName: item.productName,
                        cartons: 0,
                        pcs: 0,
                        price: item.price || 0,
                        pcsPerCarton: item.pcsPerCarton || 1,
                        total: 0,
                        customerCount: new Set()
                    };
                }
                productSummary[productId].cartons += item.cartons || 0;
                productSummary[productId].pcs += item.pcs || 0;
                productSummary[productId].total += item.total || 0;
                productSummary[productId].customerCount.add(order.customerId);
            });
        });

        // Convert to array and calculate totals
        const summaryArray = Object.values(productSummary).map(item => ({
            ...item,
            customerCount: item.customerCount.size
        }));

        const grandTotal = summaryArray.reduce((sum, item) => sum + item.total, 0);

        const modal = document.createElement('div');
        modal.id = 'summaryModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 1000;';

        const orderDate = this.formatDateDisplay(this.selectedDate);

        modal.innerHTML = `
            <div style="width: 100%; background: white; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">Order Summary</h2>
                    <button id="closeSummaryModal" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #9ca3af; padding: 0; line-height: 1;">×</button>
                </div>

                <div class="summary-header" style="text-align: center; margin-bottom: 20px;">
                    <h2 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 8px 0;">ORDER SUMMARY</h2>
                    <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">${orderDate}</div>
                    <div style="font-size: 12px; color: #6b7280;">${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} • ${summaryArray.length} product${summaryArray.length !== 1 ? 's' : ''}</div>
                </div>

                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 12px;">Product Summary</div>
                    
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px; font-size: 13px; color: #6b7280; font-weight: 600; margin-bottom: 10px; text-align: center;">
                        <div style="text-align: left;">Product</div>
                        <div style="background: #d1fae5; padding: 4px; border-radius: 4px;">C</div>
                        <div style="background: #ddd6fe; padding: 4px; border-radius: 4px;">P</div>
                        <div>Total</div>
                    </div>

                    <div id="summaryProductRows" style="max-height: 400px; overflow-y: auto;">
                        ${summaryArray.map(item => `
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px; align-items: center; padding: 12px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                                <div style="font-size: 13px; color: #111827; font-weight: 500;">${item.productName || 'Unknown'}</div>
                                <div style="font-size: 13px; color: #000000; text-align: center; font-weight: 700;">${Math.round(item.cartons || 0)}</div>
                                <div style="font-size: 13px; color: #000000; text-align: center; font-weight: 700;">${Math.round(item.pcs || 0)}</div>
                                <div style="font-size: 13px; color: #111827; text-align: center; font-weight: 700;">৳${Math.round(item.total || 0)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Grand Total</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 16px; font-weight: 700; color: #111827;">Total Amount</div>
                        <div style="font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">৳${Math.round(grandTotal)}</div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button type="button" id="sumPrintBtn" style="flex: 0 0 120px; padding: 14px; border: none; background: #10b981; border-radius: 8px; font-size: 15px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Sum‑Print</button>
                    <button type="button" id="closeSummaryBtn" style="flex: 1; padding: 14px; border: none; background: #6b7280; border-radius: 8px; font-size: 15px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            modal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('closeSummaryModal').addEventListener('click', closeModal);
        document.getElementById('closeSummaryBtn').addEventListener('click', closeModal);
        const sumPrintBtnEl = document.getElementById('sumPrintBtn');
        if (sumPrintBtnEl) {
            sumPrintBtnEl.addEventListener('click', () => this.openPrintSummary());
        }
        


        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Add slide animations if not already added
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
























    async showViewOrderModal(order) {
        const modal = document.createElement('div');
        modal.id = 'viewOrderModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 1000;';
        
        const orderDate = this.formatDateDisplay((order.createdAt || '').split('T')[0]);
        const createdTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A';
        
        // Load seller info (from settings/localStorage) and then find customer info
        const { sellerName, sellerPhone } = await this._getSellerInfo();
        const customer = this.customers.find(c => c.id === order.customerId);
        // remember for plain-text printing (include customer mobile if available)
        const printOrderCopy = Object.assign({}, order);
        if (customer && customer.mobile) printOrderCopy.customerMobile = customer.mobile;
        window.smPrintOrder = printOrderCopy;
        window.smPrintSellerName = sellerName;
        window.smPrintSellerPhone = sellerPhone;
        
        modal.innerHTML = `
            <div style="width: 100%; background: white; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">View Order</h2>
                    <button id="closeViewModal" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #9ca3af; padding: 0; line-height: 1;">×</button>
                </div>

                <div style="text-align:center; margin-bottom:8px;">
                    <div style="font-size:14px; font-weight:700; color:#111827; margin-bottom:2px;">${sellerName || 'Seller'}</div>
                    <div style="font-size:13px; color:#6b7280;">${sellerPhone || ''}</div>
                </div>

                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 6px;"><strong>${order.customerName || 'Unknown'}</strong></div>
                    <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${customer && customer.mobile ? customer.mobile : ''}</div>
                    <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${order.area || 'N/A'}</div>
                    <div style="font-size: 13px; color: #374151; margin-bottom: 6px;">${orderDate} at ${createdTime}</div>
                    <div style="font-size: 12px; color: #9ca3af;">${order.orderNumber || 'Order #' + order.id}</div>
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

                    <div id="viewProductRows" style="max-height: 300px; overflow-y: auto;">
                        ${(order.items || []).map(item => `
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px; align-items: center; padding: 12px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                                <div style="font-size: 13px; color: #111827; font-weight: 500;">${item.productName || 'Unknown'}</div>
                                <div style="font-size: 13px; color: #6b7280; text-align: center; font-weight: 600;">${item.cartons || 0}</div>
                                <div style="font-size: 13px; color: #6b7280; text-align: center; font-weight: 600;">${item.pcs || 0}</div>
                                <div style="font-size: 13px; color: #6b7280; text-align: center; font-weight: 600;">৳${Math.round(item.price || 0)}</div>
                                <div style="font-size: 13px; color: #111827; text-align: center; font-weight: 700;">৳${Math.round(item.total || 0)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Summary</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 16px; font-weight: 700; color: #111827;">Total Amount</div>
                        <div style="font-size: 18px; font-weight: 700; color: #111827;">৳${Math.round(order.total || 0)}</div>
                    </div>
                </div>

                ${order.saveAsCredit ? `
                    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin-bottom: 16px; display: flex; align-items: start; gap: 8px;">
                        <div style="color: #92400e; font-size: 13px; flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 2px;">✓ Saved as Customer Credit</div>
                            <div style="font-size: 12px;">This order has been added to the customer's credit balance</div>
                        </div>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 10px;">
                    <button type="button" id="editOrderBtn" style="flex: 0 0 140px; padding: 14px; border: none; background: #f59e0b; border-radius: 8px; font-size: 15px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Edit</button>
                    <button type="button" id="sPrintOrderBtn" class="sm-print" style="flex: 0 0 120px; padding: 14px; border: none; background: #10b981; border-radius: 8px; font-size: 15px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">S‑Print</button>
                    <button type="button" id="closeViewBtn" style="flex: 1; padding: 14px; border: none; background: #6b7280; border-radius: 8px; font-size: 15px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            modal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                modal.remove();
                // wipe print globals so stale data isn't reused
                window.smPrintOrder = null;
                window.smPrintSellerName = null;
                window.smPrintSellerPhone = null;
            }, 300);
        };

        const closeViewTopBtn = modal.querySelector('#closeViewModal');
        const closeViewBtnEl = modal.querySelector('#closeViewBtn');
        const editOrderBtnEl = modal.querySelector('#editOrderBtn');
        const sPrintBtn = modal.querySelector('#sPrintOrderBtn');
        if (sPrintBtn) {
            sPrintBtn.addEventListener('click', async () => {
                // always fetch fresh seller info when printing
                let info = { sellerName: sellerName || '', sellerPhone: sellerPhone || '' };
                try {
                    const more = await this._getSellerInfo();
                    if (more) {
                        info.sellerName = more.sellerName || info.sellerName;
                        info.sellerPhone = more.sellerPhone || info.sellerPhone;
                    }
                } catch(e) {
                    console.warn('could not refresh seller info', e);
                }

                const printData = Object.assign({}, order, info);
                // include customer mobile if known
                if (customer && customer.mobile) printData.customerMobile = customer.mobile;
                localStorage.setItem('printOrder', JSON.stringify(printData));
                window.open('print-single.html', '_blank');
            });
        }

        if (closeViewTopBtn) closeViewTopBtn.addEventListener('click', closeModal);
        if (closeViewBtnEl) closeViewBtnEl.addEventListener('click', closeModal);
        if (editOrderBtnEl) editOrderBtnEl.addEventListener('click', () => {
            closeModal();
            this.showEditOrderModal(order);
        });













        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Add slide animations if not already added
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




























    async showEditOrderModal(order) {
        // Ensure data is loaded
        if (this.customers.length === 0 || this.products.length === 0 || this.areas.length === 0) {
            await this.loadData();
        }
        
        this.selectedProducts = order.items || [];
        
        const modal = document.createElement('div');
        modal.id = 'editOrderModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 1000;';
        
        modal.innerHTML = `
            <div style="width: 100%; background: white; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">Edit Order</h2>
                    <button id="closeEditModal" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #9ca3af; padding: 0; line-height: 1;">×</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div>
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">Area</label>
                        <select id="areaSelectEdit" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white; color: #6b7280; box-sizing: border-box; cursor: pointer;">
                            <option value="">Select area</option>
                            ${this.areas.map(area => `<option value="${area.name}" ${area.name === order.area ? 'selected' : ''}>${area.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">Customer</label>
                        <select id="customerSelectEdit" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white; color: #6b7280; box-sizing: border-box; cursor: pointer;">
                            <option value="">Select customer</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">Order ID</label>
                    <input type="text" id="orderIdEdit" readonly value="${order.orderNumber || 'Order #' + order.id}" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #f9fafb; color: #6b7280; box-sizing: border-box;">
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

                    <div id="productRowsEdit"></div>

                    <button id="addProductBtnEdit" style="width: 100%; padding: 12px; margin-top: 12px; border: none; background: #3b82f6; color: white; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        + Add Product
                    </button>
                </div>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Summary</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 16px; font-weight: 700; color: #111827;">Total</div>
                        <div id="orderTotalEdit" style="font-size: 18px; font-weight: 700; color: #111827;">0</div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button type="button" id="cancelEditBtn" style="flex: 1; padding: 14px; border: 1px solid #d1d5db; background: white; border-radius: 8px; font-size: 15px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.3s ease;">Cancel</button>
                    <button type="button" id="saveEditBtn" style="flex: 1; padding: 14px; border: none; background: #3b82f6; border-radius: 8px; font-size: 15px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Wait a moment for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 50));

        // Event listeners setup
        const areaSelect = document.getElementById('areaSelectEdit');
        const customerSelect = document.getElementById('customerSelectEdit');
        
        if (!areaSelect || !customerSelect) {
            console.error('Modal elements not found');
            alert('Error creating edit form');
            return;
        }
        
        // Populate customers initially (all customers)
        customerSelect.innerHTML = '<option value="">Select customer</option>' +
            this.customers.map(c => `<option value="${c.id}" ${c.id === order.customerId ? 'selected' : ''}>${c.name}</option>`).join('');
        
        areaSelect.addEventListener('change', (e) => {
            const selectedArea = e.target.value;
            
            const filteredCustomers = selectedArea ? 
                this.customers.filter(c => c.area === selectedArea) : 
                this.customers;
            
            customerSelect.innerHTML = '<option value="">Select customer</option>' +
                filteredCustomers.map(c => `<option value="${c.id}" ${c.id === order.customerId ? 'selected' : ''}>${c.name}</option>`).join('');
            
            // Keep the original customer selected if it matches the filtered list
            customerSelect.value = order.customerId;
        });

        document.getElementById('addProductBtnEdit').addEventListener('click', () => this.addProductRowEdit());

        const closeModal = () => {
            modal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('closeEditModal').addEventListener('click', closeModal);
        document.getElementById('cancelEditBtn').addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.getElementById('saveEditBtn').addEventListener('click', async () => {
            await this.updateOrder(order.id);
            closeModal();
        });

        // Add existing product rows
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => this.addProductRowEdit(item));
        } else {
            this.addProductRowEdit();
        }

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

    addProductRowEdit(item = null) {
        const container = document.getElementById('productRowsEdit');
        if (!container) return;
        
        const rowId = 'product-' + Date.now();
        
        const row = document.createElement('div');
        row.id = rowId;
        row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px; align-items: center;';
        
        row.innerHTML = `
            <select class="product-select-edit" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: white; color: #374151; box-sizing: border-box;">
                <option value="">Select</option>
                ${this.products.map(p => `<option value="${p.id}" data-price="${p.price}" data-pcs="${p.pcs || 1}">${p.name}</option>`).join('')}
            </select>
            <input type="number" class="product-carton-edit" min="0" value="${item ? item.cartons || 0 : 0}" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; text-align: center; box-sizing: border-box;">
            <input type="number" class="product-packet-edit" min="0" value="${item ? item.pcs || 0 : 0}" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; text-align: center; box-sizing: border-box;">
            <input type="number" class="product-price-edit" min="0" value="${item ? item.price || 0 : 0}" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; text-align: center; box-sizing: border-box;">
            <div class="product-total-edit" style="padding: 8px; font-size: 13px; text-align: center; font-weight: 600; color: #111827;">${item ? Math.round(item.total || 0) : 0}</div>
        `;
        
        container.appendChild(row);
        
        // Set product selection AFTER appending to DOM
        const select = row.querySelector('.product-select-edit');
        if (item && item.productId) {
            // Ensure proper type comparison
            select.value = String(item.productId);
        }
        
        const carton = row.querySelector('.product-carton-edit');
        const packet = row.querySelector('.product-packet-edit');
        const price = row.querySelector('.product-price-edit');
        const total = row.querySelector('.product-total-edit');
        
        // Use arrow function to preserve 'this' context
        const updateTotal = () => {
            if (!select || !carton || !packet || !price || !total) return;
            
            const selectedOption = select.options[select.selectedIndex];
            if (!selectedOption || !selectedOption.value) return;
            
            const pricePerPiece = parseFloat(selectedOption.dataset.price) || 0;
            const pcsPerCarton = parseFloat(selectedOption.dataset.pcs) || 1;
            
            // Only auto-fill price if it's empty (0) or when product changes and wasn't manually set
            if (!item && price.value == 0) {
                price.value = pricePerPiece;
            } else if (item && select.dataset.lastSelected !== select.value) {
                // If editing existing item and product is changed, auto-fill new product's price
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
            this.updateOrderTotalEdit();
        };
        
        select.addEventListener('change', updateTotal);
        carton.addEventListener('input', updateTotal);
        packet.addEventListener('input', updateTotal);
        price.addEventListener('input', updateTotal);
        
        // Trigger update if item exists
        if (item) {
            updateTotal();
        }
    },

    updateOrderTotalEdit() {
        const container = document.getElementById('productRowsEdit');
        if (!container) return;
        const totals = Array.from(container.querySelectorAll('.product-total-edit'));
        const sum = totals.reduce((acc, div) => acc + (parseFloat(div.textContent) || 0), 0);
        const totalElement = document.getElementById('orderTotalEdit');
        if (totalElement) {
            totalElement.textContent = sum.toFixed(0);
        }
    },

    async updateOrder(orderId) {
        try {
            const area = document.getElementById('areaSelectEdit').value;
            const customerId = parseInt(document.getElementById('customerSelectEdit').value);
            const customerSelect = document.getElementById('customerSelectEdit');
            
            if (!customerId || customerId === 0) {
                alert('Please select a customer');
                return;
            }
            
            // Get customer name from the selected option
            const customerName = customerSelect.options[customerSelect.selectedIndex].text;
            
            const products = [];
            const rows = document.getElementById('productRowsEdit').children;
            
            for (const row of rows) {
                const select = row.querySelector('.product-select-edit');
                if (!select) continue;
                
                const productId = select.value;
                if (!productId) continue;
                
                const selectedOption = select.options[select.selectedIndex];
                const pcsPerCarton = parseFloat(selectedOption.dataset.pcs) || 1;
                
                const carton = parseFloat(row.querySelector('.product-carton-edit').value) || 0;
                const packet = parseFloat(row.querySelector('.product-packet-edit').value) || 0;
                const price = parseFloat(row.querySelector('.product-price-edit').value) || 0;
                const total = parseFloat(row.querySelector('.product-total-edit').textContent) || 0;
                
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
            
            const totalAmount = parseFloat(document.getElementById('orderTotalEdit').textContent) || 0;
            
            // Get the original order to preserve createdAt and other fields
            const originalOrder = this.orders.find(o => o.id === orderId);
            if (!originalOrder) {
                alert('Order not found');
                return;
            }
            
            const updatedOrder = {
                id: orderId,
                orderNumber: originalOrder.orderNumber,
                area,
                customerId,
                customerName: customerName,
                items: products,
                total: totalAmount,
                createdAt: originalOrder.createdAt,
                saveAsCredit: originalOrder.saveAsCredit || false,
                paidAmount: originalOrder.paidAmount || 0,
                paymentHistory: originalOrder.paymentHistory || [],
                date: originalOrder.date  // Preserve date field if it exists
            };
            
            await DB.update('orders', updatedOrder);
            
            // If order was saved as credit, update the credit entry as well
            if (updatedOrder.saveAsCredit) {
                try {
                    // Get all credits to find the one linked to this order
                    const allCredits = await DB.getAll('credits') || [];
                    const linkedCredit = allCredits.find(c => c.orderId === orderId);
                    
                    if (linkedCredit) {
                        // Update the credit with new data while preserving payment info
                        const updatedCredit = {
                            id: linkedCredit.id,
                            customerId,
                            customerName: customerName,
                            amount: totalAmount,
                            paidAmount: linkedCredit.paidAmount || 0,
                            paymentHistory: linkedCredit.paymentHistory || [],
                            type: 'order',
                            orderId: orderId,
                            orderNumber: originalOrder.orderNumber,
                            date: linkedCredit.date || this.selectedDate,
                            deleted: linkedCredit.deleted || false
                        };
                        await DB.update('credits', updatedCredit);
                    }
                } catch (error) {
                    console.error('Error updating credit:', error);
                    // Don't fail the order update if credit update fails
                }
            }
            
            await this.loadOrders();
            
            if (window.App && window.App.showToast) {
                window.App.showToast('Order updated successfully', 'success');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order: ' + error.message);
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
