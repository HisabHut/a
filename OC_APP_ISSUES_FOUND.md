# Order Center (OC) App - Issues Found 🚨

## Issue 1: Customer Sync Failing (CRITICAL)
**Console Output:**
```
⚠️ Skipping customer 4 - missing customerId or password
⚠️ Skipping customer 5 - missing customerId or password
⚠️ Skipping customer 6 - missing customerId or password
⚠️ Skipping customer 7 - missing customerId or password
⚠️ Skipping customer 8 - missing customerId or password
✓ Customer upload complete: 0/5 uploaded
```

**Root Cause:**
- Location: `sync.js` line 408
- Code expects: `customer.loginPassword` field
- Reality: Customers stored with `passwordHash` (hashed) instead
- After password is hashed in admin app, plain password is discarded (correct for security)
- When sync tries to upload, it checks for `loginPassword` which doesn't exist

**Code Location (sync.js):**
```javascript
if (!customer.customerId || !customer.loginPassword) {
    console.warn(`⏭️  Skipping customer ${customer.id} - missing customerId or password`);
    continue;
}
```

**Actual Customer Data (what's stored):**
```javascript
{
    id: 1,
    customerId: "CUST-001",
    name: "Customer Name",
    mobile: "01XXXXXXXXX",
    area: "Area Name",
    passwordHash: "a94a8fe5c...",  // ← SHA-256 hash, not plain password
    status: "active",
    active: true,
    createdAt: "2024-02-17T..."
}
```

**Why This Matters:**
- 0 customers are syncing to Firestore
- OC app can't see customer data from admin app
- Download will fail because customer collection in Firestore is empty

---

## Issue 2: Product Download Not Merging (CRITICAL)
**Console Output:**
```
✓ Retrieved 27 items from products
✓ Downloaded 27 items from products
✓ Download complete: 0 items merged  ← PROBLEM!
```

**Root Cause:**
- Location: `sync.js` line 505
- Products are downloaded (27) but 0 are merged into IndexedDB
- Likely cause: ID type mismatch or lookup failure

**Problem Code (sync.js downloadAndMerge):**
```javascript
for (const cloudItem of cloudItems) {
    try {
        const localItem = await DB.getById(storeName, cloudItem.id);
        
        // cloudItem.id = "1" (string from Firestore document ID)
        // localItem lookup might fail because:
        // - IndexedDB stored numeric keys (1, 2, 3) from autoIncrement
        // - Firestore has string IDs ("1", "2", "3")
        // - Type mismatch causes getById to return null/undefined
        
        if (!localItem || this.isCloudNewer(cloudItem, localItem)) {
            await DB.update(storeName, { ...cloudItem, synced: true });
            downloadCount++;  // ← downloadCount stays = 0
        }
    } catch (itemError) {
        console.error(`❌ Failed to merge ${storeName}/${cloudItem.id}:`, itemError);
    }
}
```

**Why Downloads Fail:**
1. Shop Control creates products with numeric IDs: `product.id = 1` (autoIncrement)
2. We sync them to Firestore with string IDs: `.doc(String(product.id))` → `.doc("1")`
3. Firestore stores document ID as "1" (string)
4. When downloading, `cloudItem.id = "1"` (string)
5. `DB.getById(storeName, "1")` looks for key "1" in IndexedDB
6. IndexedDB stored key was numeric `1`, not string `"1"`
7. Lookup fails → `localItem = undefined`
8. Code detects as new item, tries to update with string key
9. Update might fail or silently not merge

**Why This Matters:**
- Downloaded products (27) are not saved to local IndexedDB
- Shop Control won't have product data from cloud
- Any changes made in admin app don't reach OC app on download

---

## Issue 3: Unclear Error Messages
**Problem:**
- Downloads show "0 items merged" but no indication of WHY
- Silent failures make debugging hard
- Need better error logging in merge logic

**Missing Info:**
- Why did items not merge?
- Did lookup fail?
- Did update fail?
- What was the actual error?

---

## Summary Table

| Issue | Severity | Count Affected | Impact |
|-------|----------|-----------------|--------|
| Customers not syncing | 🔴 CRITICAL | 5 customers | 0/5 uploaded to cloud |
| Products not merging | 🔴 CRITICAL | 27 products | 0/27 merged to local |
| ID type mismatch | 🔴 ROOT CAUSE | All downloads | Lookup failures |
| Missing loginPassword | 🔴 ROOT CAUSE | All customers | Sync validation fails |

---

## How to Verify

1. **Check Admin App Console:**
   - Create a customer with name "TestCust" and password "test123"
   - Check Firestore for `/users/{companyId}/customers/`
   - Should see customer with `passwordHash` field

2. **Check OC App Console:**
   - Customer shows in sync with "Skipping..." message
   - Customers not uploading to cloud

3. **Check Download Issue:**
   - Go to Firestore and manually create a test product in `/users/{companyId}/products/`
   - Click "Sync Now" in OC app
   - Check IndexedDB: product won't be there
   - Console shows "0 items merged"

---

## Data Type Reference

**Numeric IDs (from autoIncrement):**
```javascript
// Created in shop-control.js
const id = await DB.add('products', productData);
// Returns: 1, 2, 3 (numbers)
```

**String IDs (from Firestore documents):**
```javascript
// Retrieved from Firestore
id: doc.id,  // Returns "1", "2", "3" (strings)
```

**The Conflict:**
```
IndexedDB key: 1 (number)
Firestore document ID: "1" (string)
Comparison: 1 !== "1" (in strict equality)
```
