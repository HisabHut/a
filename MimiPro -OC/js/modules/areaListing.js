/**
 * Area Listing Module (Side Nav)
 */

const AreaListingModule = {
    areas: [],

    init() {
        this.render();
        this.loadAreas();
    },

    render() {
        const content = document.getElementById('pageContent');
        if (!content) return;

        content.innerHTML = `
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 16px;">Area List</h3>
                <table id="areaTable" style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr>
                            <th style="background: #f8f9fa; padding: 8px 4px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef;">Area Name</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
    },

    async loadAreas() {
        try {
            console.log('📥 Loading areas from DB...');
            this.areas = await DB.getAll('areas');
            console.log(`✅ Loaded ${this.areas.length} areas:`, this.areas);
            this.renderTable();
        } catch (error) {
            console.error('❌ Error loading areas:', error);
        }
    },

    renderTable() {
        const tbody = document.querySelector('#areaTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.areas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td style="padding: 20px; text-align: center; color: #6c757d;">
                        No areas available
                    </td>
                </tr>
            `;
            return;
        }

        this.areas.forEach((area) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 12px 8px; border-bottom: 1px solid #f1f3f5; text-align: center;">${area.name}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    attachSwipeEvents() {
        // No swipe functionality for read-only view
    },

    refresh() {
        this.loadAreas();
    },

    destroy() {
        this.areas = [];
    }
};

// Register module
if (window.App) {
    App.registerModule('areaListing', AreaListingModule);
}

window.AreaListingModule = AreaListingModule;
