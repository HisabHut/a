# MimiPro Customer Authentication & Sync Setup

## Overview

This document explains how the MimiPro Customer App authenticates users using customer data synced from the OC (Operations Center) App via Firestore.

## Architecture

### Data Flow

```
OC App (IndexedDB)
    ↓
    └─→ Add/Edit Customers (with loginPassword)
        ↓
        └─→ [Sync Now] button triggered
            ↓
            └─→ SyncModule.syncNow()
                ↓
                └─→ uploadCustomerCredentials(companyId)
                    ↓
                    └─→ Hash loginPassword with SHA-256
                        ↓
                        └─→ Upload to Firestore: /users/{companyId}/customers/{customerId}
                            with passwordHash field
                            ↓
Customer App (Browser)
    ↓
    └─→ Login with Company ID, Customer ID, Password
        ↓
        └─→ App.handleLogin()
            ↓
            └─→ Hash entered password with SHA-256
                ↓
                └─→ Query Firestore: /users/{companyId}/customers/{customerId}
                    ↓
                    └─→ Compare entered passwordHash with stored passwordHash
                        ↓
                        └─→ If match: Create session & show app
                            If no match: Show "Invalid password" error
```

## Setup Steps

### 1. OC App Configuration

#### Session Requirement
Before syncing, ensure the company has an active session:
```javascript
// In OC app localStorage
localStorage.setItem('companySession', JSON.stringify({
    companyId: 'COMPANY_001',
    companyName: 'Company Name',
    email: 'admin@company.com',
    // ... other session data
}));
```

#### Customer Data Requirements
Each customer record in the OC app's IndexedDB must have:
- `id`: Unique identifier (will be used as Firestore document ID)
- `customerId`: Customer ID (display value)
- `loginPassword`: Plain text password (will be hashed before upload)
- `name`: Customer name (optional)
- `mobile` or `phone`: Contact number (optional)
- Other fields: area, status, etc. (optional)

### 2. Sync Process

#### Manual Sync
1. Open OC App
2. Click the **Sync** button (↔ icon) in the header
3. The app will:
   - Get `companyId` from localStorage session
   - Extract all customers from IndexedDB
   - Hash each customer's `loginPassword` using SHA-256
   - Upload customer records to Firestore with `passwordHash` field
   - Download any cloud data

#### Automatic Sync
- Occurs automatically when the OC app initializes (if company session exists)
- Can also be triggered by clicking the Sync button

#### Upload Details
Customer data uploaded to Firestore:
```
/users/{companyId}/customers/{customerId}
{
    id: "original_id",
    customerId: "CUST001",
    name: "Customer Name",
    phone: "1234567890",
    passwordHash: "sha256_hash_of_login_password",
    totalOrders: 0,
    totalSpent: 0,
    availableCredit: 0,
    issuedCredit: 0,
    usedCredit: 0,
    area: "North Delhi",
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 3. Customer App Login

#### Login Form Fields
1. **Company ID**: Must match the `companyId` in OC app's companySession
2. **Customer ID**: The customer's unique ID (used as document ID in Firestore)
3. **Password**: Plain text password (will be hashed for comparison)

#### Authentication Flow
1. Customer enters: Company ID, Customer ID, Password
2. Customer App:
   - Hashes the entered password with SHA-256
   - Queries Firestore: `db.collection('users').doc(companyId).collection('customers').doc(customerId)`
   - Compares entered passwordHash with stored passwordHash
   - If match: Creates session in localStorage and shows app
   - If no match: Shows error message

#### Session Storage
On successful login:
```javascript
localStorage.setItem('customerSession', JSON.stringify({
    companyId: "COMPANY_001",
    customerId: "CUST001",
    name: "Customer Name",
    email: "customer@example.com",
    phone: "1234567890",
    loginTime: "2024-01-01T12:00:00.000Z"
}));
```

## Testing Checklist

### Prerequisites
- [ ] Firestore project is set up (mimipro-0458)
- [ ] Firebase SDKs are loaded in both apps
- [ ] Security rules allow read/write to `/users/{companyId}/customers/`

### OC App Tests

- [ ] **Test 1: Check Company Session**
  1. Open OC App (index.html)
  2. Check browser console for session info
  3. Expected: Should see company session logged or be redirected to login if missing

- [ ] **Test 2: Create Test Customer**
  1. Navigate to Customer Listing in OC app
  2. Add a new customer with:
     - Name: "Test Customer"
     - Customer ID: "TEST001"
     - Login Password: "password123"
     - Other fields as needed
  3. Save customer to IndexedDB

- [ ] **Test 3: Manual Sync**
  1. Click "Sync" button in OC app header
  2. Monitor console for:
     - "📤 Uploading customer credentials..."
     - "✅ Uploaded customer: TEST001"
     - "⬇️  Download complete: X items"
  3. Check Firestore Console for new customer record

### Customer App Tests

- [ ] **Test 4: Login with Valid Credentials**
  1. Open Customer App (customer.html)
  2. Enter login credentials:
     - Company ID: (from OC session)
     - Customer ID: "TEST001"
     - Password: "password123"
  3. Click "Login"
  4. Expected: Should see dashboard with customer info

- [ ] **Test 5: Login with Invalid Password**
  1. Open Customer App (customer.html)
  2. Enter valid Company ID and Customer ID
  3. Enter wrong password
  4. Click "Login"
  5. Expected: Should see "Invalid password" error

- [ ] **Test 6: Login with Invalid Customer ID**
  1. Open Customer App (customer.html)
  2. Enter valid Company ID
  3. Enter non-existent Customer ID: "INVALID"
  4. Click "Login"
  5. Expected: Should see "Invalid Customer ID" error

## Firestore Security Rules

Required rules to allow the sync workflow:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{companyId} {
      // Allow the company to write customer data (OC app sync)
      match /customers/{customerId} {
        allow read, write: if request.auth != null &&
                            request.auth.token.email != null;
        // Or more permissive: allow read, write;
      }
      
      // Allow read access to products (for customer app)
      match /products/{productId} {
        allow read: if true;
        allow write: if false;
      }
    }
  }
}
```

**Note**: Update these rules in Firebase Console under Firestore → Rules

## Debugging Tips

### OC App Sync Issues

Check browser console for these messages:

**Success:**
```
🔄 Starting sync (Upload + Download)...
📤 Uploading customer credentials...
✅ Uploaded customer: CUST001
⬇️  Download complete: 5 items
✅ Sync completed successfully
```

**Errors:**
- `Please login to sync` - No company session in localStorage
- `Error uploading customer credentials` - Firestore permission denied or network issue
- `Failed to sync customer to Firestore` - Check Firestore rules

### Customer App Login Issues

Check browser console for these messages:

**Success:**
```
🔐 Password hash generated
✅ Customer authenticated
💾 Session saved
```

**Errors:**
- `Invalid Customer ID` - Customer document doesn't exist in Firestore
- `Invalid password` - Password hash doesn't match stored hash
- `Login failed: Error message` - Other authentication errors (check network/Firestore)

## Code References

### OC App - Key Files
- **js/db/sync.js**: `SyncModule.uploadCustomerCredentials()` and `SyncModule.hashPassword()`
- **js/app.js**: `App.onFirebaseReady()` calls `SyncModule.init()`
- **auth/company-auth.js**: Company authentication (optional, for company login)

### Customer App - Key Files
- **customer.js**: `App.handleLogin()` (login authentication logic)
- **customer.js**: `hashPassword()` (SHA-256 hashing)
- **customer.html**: Login form (Company ID, Customer ID, Password fields)

## Common Issues & Solutions

### Issue: "Invalid Customer ID" after sync

**Possible Causes:**
1. Customer ID in login doesn't match document ID in Firestore
2. Customer wasn't uploaded (check OC app sync logs)
3. Firestore read permissions denied

**Solutions:**
1. Verify the Customer ID matches exactly (case-sensitive)
2. Re-run sync in OC app and check console logs
3. Check Firestore security rules

### Issue: "Invalid password" with correct password

**Possible Causes:**
1. OC app password wasn't synced (password hashing failed)
2. Customer record in Firestore doesn't have `passwordHash` field
3. Password has special characters or encoding issues

**Solutions:**
1. Clear customer record in OC app, re-create with new password
2. Re-run sync and verify passwordHash field exists in Firestore
3. Test with simple ASCII password (letters, numbers only)

### Issue: Sync button shows "disabled"

**Possible Causes:**
1. No company session in localStorage
2. Firebase not initialized
3. SyncModule.init() wasn't called

**Solutions:**
1. Ensure OC app has valid company session before login
2. Check browser console for Firebase initialization errors
3. Manually call `SyncModule.init()` in browser console

## Next Steps

1. Set up Firestore security rules (see section above)
2. Test OC app sync with a test customer
3. Test Customer app login with synced credentials
4. Deploy to production

---

**Last Updated:** {CURRENT_DATE}
**Implementation Status:** ✅ Complete
