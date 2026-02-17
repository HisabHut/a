/**
 * Shop Control Module - Inventory & Product Management
 */

const ShopControlModule = {
    products: [],
    productLookup: new Map(),
    editIndex: -1,
    pendingDeleteId: null,
    lastSyncStatus: null,
    isSyncing: false,

    init() {
        this.render();
        this.loadProducts();
        // Check sync status on load
        this.checkAndDisplaySyncStatus();
    },

    render() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="color: white; font-size: 20px; margin: 0 0 4px 0;">🏪 Shop Control</h2>
                        <p style="opacity: 0.9; font-size: 13px; margin: 0;">Manage products & inventory</p>
                    </div>
                    <div id="syncStatusIndicator" style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                        <span id="syncStatusDot" style="width: 8px; height: 8px; border-radius: 50%; background: #fbbf24;"></span>
                        <span id="syncStatusText">Checking...</span>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div class="card" style="text-align: center; padding: 12px;">
                    <div style="font-size: 11px; color: #6c757d; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Total Products</div>
                    <div id="totalProducts" style="font-size: 20px; font-weight: 700; color: #2c3e50;">0</div>
                </div>
                <div class="card" style="text-align: center; padding: 12px;">
                    <div style="font-size: 11px; color: #6c757d; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">Pending Sync</div>
                    <div id="pendingSyncCount" style="font-size: 20px; font-weight: 700; color: #dc3545;">0</div>
                </div>
            </div>

            <!-- Product Table -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6;">
                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Products</h3>
                    <button id="addProductBtn" class="btn btn-primary" style="padding: 8px 16px; font-size: 12px;">+ Add Product</button>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr>
                            <th style="background: #f8f9fa; padding: 8px; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Product Name</th>
                            <th style="background: #f8f9fa; padding: 8px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Price</th>
                            <th style="background: #f8f9fa; padding: 8px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Stock</th>
                            <th style="background: #f8f9fa; padding: 8px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Status</th>
                            <th style="background: #f8f9fa; padding: 8px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Sync</th>
                            <th style="background: #f8f9fa; padding: 8px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Action</th>
                        </tr>
                    </thead>
                    <tbody id="productsTable"></tbody>
                </table>
            </div>

            <!-- Add/Edit Product Modal -->
            <div class="modal" id="productModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="productModalTitle">Add Product</h3>
                        <button class="modal-close" onclick="ShopControlModule.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Select Product (Optional)</label>
                            <select id="productSelect" style="width: 100%; padding: 10px; border: 1px solid #e1e8ed; border-radius: 6px; font-size: 13px;">
                                <option value="">Choose from product list</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Product Name</label>
                            <input id="productName" type="text" placeholder="Enter product name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Price</label>
                            <input id="productPrice" type="number" placeholder="0" min="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Stock Quantity</label>
                            <input id="productStock" type="number" placeholder="0" min="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea id="productDescription" placeholder="Enter product description" style="width: 100%; padding: 10px; border: 1px solid #e1e8ed; border-radius: 6px; font-size: 13px; resize: vertical; height: 80px;"></textarea>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="ShopControlModule.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="ShopControlModule.saveProduct()">Save</button>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation -->
            <div class="delete-confirm-overlay" id="productDeleteModal">
                <div class="delete-confirm-box" role="dialog" aria-modal="true">
                    <div class="delete-confirm-icon">⚠️</div>
                    <div class="delete-confirm-title">Delete this product?</div>
                    <div class="delete-confirm-text">This action cannot be undone. Are you sure?</div>
                    <div class="delete-confirm-actions">
                        <button class="delete-confirm-btn cancel" onclick="ShopControlModule.closeDeleteConfirm()">Cancel</button>
                        <button class="delete-confirm-btn delete" onclick="ShopControlModule.confirmDelete()">Delete</button>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    bindEvents() {
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openModal());
        }
    },

    async loadProducts() {
        try {
            console.log('📥 Loading products...');
            this.products = await DB.getAll('products') || [];
            console.log(`✅ Loaded ${this.products.length} products`);
            this.renderProductsTable();
            this.updateStats();
            this.checkAndDisplaySyncStatus();  // ✅ Update sync indicator
        } catch (error) {
            console.error('❌ Error loading products:', error);
            App.showToast('Error loading products', 'error');
        }
    },

    renderProductsTable() {
        const tbody = document.getElementById('productsTable');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Filter out deleted products
        const activeProducts = this.products.filter(p => !p.deleted);

        if (activeProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding: 20px; text-align: center; color: #6c757d;">
                        No products added yet. Click "Add Product" to create one.
                    </td>
                </tr>
            `;
            return;
        }

        activeProducts.forEach((product) => {
            const stockStatus = product.stock > 20 ? '✅ In Stock' :
                               product.stock > 5 ? '⚠️ Low Stock' :
                               product.stock > 0 ? '🔴 Critical' : '❌ Out';
            
            const statusColor = product.stock > 20 ? '#28a745' :
                               product.stock > 5 ? '#ffc107' :
                               product.stock > 0 ? '#dc3545' : '#6c757d';

            const tr = document.createElement('tr');
            tr.style.cssText = 'cursor: pointer; transition: all 0.3s ease; touch-action: pan-y;';
            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #f1f3f5; text-align: left;">
                    <div style="font-weight: 500; color: #2c3e50;">${product.name}</div>
                    <div style="font-size: 10px; color: #6c757d; margin-top: 2px;">${product.description || 'No description'}</div>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f3f5; text-align: center;">৳${product.price || 0}</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f3f5; text-align: center;">
                    <div style="font-weight: 600; color: #111827;">${product.stock || 0}</div>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f3f5; text-align: center;">
                    <span style="color: ${statusColor}; font-weight: 600; font-size: 11px;">${stockStatus}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f3f5; text-align: center;">
                    <span style="font-size: 12px;">${product.syncedAt ? '✅ Synced' : '⏳ Pending'}</span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f3f5; text-align: center;">
                    <button onclick="ShopControlModule.showViewProductModal('${product.id}')" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px;" title="Edit">✏️</button>
                </td>
            `;
            
            tr.addEventListener('mouseover', () => {
                tr.style.background = '#f3f4f6';
            });
            tr.addEventListener('mouseout', () => {
                tr.style.background = '';
            });

            tr.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                this.showViewProductModal(product.id);
            });

            this.addSwipeToDelete(tr, product.id);
            tbody.appendChild(tr);
        });
    },

    addSwipeToDelete(row, productId) {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        let hasMoved = false;

        row.addEventListener('touchstart', (e) => {
            if (e.target.closest('button')) return;
            const point = e.touches[0];
            startX = point.clientX;
            currentX = startX;
            isSwiping = true;
            hasMoved = false;
        }, { passive: true });

        row.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            const point = e.touches[0];
            currentX = point.clientX;
            const diff = startX - currentX;

            if (Math.abs(diff) > 10) {
                hasMoved = true;
            }

            if (diff > 0 && diff < 150) {
                row.style.transform = `translateX(-${diff}px)`;
                row.style.background = `linear-gradient(90deg, #f9fafb ${100 - diff / 2}%, rgba(220,53,69,0.12) 100%)`;
            }
        }, { passive: true });

        row.addEventListener('touchend', () => {
            if (!isSwiping) return;
            const diff = startX - currentX;
            if (hasMoved && diff > 100) {
                this.showDeleteConfirm(productId);
            }
            row.style.transform = '';
            row.style.background = '';
            isSwiping = false;
            hasMoved = false;
        });
    },

    showViewProductModal(productId) {
        const product = this.products.find(p => String(p.id) === String(productId));
        if (!product) return;
        this.editIndex = this.products.findIndex(p => String(p.id) === String(productId));

        const modal = document.createElement('div');
        modal.id = 'viewProductModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 1000;';
        
        modal.innerHTML = `
            <div style="width: 100%; background: white; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">📦 ${product.name}</h2>
                    <button id="closeViewProductModal" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #9ca3af; padding: 0; line-height: 1;">×</button>
                </div>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Price</div>
                            <div style="font-size: 24px; font-weight: 700; color: #2c3e50;">৳${product.price || 0}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Stock</div>
                            <div style="font-size: 24px; font-weight: 700; color: #2c3e50;">${product.stock || 0} units</div>
                        </div>
                    </div>
                </div>

                ${product.description ? `
                    <div style="background: #f0f4ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 6px;">Description</div>
                        <div style="font-size: 13px; color: #1e3a8a; line-height: 1.5;">${product.description}</div>
                    </div>
                ` : ''}

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Status</div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${product.stock > 20 ? `
                            <div style="width: 12px; height: 12px; background: #28a745; border-radius: 50%;"></div>
                            <span style="color: #28a745; font-weight: 600; font-size: 13px;">✅ In Stock (>${product.stock} units)</span>
                        ` : product.stock > 5 ? `
                            <div style="width: 12px; height: 12px; background: #ffc107; border-radius: 50%;"></div>
                            <span style="color: #ffc107; font-weight: 600; font-size: 13px;">⚠️ Low Stock (${product.stock} units)</span>
                        ` : product.stock > 0 ? `
                            <div style="width: 12px; height: 12px; background: #dc3545; border-radius: 50%;"></div>
                            <span style="color: #dc3545; font-weight: 600; font-size: 13px;">🔴 Critical (${product.stock} units)</span>
                        ` : `
                            <div style="width: 12px; height: 12px; background: #6c757d; border-radius: 50%;"></div>
                            <span style="color: #6c757d; font-weight: 600; font-size: 13px;">❌ Out of Stock</span>
                        `}
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                    <button id="toggleVisibilityBtn" style="flex: 1; padding: 12px; border: none; background: ${product.active !== false ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; border-radius: 8px; font-size: 14px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">${product.active !== false ? '✅ Visible to Customers' : '🚫 Hidden from Customers'}</button>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="editProductBtn" style="flex: 1; padding: 12px; border: none; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); border-radius: 8px; font-size: 14px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">✏️ Edit</button>
                    <button id="closeViewBtn" style="flex: 1; padding: 12px; border: none; background: #6b7280; border-radius: 8px; font-size: 14px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            modal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('closeViewProductModal').addEventListener('click', closeModal);
        document.getElementById('closeViewBtn').addEventListener('click', closeModal);
        document.getElementById('toggleVisibilityBtn').addEventListener('click', async () => {
            const currentStatus = product.active !== false;
            const newStatus = !currentStatus;
            
            try {
                // Update in IndexedDB
                product.active = newStatus;
                product.updatedAt = new Date().toISOString();
                await DB.update('products', product);
                
                // Update in Firestore
                const sessionStr = localStorage.getItem('companySession');
                if (sessionStr) {
                    const session = JSON.parse(sessionStr);
                    const db = firebase.firestore();
                    await db.collection('users')
                        .doc(session.companyId)
                        .collection('products')
                        .doc(String(product.id))
                        .set(product, { merge: true });
                }
                
                App.showToast(
                    newStatus ? '✅ Product visible to customers' : '🚫 Product hidden from customers',
                    'success'
                );
                closeModal();
                await this.loadProducts();
            } catch (error) {
                console.error('Error toggling visibility:', error);
                App.showToast('Error updating product visibility', 'error');
            }
        });
        document.getElementById('editProductBtn').addEventListener('click', () => {
            closeModal();
            this.showEditProductModal(product.id);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Add animations if not already added
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
        if (!document.querySelector('style[data-shop-modal]')) {
            style.setAttribute('data-shop-modal', '');
            document.head.appendChild(style);
        }
    },

    showEditProductModal(productId) {
        const product = this.products.find(p => String(p.id) === String(productId));
        if (!product) return;
        this.editIndex = this.products.findIndex(p => String(p.id) === String(productId));

        const modal = document.createElement('div');
        modal.id = 'editProductModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 1001;';
        
        modal.innerHTML = `
            <div style="width: 100%; background: white; border-radius: 16px 16px 0 0; padding: 20px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">Edit Product</h2>
                    <button id="closeEditProductModal" style="width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #9ca3af; padding: 0; line-height: 1;">×</button>
                </div>

                <div class="form-group">
                    <label class="form-label">Product Name</label>
                    <input id="editProductName" type="text" value="${product.name || ''}" placeholder="Enter product name" style="width: 100%; padding: 10px 12px; border: 1px solid #e1e8ed; border-radius: 6px; font-size: 14px;">
                </div>
                <div class="form-group">
                    <label class="form-label">Price</label>
                    <input id="editProductPrice" type="number" value="${product.price || 0}" placeholder="0" min="0" style="width: 100%; padding: 10px 12px; border: 1px solid #e1e8ed; border-radius: 6px; font-size: 14px;">
                </div>
                <div class="form-group">
                    <label class="form-label">Stock Quantity</label>
                    <input id="editProductStock" type="number" value="${product.stock || 0}" placeholder="0" min="0" style="width: 100%; padding: 10px 12px; border: 1px solid #e1e8ed; border-radius: 6px; font-size: 14px;">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="editProductDescription" placeholder="Enter product description" style="width: 100%; padding: 10px 12px; border: 1px solid #e1e8ed; border-radius: 6px; font-size: 14px; resize: vertical; height: 80px; box-sizing: border-box;">${product.description || ''}</textarea>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="saveEditProductBtn" style="flex: 1; padding: 12px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; font-size: 14px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">✅ Save</button>
                    <button id="closeEditProductBtn" style="flex: 1; padding: 12px; border: none; background: #6b7280; border-radius: 8px; font-size: 14px; font-weight: 600; color: white; cursor: pointer; transition: all 0.3s ease;">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            modal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('closeEditProductModal').addEventListener('click', closeModal);
        document.getElementById('closeEditProductBtn').addEventListener('click', closeModal);
        document.getElementById('saveEditProductBtn').addEventListener('click', async () => {
            const name = document.getElementById('editProductName').value.trim();
            const price = parseFloat(document.getElementById('editProductPrice').value);
            const stock = parseInt(document.getElementById('editProductStock').value);
            const description = document.getElementById('editProductDescription').value.trim();

            if (!name || !price || stock === '') {
                App.showToast('Please fill all required fields', 'warning');
                return;
            }

            try {
                const productData = {
                    id: product.id,
                    name,
                    price,
                    stock,
                    description,
                    active: product.active !== false,  // ✅ Preserve active status
                    updatedAt: new Date().toISOString()
                };

                await DB.update('products', productData);
                App.showToast(`✅ Product "${name}" updated successfully`, 'success');
                closeModal();
                await this.loadProducts();
                
                // ✅ Sync to Firestore
                await this.syncProductsToFirestore();
            } catch (error) {
                console.error('❌ Error saving product:', error);
                App.showToast('Error saving product: ' + error.message, 'error');
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    },

    showDeleteConfirm(productId) {
        this.pendingDeleteId = productId;
        const modal = document.getElementById('productDeleteModal');
        if (modal) modal.classList.add('show');
    },

    closeDeleteConfirm() {
        const modal = document.getElementById('productDeleteModal');
        if (modal) modal.classList.remove('show');
        this.pendingDeleteId = null;
    },

    openModal() {
        this.editIndex = -1;
        const modalTitle = document.getElementById('productModalTitle');
        if (modalTitle) modalTitle.textContent = 'Add Product';
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productStock').value = '';
        document.getElementById('productDescription').value = '';

        this.populateProductSelect();
        const productSelect = document.getElementById('productSelect');
        if (productSelect) {
            productSelect.value = '';
            productSelect.onchange = () => {
                const selectedId = productSelect.value;
                const selected = this.productLookup.get(String(selectedId));
                if (!selected) return;

                document.getElementById('productName').value = selected.name || '';
                document.getElementById('productPrice').value = selected.price ?? '';
                document.getElementById('productDescription').value = selected.description || '';
            };
        }
        document.getElementById('productModal').classList.add('show');
    },

    async populateProductSelect() {
        const productSelect = document.getElementById('productSelect');
        if (!productSelect) return;

        try {
            const products = await DB.getAll('products');
            this.productLookup = new Map();

            productSelect.innerHTML = '<option value="">Choose from product list</option>';

            products
                .filter(p => !p.deleted)
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .forEach((product) => {
                    const option = document.createElement('option');
                    option.value = String(product.id);
                    option.textContent = `${product.name || 'Unnamed'} (৳${product.price || 0})`;
                    productSelect.appendChild(option);
                    this.productLookup.set(String(product.id), product);
                });
        } catch (error) {
            console.error('Error loading product list:', error);
        }
    },

    closeModal() {
        document.getElementById('productModal').classList.remove('show');
    },

    async saveProduct() {
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const description = document.getElementById('productDescription').value.trim();

        if (!name || !price || stock === '') {
            App.showToast('Please fill all required fields', 'warning');
            return;
        }

        try {
            const productData = {
                name,
                price,
                stock,
                description,
                active: true,  // ✅ Enable visibility for customers
                updatedAt: new Date().toISOString()
            };

            if (this.editIndex === -1) {
                // New product
                productData.createdAt = new Date().toISOString();
                await DB.add('products', productData);
                App.showToast(`✅ Product "${name}" added successfully`, 'success');
                console.log('✅ Product added:', productData);
            } else {
                // Edit product
                productData.id = this.products[this.editIndex].id;
                await DB.update('products', productData);
                App.showToast(`✅ Product "${name}" updated successfully`, 'success');
                console.log('✅ Product updated:', productData);
            }

            this.closeModal();
            await this.loadProducts();
            
            // ✅ Sync to Firestore for customers to see
            await this.syncProductsToFirestore();
        } catch (error) {
            console.error('❌ Error saving product:', error);
            App.showToast('Error saving product: ' + error.message, 'error');
        }
    },

    updateStats() {
        const total = document.getElementById('totalProducts');
        const pendingSync = document.getElementById('pendingSyncCount');
        
        // Only count non-deleted products
        const activeProducts = this.products.filter(p => !p.deleted);
        
        if (total) total.textContent = activeProducts.length;
        
        if (pendingSync) {
            const pendingCount = activeProducts.filter(p => !p.syncedAt).length;
            pendingSync.textContent = pendingCount;
            pendingSync.style.color = pendingCount > 0 ? '#dc3545' : '#28a745';
        }
    },

    checkAndDisplaySyncStatus() {
        const indicator = document.getElementById('syncStatusIndicator');
        const dot = document.getElementById('syncStatusDot');
        const text = document.getElementById('syncStatusText');
        
        if (!indicator) return;
        
        const sessionStr = localStorage.getItem('companySession');
        
        if (!sessionStr) {
            dot.style.background = '#ef4444';
            text.textContent = 'Not signed in';
            indicator.style.opacity = '0.7';
            App.showToast(
                '⚠️ Shop data won\'t sync. Please sign in via Settings to enable cloud sync.',
                'warning',
                5000
            );
            return;
        }
        
        const pendingCount = this.products.filter(p => !p.syncedAt).length;
        
        if (pendingCount > 0) {
            dot.style.background = '#fbbf24';
            text.textContent = `${pendingCount} pending`;
        } else {
            dot.style.background = '#28a745';
            text.textContent = 'All synced';
        }
    },

    async confirmDelete() {
        try {
            await DB.delete('products', this.pendingDeleteId);
            App.showToast('Product deleted', 'success');
            this.closeDeleteConfirm();
            await this.loadProducts();
            
            // ✅ Sync deletion to Firestore
            await this.syncProductsToFirestore();
        } catch (error) {
            console.error('Error deleting product:', error);
            App.showToast('Error deleting product', 'error');
        }
    },

    async syncProductsToFirestore() {
        if (this.isSyncing) {
            console.warn('⏳ Sync already in progress');
            return;
        }

        this.isSyncing = true;
        const indicator = document.getElementById('syncStatusIndicator');
        const dot = document.getElementById('syncStatusDot');
        const text = document.getElementById('syncStatusText');
        
        try {
            const sessionStr = localStorage.getItem('companySession');
            if (!sessionStr) {
                console.error('❌ No company session - user not authenticated');
                throw new Error('You must be signed in to sync products. Please sign in via Settings.');
            }

            const session = JSON.parse(sessionStr);
            const companyId = session.companyId;
            
            if (!window.firebase || !window.firebase.firestore()) {
                console.error('❌ Firebase not available');
                throw new Error('Firebase connection unavailable. Check your internet connection.');
            }
            
            const db = window.firebase.firestore();

            // Get all products from local IndexedDB
            const allProducts = await DB.getAll('products');
            
            // Split into deleted and pending uploads
            const deletedProducts = allProducts.filter(p => p.deleted);
            const pendingProducts = allProducts.filter(p => !p.deleted && !p.syncedAt);
            
            let deleteCount = 0;
            let successCount = 0;
            let failCount = 0;

            // Step 1: Delete products marked as deleted from Firestore
            if (deletedProducts.length > 0) {
                console.log(`🗑️ Deleting ${deletedProducts.length} products from Firestore...`);
                for (const product of deletedProducts) {
                    try {
                        // Remove from Firestore
                        await db.collection('users')
                            .doc(companyId)
                            .collection('products')
                            .doc(String(product.id))
                            .delete();

                        // Hard delete from local IndexedDB
                        await DB.delete('products', product.id);  // This will mark deleted, but we'll override
                        // Actually hard delete using transaction
                        const transaction = DB.instance.transaction(['products'], 'readwrite');
                        const store = transaction.objectStore('products');
                        store.delete(product.id);
                        
                        console.log(`🗑️ Deleted product ${product.id}: ${product.name}`);
                        deleteCount++;
                    } catch (itemError) {
                        console.error(`❌ Failed to delete product ${product.id}:`, itemError.message);
                        failCount++;
                    }
                }
            }
            
            if (pendingProducts.length === 0 && deletedProducts.length === 0) {
                console.log('✅ All products already synced');
                if (dot) {
                    dot.style.background = '#28a745';
                    text.textContent = 'All synced';
                }
                this.isSyncing = false;
                return;
            }
            
            // Step 2: Upload pending products
            if (pendingProducts.length > 0) {
                console.log(`📤 Syncing ${pendingProducts.length} products to Firestore...`);
                if (dot) {
                    dot.style.background = '#f59e0b';
                    text.textContent = `Syncing ${pendingProducts.length}...`;
                }

                for (const product of pendingProducts) {
                    try {
                        // Ensure product has active flag
                        const productData = {
                            ...product,
                            deleted: false,  // Make sure it's not marked deleted in cloud
                            active: product.active !== false,  
                            syncedAt: new Date().toISOString()
                        };

                        // Upload to Firestore
                        await db.collection('users')
                            .doc(companyId)
                            .collection('products')
                            .doc(String(product.id))
                            .set(productData, { merge: true });

                        // Mark as synced in local DB
                        const updated = { ...product, syncedAt: new Date().toISOString() };
                        await DB.update('products', updated);
                        
                        console.log(`✅ Synced product ${product.id}: ${product.name}`);
                        successCount++;
                    } catch (itemError) {
                        console.error(`❌ Failed to sync product ${product.id} (${product.name}):`, itemError.message);
                        failCount++;
                    }
                }
            }

            // Update UI with results
            if (failCount === 0) {
                const totalMessage = (successCount > 0 ? `uploaded ${successCount}` : '') + 
                                    (deleteCount > 0 && successCount > 0 ? ', ' : '') +
                                    (deleteCount > 0 ? `deleted ${deleteCount}` : '');
                App.showToast(`✅ Sync complete: ${totalMessage}!`, 'success');
                if (dot) {
                    dot.style.background = '#28a745';
                    text.textContent = 'All synced';
                }
                console.log('✅ All sync operations completed successfully');
            } else {
                const totalOps = successCount + deleteCount;
                App.showToast(
                    `⚠️ Completed ${totalOps}/${pendingProducts.length + deletedProducts.length} operations. ${failCount} failed. Check console for details.`,
                    'warning',
                    5000
                );
                if (dot) {
                    dot.style.background = '#ef4444';
                    text.textContent = `${failCount} failed`;
                }
                console.error(`❌ Sync failed for ${failCount} operations`);
            }
            
            localStorage.setItem('lastProductSync', new Date().toISOString());
            await this.loadProducts();  // Refresh UI
            
        } catch (error) {
            console.error('❌ Error syncing products to Firestore:', error.message);
            App.showToast(
                `❌ Sync failed: ${error.message}`,
                'error',
                5000
            );
            if (dot) {
                dot.style.background = '#ef4444';
                text.textContent = 'Sync failed';
            }
            this.lastSyncStatus = 'failed';
        } finally {
            this.isSyncing = false;
        }
    },

    destroy() {
        this.products = [];
        this.editIndex = -1;
    }
};

// Register module
if (window.App) {
    App.registerModule('shopControl', ShopControlModule);
}

window.ShopControlModule = ShopControlModule;
