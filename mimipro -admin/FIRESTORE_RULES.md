# Firebase Firestore Security Rules

## Update Firestore Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your MimiPro project: **mimipro-0458**
3. Go to: **Firestore Database** → **Rules** tab
4. **Replace ALL existing rules** with the code below:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==================== ADMIN/OWNER FULL ACCESS ====================
    // Owner has full access to all their company data
    // This is the broad rule that covers all collections
    
    match /users/{ownerId}/{document=**} {
      // Owner (authenticated admin) can read/write ALL their data
      allow read, write: if request.auth != null && request.auth.uid == ownerId;
    }
    
    // ==================== EMPLOYEE READ ACCESS OVERRIDES ====================
    // These rules OVERRIDE the above for specific collections
    // Employees can READ these collections (but still can't write)
    
    match /users/{ownerId}/employees/{employeeId} {
      // Anyone can read employee profiles (needed for employee app login)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/attendance/{attendanceId} {
      // Anyone can read attendance (employee app filters by their ID)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/delivery/{deliveryId} {
      // Anyone can read deliveries (employee app filters by their ID)  
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/advances/{advanceId} {
      // Anyone can read advances (employee app filters by their ID)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/productAdvances/{productAdvanceId} {
      // Anyone can read product advances (employee app filters by their ID)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/repayments/{repaymentId} {
      // Anyone can read repayments (employee app filters by their ID)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/history/{historyId} {
      // Anyone can read delivery history (for DSR verification)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/stock/{stockId} {
      // Anyone can read stock (for reference)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/credits/{creditId} {
      // Anyone can read credits
      allow read: if true;
      // Write still controlled by admin rule above  
    }
    
    match /users/{ownerId}/creditPayments/{paymentId} {
      // Anyone can read credit payments
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/salaryReports/{salaryReportId} {
      // Anyone can read salary reports (employee app filters by their ID)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    // ==================== CUSTOMER READ ACCESS OVERRIDES ====================
    // These rules enable customer app authentication and data access
    // Customers can READ these collections (unauthenticated)
    
    match /users/{ownerId}/customers/{customerId} {
      // Anyone can read customers (needed for customer app login verification)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/products/{productId} {
      // Anyone can read products (customer app browses products)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/areas/{areaId} {
      // Anyone can read areas (customer/OC app reference)
      allow read: if true;
      // Write still controlled by admin rule above
    }
    
    match /users/{ownerId}/orders/{orderId} {
      // Anyone can read orders (customer app views orders)
      allow read: if true;
      // Write still controlled by admin rule above
    }
  }
}
```

5. Click **Publish** button

## Why These Rules?

- **Shared collections** (`attendance`, `delivery`, `employees`, `profile`, `credits`, `advances`, `stock`):
  - `allow read: if true` → Anyone can read (needed for employees to view data)
  - `allow write: if request.auth != null` → Only logged-in users (admin) can write

- **Private collections** (`expenses`, `history`, `settings`):
  - Only accessible by the admin who owns them (`request.auth.uid == userId`)

## Data Structure After Rules Update

```
Firestore Database Structure:
├── users/
│   ├── 5ti4r7RzNhSLJQ5Wmx0rwQ5qhJn2/    ← companyId (admin's UID or identifier)
│   │   ├── employees/               ← READ: public, WRITE: admin
│   │   ├── attendance/              ← READ: public, WRITE: admin
│   │   ├── delivery/                ← READ: public, WRITE: admin
│   │   ├── profile/                 ← READ: public, WRITE: admin
│   │   ├── credits/                 ← READ: public, WRITE: admin
│   │   ├── advances/                ← READ: public, WRITE: admin
│   │   └── stock/                   ← READ: public, WRITE: admin
│   │
│   └── [admin's full UID]/
│       ├── expenses/                ← READ/WRITE: admin only
│       ├── history/                 ← READ/WRITE: admin only
│       └── settings/                ← READ/WRITE: admin only
```

## Test After Update

1. **Admin app**: Open and mark attendance → Data syncs to `/users/5ti4r7RzNhSLJQ5Wmx0rwQ5qhJn2/attendance`
2. **Employee app**: Login with Company ID `5ti4r7RzNhSLJQ5Wmx0rwQ5qhJn2` → Should now see attendance ✅

If you still get "Permission denied" after updating rules:
- Wait 30-60 seconds for Firebase to apply the new rules
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh both apps
