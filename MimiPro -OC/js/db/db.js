/**
 * MimiPro - IndexedDB Setup
 */

const DB = {
    name: 'MimiProDB',
    version: 10,
    instance: null,

    stores: {
        products: 'products',
        customers: 'customers',
        areas: 'areas',
        orders: 'orders',
        credits: 'credits'
    },

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.instance = request.result;
                
                // Handle version change (e.g., when another tab opens with newer version)
                this.instance.onversionchange = () => {
                    console.warn('⚠️ Database version changed, closing connection');
                    this.instance.close();
                    this.instance = null;
                };
                
                // Handle unexpected connection close
                this.instance.onclose = () => {
                    console.warn('⚠️ Database connection closed unexpectedly');
                    this.instance = null;
                };
                
                console.log('✅ Database initialized');
                resolve(this.instance);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;

                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    productStore.createIndex('name', 'name', { unique: false });
                    productStore.createIndex('active', 'active', { unique: false });
                }

                // Customers store
                if (!db.objectStoreNames.contains('customers')) {
                    const customerStore = db.createObjectStore('customers', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    customerStore.createIndex('name', 'name', { unique: false });
                    customerStore.createIndex('area', 'area', { unique: false });
                }

                // Areas store
                if (!db.objectStoreNames.contains('areas')) {
                    const areaStore = db.createObjectStore('areas', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    areaStore.createIndex('name', 'name', { unique: false });
                    areaStore.createIndex('active', 'active', { unique: false });
                }

                // Orders store
                if (!db.objectStoreNames.contains('orders')) {
                    const orderStore = db.createObjectStore('orders', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    orderStore.createIndex('customerId', 'customerId', { unique: false });
                    orderStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Credits store
                if (!db.objectStoreNames.contains('credits')) {
                    const creditStore = db.createObjectStore('credits', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    creditStore.createIndex('customerId', 'customerId', { unique: false });
                    creditStore.createIndex('date', 'date', { unique: false });
                }

                console.log('📦 Database schema created');
            };
        });
    },

    // Generic CRUD operations
    async ensureConnection() {
        // If no instance or instance is not valid, reinitialize
        if (!this.instance || (this.instance && !this.instance.objectStoreNames)) {
            console.log('🔄 Reinitializing database connection...');
            await this.init();
        }
        return this.instance;
    },

    async getAll(storeName, includeDeleted = false) {
        await this.ensureConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.instance.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                request.onsuccess = () => {
                    const results = request.result;
                    // Filter out deleted records unless explicitly requested
                    const filtered = includeDeleted ? results : results.filter(item => !item.deleted);
                    resolve(filtered);
                };
                request.onerror = () => reject(request.error);
            } catch (error) {
                console.error('❌ Transaction error:', error);
                reject(error);
            }
        });
    },

    async getById(storeName, id) {
        await this.ensureConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.instance.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (error) {
                console.error('❌ Transaction error:', error);
                reject(error);
            }
        });
    },

    async add(storeName, data) {
        await this.ensureConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.instance.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const now = new Date().toISOString();
                const request = store.add({
                    ...data,
                    createdAt: now,
                    updatedAt: now,
                    synced: false,
                    deleted: false,
                    syncVersion: 1
                });
                request.onsuccess = async () => {
                    const id = request.result;
                    
                    // Update sync indicator
                    if (window.SyncModule) {
                        setTimeout(() => window.SyncModule.checkSyncStatus(), 100);
                    }
                    
                    resolve(id);
                };
                request.onerror = () => reject(request.error);
            } catch (error) {
                console.error('❌ Transaction error:', error);
                reject(error);
            }
        });
    },

    async update(storeName, data) {
        await this.ensureConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.instance.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put({
                    ...data,
                    updatedAt: new Date().toISOString(),
                    synced: false,
                    deleted: data.deleted || false,
                    syncVersion: (data.syncVersion || 0) + 1
                });
                request.onsuccess = async () => {
                    // Update sync indicator
                    if (window.SyncModule) {
                        setTimeout(() => window.SyncModule.checkSyncStatus(), 100);
                    }
                    
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            } catch (error) {
                console.error('❌ Transaction error:', error);
                reject(error);
            }
        });
    },

    async delete(storeName, id) {
        await this.ensureConnection();
        // Implement soft delete - mark as deleted instead of hard delete
        const existing = await this.getById(storeName, id);
        if (!existing) {
            return Promise.resolve();
        }
        
        return this.update(storeName, {
            ...existing,
            deleted: true,
            updatedAt: new Date().toISOString(),
            synced: false,
            syncVersion: (existing.syncVersion || 0) + 1
        });
    },

    async clear(storeName) {
        await this.ensureConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.instance.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            } catch (error) {
                console.error('❌ Transaction error:', error);
                reject(error);
            }
        });
    },

    async put(storeName, data) {
        await this.ensureConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.instance.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (error) {
                console.error('❌ Transaction error:', error);
                reject(error);
            }
        });
    },

    async query(storeName, indexName, value) {
        await this.ensureConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.instance.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const index = store.index(indexName);
                const request = index.getAll(value);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (error) {
                console.error('❌ Transaction error:', error);
                reject(error);
            }
        });
    },

    // Helper methods for specific stores
    async getAllAreas() {
        return await this.getAll('areas');
    },

    async getAllCustomers() {
        return await this.getAll('customers');
    },

    async getAllProducts() {
        return await this.getAll('products');
    },

    async getAllOrders() {
        return await this.getAll('orders');
    },

    async getAllCredits() {
        return await this.getAll('credits');
    },

    async addCredit(creditData) {
        return await this.add('credits', creditData);
    },

    async updateCredit(creditData) {
        return await this.update('credits', creditData);
    }
};

// Initialize on load and make it available globally
let dbReady = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await DB.init();
        dbReady = true;
        console.log('✅ DB ready for use');
    });
} else {
    DB.init().then(() => {
        dbReady = true;
        console.log('✅ DB ready for use');
    });
}

window.DB = DB;
