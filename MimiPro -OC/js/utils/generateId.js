/**
 * ID Generation Utilities
 */

const IdGenerator = {
    /**
     * Generate Employee ID with date, time and sequence
     * Format: EMP-YYYYMMDD-HHMMSS-XXXX
     * Example: EMP-20260213-143052-0001
     * This ensures unique IDs even if multiple employees added same day
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
     * Alternative format with short date and time
     * Format: EMP-YYMMDD-HHMMSS-XXXX
     * Example: EMP-250213-143052-0001
     */
    generateEmployeeIdShort(sequenceNumber = 1) {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
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
     * This ensures unique IDs even if multiple customers added same day
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
     * Generate unique ID with timestamp and random component
     * Format: PREFIX-TIMESTAMP-RANDOM
     * Example: CUS-1707849652-A7K9X2
     * Most reliable for guaranteed uniqueness
     */
    generateUniqueId(prefix = 'ID') {
        const timestamp = Date.now(); // milliseconds since epoch
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    },

    /**
     * Generate Product ID with date, time and sequence
     * Format: PRD-YYYYMMDD-HHMMSS-XXXX
     * Example: PRD-20260213-143052-0001
     */
    generateProductId(sequenceNumber = 1) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const sequence = String(sequenceNumber).padStart(4, '0');
        
        return `PRD-${year}${month}${day}-${hours}${minutes}${seconds}-${sequence}`;
    },

    /**
     * Generate Order ID with date, time and sequence
     * Format: ORD-YYYYMMDD-HHMMSS-XXXX
     * Example: ORD-20260213-143052-0001
     */
    generateOrderId(sequenceNumber = 1) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const sequence = String(sequenceNumber).padStart(4, '0');
        
        return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${sequence}`;
    },

    /**
     * Get sequence number for today
     * Counts how many IDs were created today
     */
    async getTodaySequence(prefix = 'EMP') {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayDate = `${year}${month}${day}`;
            
            // Assuming employees or customers table exists
            let allRecords = [];
            if (prefix === 'EMP') {
                allRecords = await DB.getAll('employees') || [];
            } else if (prefix === 'CUS') {
                allRecords = await DB.getAll('customers') || [];
            } else if (prefix === 'PRD') {
                allRecords = await DB.getAll('products') || [];
            }
            
            // Count records created today with this prefix
            const todayRecords = allRecords.filter(record => {
                const recordId = record.employeeId || record.customerId || record.productId || '';
                return recordId.includes(todayDate);
            });
            
            return todayRecords.length + 1;
        } catch (error) {
            console.error('Error getting sequence:', error);
            return 1;
        }
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
