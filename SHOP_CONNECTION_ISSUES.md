# Shop Control & Customer App Connection Issues

## 🚨 Critical Problems Found

### Problem 1: Products NOT Synced to Firestore
**Location:** `MimiPro -OC/js/db/sync.js` (line 524)
```javascript
async pushToCloud(ownerId, storeName, data) {
    // Upload disabled - Download only mode
    return;
}
```
**Issue:** Upload to Firestore is completely disabled. Products created in Shop Control are ONLY stored in IndexedDB (local device) and never sent to cloud.

**Impact:** 
- Customers can't see products
- No data persistence across devices
- No real-time updates

---

### Problem 2: Missing `active` Flag on Products
**Location:** `MimiPro -OC/js/modules/shop-control.js` (line 451-490)
```javascript
const productData = {
    name,
    price,
    stock,
    description,
    updatedAt: new Date().toISOString()
    // ❌ Missing: active: true
};
```

**Issue:** Customer App filters products with:
```javascript
.where('active', '==', true)  // MimiPro -C/customer.js line 110
```

Products created in Shop Control don't have this field, so even if they reach Firestore, customers won't see them.

**Impact:** 
- 0 products visible to customers
- Silent failure (no error, just empty product list)

---

### Problem 3: No Upload Trigger on Product Save
**Location:** `MimiPro -OC/js/modules/shop-control.js` (line 474, 480)
```javascript
await DB.add('products', productData);  // Only IndexedDB
// ❌ Missing: sync to Firestore
```

**Issue:** When products are created/edited, only local IndexedDB is updated. No code calls Firestore push.

---

## 📊 Data Flow Comparison

### Current (BROKEN)
```
Shop Control (OC)
    ↓
IndexedDB (LOCAL ONLY)
    ✗ Not synced to Firestore
    ✗ Customers app can't see data
```

### Required (FIXED)
```
Shop Control (OC)
    ↓
IndexedDB (local cache)
    ↓
Firestore → /users/{companyId}/products
    ↓
Customer App reads with WHERE active=true
    ↓
Customers see products
```

---

## 🔧 Required Fixes

### Fix 1: Enable Product Upload to Firestore
Update `sync.js` `pushToCloud()` to actually upload products.

### Fix 2: Add `active: true` to Product Data
Add `active: true` when creating products in Shop Control.

### Fix 3: Trigger Upload After Save
Call Firestore sync after saving products in Shop Control.

### Fix 4: Add Product Activation UI
Allow toggling products between `active: true/false` in Shop Control to control visibility.

---

## ✅ Verification Paths

**Path in Firestore (Customer looks here):**
```
/users/{companyId}/products
  └─ {productId}
      ├─ name: "..."
      ├─ price: 100
      ├─ stock: 50
      ├─ active: true  ← MUST BE TRUE
      └─ description: "..."
```

**Path in IndexedDB (OC uses this):**
```
MimiProDB (IndexedDB)
  └─ products
      └─ {productId}
          ├─ name: "..."
          ├─ price: 100
          ├─ stock: 50
          ├─ active: true  ← ALSO NEEDED
          └─ description: "..."
```

---

## 🎯 Summary

| Issue | Severity | Cause | Impact |
|-------|----------|-------|--------|
| Upload disabled | 🔴 CRITICAL | `pushToCloud` returns without uploading | Products don't reach Firestore |
| Missing `active` flag | 🔴 CRITICAL | Not included in product data | Customers can't filter products |
| No sync trigger | 🟡 HIGH | Shop Control doesn't call sync | Data not pushed to cloud |
| No UI to toggle active | 🟡 MEDIUM | No way to hide/show products | Can't control product visibility |
