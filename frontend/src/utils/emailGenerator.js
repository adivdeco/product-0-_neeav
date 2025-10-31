// utils/emailGenerator.js

/**
 * Generates a unique email based on name and phone number
 * @param {string} name - Customer name
 * @param {string} phone - Phone number
 * @param {string} domain - Email domain (optional)
 * @returns {string} - Generated email address
 */
export const generateCustomerEmail = (name, phone, domain = 'gmail.com') => {
    if (!name) return '';

    // Clean and format the name
    const cleanName = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '.') // Replace spaces with dots
        .substring(0, 20); // Limit length

    // Extract last 4 digits of phone for uniqueness
    const phoneSuffix = phone ? phone.replace(/\D/g, '').slice(-4) : '';

    // Generate unique identifier (timestamp + random string)
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

    // Create email with name + phone suffix + unique identifier
    const emailLocalPart = phoneSuffix
        ? `${cleanName}.${phoneSuffix}.${uniqueId}`
        : `${cleanName}.${uniqueId}`;

    return `${emailLocalPart}@${domain}`;
};

/**
 * Alternative simpler version without unique IDs
 * Useful for more readable but still unique emails
 */
export const generateSimpleCustomerEmail = (name, phone, domain = 'store.com') => {
    if (!name) return '';

    const cleanName = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '.')
        .substring(0, 15);

    const phoneSuffix = phone ? phone.replace(/\D/g, '').slice(-4) : '0000';

    return `${cleanName}.${phoneSuffix}@${domain}`;
};

/**
 * Validates if we should auto-generate email
 * @param {string} currentEmail - Current email value
 * @param {boolean} isCustomerSelected - If customer is selected from DB
 * @returns {boolean}
 */
export const shouldGenerateEmail = (currentEmail, isCustomerSelected) => {
    return !currentEmail && !isCustomerSelected;
};