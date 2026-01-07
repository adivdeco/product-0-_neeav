/**
 * Detects city from phone number area code
 * @param {string} phone - Phone number
 * @returns {string} - Detected city name
 */
export const detectCityFromPhone = (phone) => {
    if (!phone) return '';

    const phonePrefix = phone.replace(/\D/g, '').substring(0, 4);

    const areaCodes = {
        '011': 'Delhi',
        '022': 'Mumbai',
        '033': 'Kolkata',
        '044': 'Chennai',
        '020': 'Pune',
        '040': 'Hyderabad',
        '080': 'Bengaluru',
        '079': 'Ahmedabad',
        '036': 'Guwahati',
        '075': 'Bhopal',
        '014': 'Jaipur',
        '012': 'Lucknow',
        '065': 'Kochi',
        '048': 'Thiruvananthapuram',
        '071': 'Jammu',
        '018': 'Chandigarh',
        '013': 'Srinagar',
        '054': 'Patna',
        '077': 'Raipur',
        '076': 'Bhubaneswar',
        '026': 'Surat',
        '025': 'Nagpur',
        '061': 'Gwalior',
        '074': 'Udaipur'
    };

    return areaCodes[phonePrefix] || '';
};

/**
 * Gets current location using browser geolocation
 * @returns {Promise} - Promise with location data
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();
                    resolve({
                        city: data.city,
                        locality: data.locality,
                        country: data.countryName,
                        fullAddress: `${data.locality}, ${data.city}, ${data.countryName}`
                    });
                } catch (error) {
                    // Fallback to simpler geocoding
                    const fallbackAddress = await getFallbackLocation(latitude, longitude);
                    resolve(fallbackAddress);
                }
            },
            (error) => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
};

/**
 * Fallback location service
 */
const getFallbackLocation = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        return {
            city: data.address.city || data.address.town,
            locality: data.address.suburb || data.address.neighbourhood,
            country: data.address.country,
            fullAddress: data.display_name
        };
    } catch (error) {
        return {
            city: 'Unknown',
            locality: 'Unknown',
            country: 'Unknown',
            fullAddress: 'Location detected but details unavailable'
        };
    }
};

/**
 * Popular Indian cities for quick selection
 */
export const popularCities = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
    'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow',
    'Surat', 'Kanpur', 'Nagpur', 'Patna', 'Indore',
    'Thane', 'Bhopal', 'Visakhapatnam', 'Vadodara', 'Coimbatore'
];