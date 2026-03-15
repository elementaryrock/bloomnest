export const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return photoUrl;
    }
    
    if (photoUrl.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || ''}${photoUrl}`;
    }
    
    return photoUrl;
};
