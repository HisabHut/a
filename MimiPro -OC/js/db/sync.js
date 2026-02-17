/**
 * Cloud Sync Module - Backup & Restore Model
 * 
 * This implements a backup+restore sync model (NOT real-time)
 * Sync happens:
 * - On app launch
 * - On manual "Sync Now" button click
 * - Owner device only
 * 
 * Firestore Structure:
 * /users/{ownerId}/  (ownerId = admin's Firebase Auth UID)
 *   /employees/{employeeId}
 *   /attendance/{attendanceId}
 *   /advances/{advanceId}
 *   /delivery/{deliveryId}
 *   ... etc
 * 
 * Note: "users" collection is used for compatibility with existing data.
 * Each user document represents an owner/company.
 * 
 * Key Features:
 * - Bidirectional sync (upload changed, download newer)
 * - Conflict resolution (cloud newer wins)
 * - Soft deletes (deleted: true flag)
 * - No real-time listeners
 * - Source of truth: Firestore = backup, IndexedDB = primary
 */

const SyncModule = {
    currentUser: null,
    syncEnabled: false,
    isSyncing: false,
    lastSyncTime: null,

    /**
     * Initialize sync module and listen to auth state changes
     */
    async init() {
        if (typeof window.firebase === 'undefined' || !window.FirebaseAuth) {
            console.warn('⚠️ Firebase not available, sync disabled');
            return;
        }

        // Listen to auth state changes
        window.FirebaseAuth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            
            if (user) {
                console.log('✅ User logged in:', user.email);
                this.syncEnabled = true;
                
                // Create company session from Firebase Auth UID
                const companySession = {
                    companyId: user.uid,
                    email: user.email,
                    createdAt: new Date().toISOString()
                };
                
                localStorage.setItem('companySession', JSON.stringify(companySession));
                console.log('💾 Company session created:', companySession.companyId);
                
                // Update sync indicator
                this.updateSyncIndicator('pending');
                
                if (window.App) {
                    App.showToast(`Signed in as ${user.email}`, 'success');
                }
            } else {
                console.log('❌ User logged out');
                this.syncEnabled = false;
                
                // Clear company session
                localStorage.removeItem('companySession');
                console.log('🔓 Company session cleared');
                
                // Reset sync indicator
                this.updateSyncIndicator('disabled');
                
                if (window.App) {
                    App.showToast('Signed out', 'info');
                }
            }
        });
    },

    /**
     * Check sync status and update UI indicator
     */
    async checkSyncStatus() {
        // Check for Firebase Auth user or company session
        const currentUser = this.currentUser || window.firebase?.auth?.currentUser;
        const sessionStr = localStorage.getItem('companySession');
        
        if (!this.syncEnabled || (!currentUser && !sessionStr)) {
            this.updateSyncIndicator('disabled');
            return { hasUnsyncedData: false, count: 0 };
        }

        try {
            const stores = Object.values(DB.stores);
            let unsyncedCount = 0;

            for (const storeName of stores) {
                try {
                    const allData = await DB.getAll(storeName, true); // Include deleted
                    const unsynced = allData.filter(item => !item.synced);
                    unsyncedCount += unsynced.length;
                } catch (error) {
                    console.error(`Error checking ${storeName}:`, error);
                }
            }

            if (unsyncedCount > 0) {
                this.updateSyncIndicator('pending', unsyncedCount);
                return { hasUnsyncedData: true, count: unsyncedCount };
            } else {
                this.updateSyncIndicator('synced');
                return { hasUnsyncedData: false, count: 0 };
            }
        } catch (error) {
            console.error('Error checking sync status:', error);
            this.updateSyncIndicator('error');
            return { hasUnsyncedData: false, count: 0 };
        }
    },

    /**
     * Update sync button visual indicator
     */
    updateSyncIndicator(status, count = 0) {
        const syncBtn = document.getElementById('syncBtn');
        const syncIcon = document.getElementById('syncIcon');
        
        if (!syncBtn || !syncIcon) return;

        // Remove all status classes
        syncBtn.classList.remove('sync-synced', 'sync-pending', 'sync-syncing', 'sync-disabled', 'sync-error');

        // Add appropriate class
        switch (status) {
            case 'synced':
                syncBtn.classList.add('sync-synced');
                syncBtn.title = 'All data synced';
                break;
            case 'pending':
                syncBtn.classList.add('sync-pending');
                syncBtn.title = `${count} item${count !== 1 ? 's' : ''} pending sync`;
                break;
            case 'syncing':
                syncBtn.classList.add('sync-syncing');
                syncBtn.title = 'Syncing...';
                break;
            case 'error':
                syncBtn.classList.add('sync-error');
                syncBtn.title = 'Sync error - click to retry';
                break;
            case 'disabled':
            default:
                syncBtn.classList.add('sync-disabled');
                syncBtn.title = 'Sign in to sync';
                break;
        }
    },

    /**
     * Sign up new user with email and password
     */
    async signUp(email, password) {
        try {
            const userCredential = await window.FirebaseAuth.createUserWithEmailAndPassword(email, password);
            console.log('✅ User created:', userCredential.user.uid);
            
            if (window.App) {
                App.showToast('Account created successfully!', 'success');
            }
            
            return userCredential.user;
        } catch (error) {
            console.error('❌ Sign up error:', error);
            
            let errorMessage = 'Failed to create account';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            }
            
            if (window.App) {
                App.showToast(errorMessage, 'error');
            }
            throw error;
        }
    },

    /**
     * Sign in existing user
     */
    async signIn(email, password) {
        try {
            const userCredential = await window.FirebaseAuth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ User signed in:', user.uid);
            
            // Create company session from Firebase Auth UID
            const companySession = {
                companyId: user.uid,
                email: user.email,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('companySession', JSON.stringify(companySession));
            console.log('💾 Company session created:', companySession.companyId);
            
            // Enable sync
            this.syncEnabled = true;
            
            if (window.App) {
                App.showToast('Signed in successfully!', 'success');
            }
            
            return user;
        } catch (error) {
            console.error('❌ Sign in error:', error);
            
            let errorMessage = 'Failed to sign in';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'User not found';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }
            
            if (window.App) {
                App.showToast(errorMessage, 'error');
            }
            throw error;
        }
    },

    /**
     * Sign out current user
     */
    async signOut() {
        try {
            await window.FirebaseAuth.signOut();
            console.log('✅ User signed out');
            
            if (window.App) {
                App.showToast('Signed out successfully', 'success');
            }
        } catch (error) {
            console.error('❌ Sign out error:', error);
            
            if (window.App) {
                App.showToast('Failed to sign out', 'error');
            }
        }
    },

    /**
     * Main sync function - called manually
     * Implements backup + restore model
     * Uses company ID from Firebase Auth or session
     */
    async syncNow() {
        // Get company ID from Firebase Auth user or session
        const currentUser = this.currentUser || window.firebase?.auth?.currentUser;
        if (!currentUser && !this.syncEnabled) {
            if (window.App) {
                App.showToast('Please login to sync', 'warning');
            }
            return;
        }
        
        let companyId;
        
        // Use Firebase Auth UID as Company ID
        if (currentUser && currentUser.uid) {
            companyId = currentUser.uid;
        } else {
            // Fallback to session
            const sessionStr = localStorage.getItem('companySession');
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    companyId = session.companyId;
                } catch (error) {
                    console.error('Invalid session:', error);
                    if (window.App) {
                        App.showToast('Invalid session', 'error');
                    }
                    return;
                }
            }
        }
        
        if (!companyId) {
            if (window.App) {
                App.showToast('Company ID not found', 'warning');
            }
            return;
        }

        if (this.isSyncing) {
            console.log('⚠️ Sync already in progress');
            return;
        }

        this.isSyncing = true;
        this.updateSyncIndicator('syncing');

        try {
            console.log('🔄 Starting sync (Upload + Download)...');
            
            if (window.App) {
                App.showToast('Syncing data...', 'info');
            }

            console.log('🔑 Company ID:', companyId);
            
            // Upload customer credentials to Firestore
            console.log('⬆️  Uploading customer credentials...');
            await this.uploadCustomerCredentials(companyId);
            
            // Download cloud data
            console.log('⬇️  Downloading data from cloud...');
            await this.downloadAndMerge(companyId);
            
            this.lastSyncTime = new Date();
            localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
            
            console.log('✅ Sync completed successfully');
            
            if (window.App) {
                App.showToast('Sync complete!', 'success');
            }
            
            // Update sync status after completion
            await this.checkSyncStatus();
            
        } catch (error) {
            console.error('❌ Sync failed:', error);
            console.error('Error details:', error.code, error.message);
            
            let errorMessage = 'Sync failed';
            
            if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied - Check Firestore rules';
                console.error('🔥 Firestore Rules Error: Make sure you have set the security rules in Firebase Console');
            } else if (error.code === 'unavailable') {
                errorMessage = 'Firebase unavailable - Check connection';
            } else if (error.message) {
                errorMessage = `Sync error: ${error.message}`;
            }
            
            if (window.App) {
                App.showToast(errorMessage, 'error');
            }
            
            this.updateSyncIndicator('error');
            
        } finally {
            this.isSyncing = false;
        }
    },

    /**
     * Upload local changes to Firestore
     */
    async uploadLocalChanges(companyId) {
        console.log('⏭️ Upload sync started');
        return;
    },

    /**
     * Hash password using SHA-256
     */
    async hashPassword(password) {
        if (!password) return '';
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Upload customer credentials to Firestore
     */
    async uploadCustomerCredentials(companyId) {
        try {
            console.log('📤 Uploading customer credentials to Firestore...');
            
            // Get all customers from local DB
            const customers = await DB.getAll('customers');
            console.log(`📦 Found ${customers.length} customers to sync`);
            
            let uploadCount = 0;
            
            for (const customer of customers) {
                try {
                    // Only upload customers that have required fields
                    if (!customer.customerId || (!customer.passwordHash && !customer.loginPassword)) {
                        console.warn(`⏭️  Skipping customer ${customer.id} - missing customerId or password`);
                        continue;
                    }
                    
                    // Use passwordHash if available, otherwise assume loginPassword is plain and hash it
                    const passwordHash = customer.passwordHash || await this.hashPassword(customer.loginPassword);
                    console.log(`🔐 Using password hash for ${customer.customerId}`);
                    
                    // Prepare customer data for Firestore
                    const firestoreData = {
                        id: customer.id,
                        customerId: customer.customerId,
                        name: customer.name || '',
                        email: customer.email || '',
                        phone: customer.mobile || customer.phone || '',
                        passwordHash: passwordHash,
                        totalOrders: customer.totalOrders || 0,
                        totalSpent: customer.totalSpent || 0,
                        availableCredit: customer.availableCredit || 0,
                        issuedCredit: customer.issuedCredit || 0,
                        usedCredit: customer.usedCredit || 0,
                        area: customer.area || '',
                        status: customer.status || 'active',
                        active: customer.active !== false,
                        createdAt: customer.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    // Upload to Firestore using customerId as document ID (for easy lookup)
                    await this.uploadCustomerToFirestore(companyId, customer.customerId, firestoreData);
                    uploadCount++;
                    console.log(`✅ Uploaded customer: ${customer.customerId}`);
                    
                } catch (error) {
                    console.error(`❌ Failed to upload customer ${customer.id}:`, error);
                }
            }
            
            console.log(`✅ Customer upload complete: ${uploadCount}/${customers.length} uploaded`);
            
        } catch (error) {
            console.error('❌ Error uploading customer credentials:', error);
            throw error;
        }
    },

    /**
     * Upload single customer to Firestore
     */
    async uploadCustomerToFirestore(companyId, customerId, data) {
        try {
            const db = window.firebase.firestore();
            
            await db.collection('users')
                .doc(companyId)
                .collection('customers')
                .doc(String(customerId))
                .set(data, { merge: true });
                
            console.log(`📤 Customer ${customerId} synced to Firestore`);
            
        } catch (error) {
            console.error(`❌ Failed to sync customer to Firestore:`, error);
            throw error;
        }
    },

    /**
     * Download data from Firestore and merge with local (Restore)
     */
    async downloadAndMerge(companyId) {
        console.log('⬇️ Downloading from cloud...');
        
        // Only sync specific stores (skip orders, credits during initial sync)
        const storesToSync = ['products', 'customers', 'areas'];
        let downloadCount = 0;

        for (const storeName of storesToSync) {
            try {
                // Download all items from this collection
                const cloudItems = await this.getAllFromCloud(companyId, storeName);
                
                if (!cloudItems || cloudItems.length === 0) {
                    console.log(`⬜ No items in ${storeName}`);
                    continue;
                }
                
                for (const cloudItem of cloudItems) {
                    try {
                        // Try to find local item - handle both numeric and string IDs
                        const normalizedId = isNaN(cloudItem.id) ? cloudItem.id : parseInt(cloudItem.id);
                        let localItem = await DB.getById(storeName, cloudItem.id);
                        
                        // If not found with original ID, try normalized version
                        if (!localItem && String(normalizedId) !== String(cloudItem.id)) {
                            localItem = await DB.getById(storeName, normalizedId);
                            console.log(`🔄 ID type mismatch resolved: "${cloudItem.id}" → ${normalizedId}`);
                        }
                        
                        // Download if:
                        // 1. Item doesn't exist locally, OR
                        // 2. Cloud is newer than local
                        if (!localItem || this.isCloudNewer(cloudItem, localItem)) {
                            // Ensure numeric ID for consistency in IndexedDB
                            const itemData = {
                                ...cloudItem,
                                id: normalizedId,  // Use numeric ID consistently
                                synced: true
                            };
                            
                            await DB.update(storeName, itemData);
                            downloadCount++;
                            console.log(`✅ Downloaded ${storeName}/${cloudItem.id} (id: ${normalizedId})`);
                        } else {
                            console.log(`⏭️ Skipped ${storeName}/${cloudItem.id} - local is newer`);
                        }
                    } catch (itemError) {
                        console.error(`❌ Failed to merge ${storeName}/${cloudItem.id}:`, itemError.message);
                    }
                }
                
                console.log(`⬇️ Downloaded ${cloudItems.length} items from ${storeName}, merged: ${downloadCount}`);
                
            } catch (storeError) {
                console.warn(`⚠️ Could not download from ${storeName}:`, storeError.message);
                // Continue with next store instead of failing
            }
        }

        console.log(`⬇️ Download complete: ${downloadCount} items merged`);
    },

    /**
     * Push single item to cloud
     */
    async pushToCloud(ownerId, storeName, data) {
        // Upload disabled - Download only mode
        return;
    },

    /**
     * Get single item from cloud
     */
    async getFromCloud(companyId, storeName, id) {
        try {
            const collectionPath = this.getCollectionPath(companyId, storeName);
            const db = window.firebase.firestore();
            
            const docRef = db.collection('users')
                .doc(companyId)
                .collection(collectionPath)
                .doc(String(id));

            const doc = await docRef.get();
            
            if (!doc.exists) {
                return null;
            }
            
            const data = doc.data();
            // Remove Firestore-specific fields
            const { syncedAt, ...cleanData } = data;
            
            return cleanData;
            
        } catch (error) {
            console.error(`❌ Failed to get ${storeName}/${id} from cloud:`, error);
            throw error;
        }
    },

    /**
     * Get all items from a cloud collection
     */
    async getAllFromCloud(companyId, storeName) {
        try {
            const collectionPath = this.getCollectionPath(companyId, storeName);
            const db = window.firebase.firestore();
            
            const snapshot = await db.collection('users')
                .doc(companyId)
                .collection(collectionPath)
                .limit(1000) // Limit to first 1000 docs
                .get();
            
            const items = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Keep the document id as the 'id' field
                items.push({
                    id: doc.id,
                    ...data
                });
            });
            
            console.log(`📖 Retrieved ${items.length} items from ${storeName}`);
            return items;
            
        } catch (error) {
            console.warn(`⚠️ Collection ${storeName} not found or error reading:`, error.message);
            // Return empty array instead of throwing - collection might not exist yet
            return [];
        }
    },

    /**
     * Get collection path for a store
     * Maps local store names to Firestore collection names
     */
    getCollectionPath(companyId, storeName) {
        // Map store names to Firestore collections
        const collectionMap = {
            'products': 'products',
            'customers': 'customers',
            'areas': 'areas'
        };
        
        return collectionMap[storeName] || storeName;
    },

    /**
     * Check if local data is newer than cloud data
     */
    isLocalNewer(localData, cloudData) {
        const localTime = localData.updatedAt || localData.createdAt || '';
        const cloudTime = cloudData.updatedAt || cloudData.createdAt || '';
        return localTime > cloudTime;
    },

    /**
     * Check if cloud data is newer than local data
     */
    isCloudNewer(cloudData, localData) {
        const cloudTime = cloudData.updatedAt || cloudData.createdAt || '';
        const localTime = localData.updatedAt || localData.createdAt || '';
        return cloudTime > localTime;
    },

    /**
     * Get last sync time formatted
     */
    getLastSyncTime() {
        if (!this.lastSyncTime) {
            const stored = localStorage.getItem('lastSyncTime');
            if (stored) {
                this.lastSyncTime = new Date(stored);
            }
        }
        
        if (!this.lastSyncTime) {
            return 'Never';
        }
        
        const now = new Date();
        const diffMs = now - this.lastSyncTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        return this.lastSyncTime.toLocaleDateString();
    }
};

// Initialize sync module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => SyncModule.init(), 1000);
    });
} else {
    setTimeout(() => SyncModule.init(), 1000);
}

// Export globally
window.SyncModule = SyncModule;
