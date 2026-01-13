
/**
 * Optimizes image URLs for performance.
 * Specifically targets Cloudinary and Unsplash URLs to add auto-format and quality parameters.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - Optional width to resize the image to
 * @returns {string} - The optimized URL
 */
export const optimizeImage = (url, width) => {
    if (!url) return '';

    // Cloudinary optimization
    if (url.includes('cloudinary.com')) {
        // If already optimized, return as is (basic check)
        if (url.includes('f_auto,q_auto')) return url;

        // Insert optimization params after the upload/ part
        // Example: .../upload/v1234/image.jpg -> .../upload/f_auto,q_auto/v1234/image.jpg
        // Or if width is provided: .../upload/f_auto,q_auto,w_800/v1234/image.jpg

        let params = 'f_auto,q_auto';
        if (width) {
            params += `,w_${width}`;
        }

        return url.replace('/upload/', `/upload/${params}/`);
    }

    // Unsplash optimization
    if (url.includes('unsplash.com')) {
        // Unsplash handles it via query params
        const separator = url.includes('?') ? '&' : '?';
        let newUrl = `${url}${separator}auto=format&fit=crop&q=80`;
        if (width) {
            newUrl += `&w=${width}`;
        }
        return newUrl;
    }

    return url;
};
