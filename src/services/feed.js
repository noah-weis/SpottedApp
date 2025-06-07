import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTOS_STORAGE_KEY = 'spotted_app_photos';

// Abstract interface for feed data operations
export const feedService = {
  // Get all photos
  getAllPhotos: async () => {
    try {
      const photosData = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      if (photosData) {
        const photos = JSON.parse(photosData);
        // Sort by timestamp descending (newest first)
        return photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      return [];
    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  },
  
  // Add new photo
  addPhoto: async (photoData) => {
    try {
      const existingPhotos = await feedService.getAllPhotos();
      const newPhoto = {
        id: Date.now().toString(),
        ...photoData,
        timestamp: new Date().toISOString(),
        liked: false,
        likeCount: 0,
        likedBy: []
      };
      
      const updatedPhotos = [newPhoto, ...existingPhotos];
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
      return { success: true, photo: newPhoto };
    } catch (error) {
      console.error('Error adding photo:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Delete photo
  deletePhoto: async (photoId) => {
    try {
      const existingPhotos = await feedService.getAllPhotos();
      const updatedPhotos = existingPhotos.filter(photo => photo.id !== photoId);
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
      return { success: true };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle like status
  toggleLike: async (photoId, currentUsername) => {
    try {
      const existingPhotos = await feedService.getAllPhotos();
      const updatedPhotos = existingPhotos.map(photo => {
        if (photo.id === photoId) {
          // Ensure likedBy and likeCount exist for backwards compatibility
          const likedBy = photo.likedBy || [];
          const isCurrentlyLiked = likedBy.includes(currentUsername);
          
          if (isCurrentlyLiked) {
            // Remove like
            return {
              ...photo,
              liked: false,
              likeCount: Math.max(0, (photo.likeCount || 0) - 1),
              likedBy: likedBy.filter(user => user !== currentUsername)
            };
          } else {
            // Add like
            return {
              ...photo,
              liked: true,
              likeCount: (photo.likeCount || 0) + 1,
              likedBy: [...likedBy, currentUsername]
            };
          }
        }
        return photo;
      });
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
      return { success: true };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },
};