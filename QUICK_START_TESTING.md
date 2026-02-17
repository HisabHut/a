# Quick Start: Testing Customer App Sync

## 5-Minute Quick Test

### Step 1: Prepare OC App Session (OC App)
```javascript
// 1. Open OC App (index.html)
// 2. Open browser console (F12)
// 3. Paste and run:

localStorage.setItem('companySession', JSON.stringify({
    companyId: 'TEST_COMPANY_001',
    companyName: 'Test Company',
    email: 'admin@test.com',
    createdAt: new Date().toISOString()
}));

// 4. Reload OC App page
```

### Step 2: Create Test Customer (OC App)
```
1. Navigate to "Customer Listing" (side menu)
2. Click "Add Customer" (if button exists) or add manually
3. Enter:
   - Name: "John Customer"
   - Customer ID: "JOHN001"
   - Login Password: "test123456"
   - Mobile: "9999999999"
   - Area: "New Delhi"
4. Save customer
```

### Step 3: Sync Customer Data (OC App)
```
1. Click the Sync button (↔ icon) in header
2. Watch console for messages:
   ✅ "✅ Uploaded customer: JOHN001"
   ✅ "✅ Customer upload complete"
   ✅ "✅ Sync completed successfully"
3. Check Firestore Console:
   - Go to: https://firebase.google.com/console
   - Project: mimipro-0458
   - Collection: users → TEST_COMPANY_001 → customers → JOHN001
   - Verify "passwordHash" field exists
```

### Step 4: Test Customer App Login (Customer App)
```
1. Open Customer App (customer.html) in new tab
2. Enter login credentials:
   - Company ID: TEST_COMPANY_001
   - Customer ID: JOHN001
   - Password: test123456
3. Click "Login"
4. Expected result: See customer dashboard with "John Customer"
```

### Step 5: Verify Error Handling (Customer App)
```
Test Case 1 - Wrong Password:
1. Login form - Keep same Company ID & Customer ID
2. Enter wrong password: wrongpassword123
3. Expected: Error message "Invalid password"

Test Case 2 - Invalid Customer ID:
1. Login form - Keep same Company ID
2. Use wrong Customer ID: INVALID999
3. Expected: Error message "Invalid Customer ID"
```

## Console Logs to Expect

### Successful Sync (OC App Console)
```
🔄 Starting sync (Upload + Download)...
🔑 Company ID: TEST_COMPANY_001
⬆️  Uploading customer credentials...
📤 Uploading customer credentials to Firestore...
📦 Found 1 customers to sync
✅ Uploaded customer: JOHN001
✅ Customer upload complete: 1/1 uploaded
⬇️  Downloading data from cloud...
⬇️ Downloading from cloud...
⬇️ Download complete: 0 items merged
✅ Sync completed successfully
```

### Successful Login (Customer App Console)
```
🚀 Customer App initializing...
🔐 Password hash generated
✅ Customer authenticated
💾 Session saved
📄 DOM Content Loaded - Initializing App
```

## Firefox/Chrome DevTools

### To Check Firestore Data
```
1. Open DevTools (F12)
2. Go to Application tab
3. Left panel → Firestore
4. Path: users/TEST_COMPANY_001/customers/JOHN001
5. Should see fields:
   - customerId: "JOHN001"
   - name: "John Customer"
   - passwordHash: "abc123def456..." (long SHA-256 hex string)
   - phone: "9999999999"
   - area: "New Delhi"
```

### To Check localStorage
```
1. Open DevTools (F12)
2. Go to Application tab
3. Left panel → Local Storage
4. OC App: Look for "companySession" key
   Value: {"companyId":"TEST_COMPANY_001",...}
5. Customer App: Look for "customerSession" key after login
   Value: {"companyId":"TEST_COMPANY_001","customerId":"JOHN001",...}
```

## Troubleshooting Quick Fixes

### Sync Button Shows "Disabled"
**Fix**: Run this in OC App console:
```javascript
localStorage.setItem('companySession', JSON.stringify({
    companyId: 'TEST_COMPANY_001',
    companyName: 'Test Company'
}));
location.reload();
```

### "Invalid Customer ID" Error
**Fix**:
1. Make sure Customer ID in login form matches exactly (case-sensitive)
2. Verify customer was uploaded (check Firestore)
3. Run sync again in OC app

### "Invalid password" Error (with correct password)
**Fix**:
1. Delete customer from IndexedDB (OC App → DevTools → Application → IndexedDB → customers store)
2. Create new customer with simple password: "test123"
3. Re-sync
4. Try login with new customer

### Firestore "Permission Denied" Error
**Fix**: Set Firestore rules in Firebase Console:
```javascript
match /users/{companyId}/customers/{customerId} {
    allow read, write: if true;  // Temporary: Allow all
}
```

## Database Locations

### IndexedDB (OC App Local Storage)
- **Database**: MimiPro-DB
- **Store**: customers
- **Key Field**: id

### Firestore (Cloud)
- **Project**: mimipro-0458
- **Collection Path**: /users/{companyId}/customers/{customerId}
- **Document ID**: customerId

### localStorage (Browser Storage)
- **OC App Key**: companySession
- **Customer App Key**: customerSession

## Firebase Console URLs

```
Project: https://console.firebase.google.com/project/mimipro-0458
Firestore: https://console.firebase.google.com/project/mimipro-0458/firestore
Rules: https://console.firebase.google.com/project/mimipro-0458/firestore/rules
```

## Video Test Walkthrough

### Record This Sequence:
1. Show OC App with customer list
2. Click Sync button
3. Show console with success logs
4. Show Firestore Console with uploaded customer data
5. Show Customer App login form
6. Enter credentials and login
7. Show customer dashboard

## Quick Validation Checklist

- [ ] Company session exists in localStorage before sync
- [ ] OC app sync completes without errors
- [ ] Customer data appears in Firestore with passwordHash
- [ ] Customer app login succeeds with correct credentials
- [ ] Customer app shows error with wrong password
- [ ] Customer app shows error with invalid customer ID
- [ ] Customer dashboard displays customer name and info
- [ ] Logout clears token and session

## Common Test Data

```javascript
// OC App - Create multiple test customers
const testCustomers = [
    { id: '1', customerId: 'CUST001', name: 'Customer One', loginPassword: 'pass123', mobile: '1111111111' },
    { id: '2', customerId: 'CUST002', name: 'Customer Two', loginPassword: 'pass456', mobile: '2222222222' },
    { id: '3', customerId: 'CUST003', name: 'Customer Three', loginPassword: 'pass789', mobile: '3333333333' }
];

// Test company session
const testSession = {
    companyId: 'DEMO_COMPANY',
    companyName: 'Demo Company',
    email: 'admin@demo.com'
};
```

## Next Steps After Testing

1. ✅ Verify sync works reliably with real data
2. ✅ Test on mobile device
3. ✅ Verify Firestore costs are reasonable
4. ✅ Set final Firestore security rules
5. ✅ Deploy to production servers
6. ✅ Monitor login success/failure rates
7. ✅ Set up error alerting

---

**Last Updated**: January 2024
**Status**: Ready for Testing
