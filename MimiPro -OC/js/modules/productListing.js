/**
 * Product Listing Module (Side Nav)
 */

const ProductListingModule = {
    products: [],

    init() {
        this.render();
        this.loadProducts();
    },

    render() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 16px;">Product List</h3>
                <table id="prodTable" style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Name</th>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Pcs/Ctn</th>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Price</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
    },

    async loadProducts() {
        try {
            console.log('📥 Loading products from DB...');
            this.products = await DB.getAll('products');
            console.log(`✅ Loaded ${this.products.length} products:`, this.products);
            this.renderTable();
        } catch (error) {
            console.error('❌ Error loading products:', error);
        }
    },

    renderTable() {
        const tbody = document.querySelector('#prodTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="padding: 20px; text-align: center; color: #6c757d;">
                        No products available
                    </td>
                </tr>
            `;
            return;
        }

        this.products.forEach((p) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${p.name}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">${p.pcs}</td>
                <td style="padding: 8px 4px; border-bottom: 1px solid #f1f3f5; text-align: center;">৳${p.price}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    attachSwipeEvents() {
        // No swipe functionality for read-only view
    },

    refresh() {
        this.loadProducts();
    },

    destroy() {
        this.products = [];
    }
};

// Register module
if (window.App) {
    App.registerModule('productListing', ProductListingModule);
}

window.ProductListingModule = ProductListingModule;
