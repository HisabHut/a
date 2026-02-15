/**
 * OC App Authentication
 * Company/Admin authentication using Company ID and password
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwlN548N9A0uRKiRGdvxmoASFCfJtvmo0",
    authDomain: "mimipro-0458.firebaseapp.com",
    projectId: "mimipro-0458",
    storageBucket: "mimipro-0458.firebasestorage.app",
    messagingSenderId: "414929851648",
    appId: "1:414929851648:web:535b52279d5e894bfd8fe5"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('companySession');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            // Verify session is valid
            if (sessionData.companyId) {
                console.log('✅ Existing session found, redirecting to app...');
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.error('Invalid session data:', error);
            localStorage.removeItem('companySession');
        }
    }
});

// SHA-256 Hash Function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Show Error Message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const companyId = document.getElementById('companyId').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginSpinner = document.getElementById('loginSpinner');
        
        if (!companyId || !password) {
            showError('Please enter Company ID and Password');
            return;
        }
        
        // Show loading state
        loginBtn.disabled = true;
        loginBtnText.textContent = '';
        loginSpinner.style.display = 'block';
        
        try {
            // Hash the password
            const passwordHash = await hashPassword(password);
            console.log('🔐 Password hash generated');
            
            // Query Firestore for company
            console.log(`📍 Querying company: ${companyId}`);
            const companyDoc = await db.collection('users').doc(companyId).get();
            
            if (!companyDoc.exists) {
                console.error('❌ Company not found:', companyId);
                showError('Invalid Company ID or Password');
                loginBtn.disabled = false;
                loginBtnText.textContent = 'Login';
                loginSpinner.style.display = 'none';
                return;
            }
            
            const companyData = companyDoc.data();
            console.log('✅ Company found');
            
            // Verify password
            console.log('🔒 Verifying password...');
            
            if (!companyData.passwordHash) {
                console.error('❌ Error: Company record has no password hash!');
                showError('Account configuration error. Contact administrator.');
                loginBtn.disabled = false;
                loginBtnText.textContent = 'Login';
                loginSpinner.style.display = 'none';
                return;
            }
            
            if (companyData.passwordHash !== passwordHash) {
                console.error('❌ Password mismatch');
                showError('Invalid Company ID or Password');
                loginBtn.disabled = false;
                loginBtnText.textContent = 'Login';
                loginSpinner.style.display = 'none';
                return;
            }
            
            console.log('✅ Password verified');
            
            // Create session
            const session = {
                companyId: companyId,
                name: companyData.name || 'Company',
                email: companyData.email || '',
                phone: companyData.phone || '',
                loginTime: new Date().toISOString()
            };
            
            // Store session in localStorage
            localStorage.setItem('companySession', JSON.stringify(session));
            console.log('💾 Session saved');
            
            // Redirect to app
            console.log('✅ Login successful, redirecting...');
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('❌ Login error:', error);
            showError('Login failed: ' + error.message);
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Login';
            loginSpinner.style.display = 'none';
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem('companySession');
    window.location.href = 'login.html';
}

// Check session helper
function getCompanySession() {
    const sessionData = localStorage.getItem('companySession');
    if (!sessionData) return null;
    
    try {
        return JSON.parse(sessionData);
    } catch (error) {
        console.error('Session parse error:', error);
        return null;
    }
}

// Require authentication
function requireAuth() {
    const session = getCompanySession();
    if (!session) {
        window.location.href = 'login.html';
    }
    return session;
}

// Redirect if unauthorized
if (window.location.pathname.includes('index.html')) {
    requireAuth();
}
