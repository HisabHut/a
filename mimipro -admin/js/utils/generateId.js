/**
 * ID Generation Utilities
 */

const IdGenerator = {
    /**
     * Generate Employee ID with date, time and sequence
     * Format: EMP-YYYYMMDD-HHMMSS-XXXX
     * Example: EMP-20260213-143052-0001
     */
    generateEmployeeId(sequenceNumber = 1) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const sequence = String(sequenceNumber).padStart(4, '0');
        
        return `EMP-${year}${month}${day}-${hours}${minutes}${seconds}-${sequence}`;
    },

    /**
     * Generate Customer ID with date, time and sequence
     * Format: CUS-YYYYMMDD-HHMMSS-XXXX
     * Example: CUS-20260213-143052-0001
     */
    generateCustomerId(sequenceNumber = 1) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const sequence = String(sequenceNumber).padStart(4, '0');
        
        return `CUS-${year}${month}${day}-${hours}${minutes}${seconds}-${sequence}`;
    },

    /**
     * Auto-generate strong password
     */
    generatePassword(length = 12) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*-_';
        const all = uppercase + lowercase + numbers + symbols;
        
        let password = '';
        
        // Ensure at least one of each type
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Fill rest randomly
        for (let i = 4; i < length; i++) {
            password += all[Math.floor(Math.random() * all.length)];
        }
        
        // Shuffle
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
};

window.IdGenerator = IdGenerator;
