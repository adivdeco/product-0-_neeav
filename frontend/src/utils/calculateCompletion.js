



export const calculateCompletion = (userData) => {
    let completed = 0;
    const total = 7;

    if (userData?.name) completed++;
    if (userData?.email) completed++;
    if (userData?.phone) completed++;
    if (userData?.address.street) completed++;
    if (userData?.address.city) completed++;
    if (userData?.address.state) completed++;
    if (userData?.address.pincode) completed++;

    return Math.round((completed / total) * 100);
};

export const isAddressComplete = (userData) => {
    return userData?.address.street && userData?.address.city &&
        userData?.address.state && userData?.address.pincode;
};

