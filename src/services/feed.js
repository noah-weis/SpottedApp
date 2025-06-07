import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTOS_STORAGE_KEY = 'spotted_app_photos';

// Abstract interface for feed data operations
export const feedService = {
  // Get all photos (currently from local storage, future: Firebase)
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
  
  // Add new photo (currently local, future: Firebase)
  addPhoto: async (photoData) => {
    try {
      const existingPhotos = await feedService.getAllPhotos();
      const newPhoto = {
        id: Date.now().toString(), // Simple ID generation, Firebase will handle this
        ...photoData,
        timestamp: new Date().toISOString(),
        liked: false
      };
      
      const updatedPhotos = [newPhoto, ...existingPhotos];
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
      return { success: true, photo: newPhoto };
    } catch (error) {
      console.error('Error adding photo:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Delete photo (currently local, future: Firebase)  
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
  toggleLike: async (photoId) => {
    try {
      const existingPhotos = await feedService.getAllPhotos();
      const updatedPhotos = existingPhotos.map(photo => 
        photo.id === photoId ? { ...photo, liked: !photo.liked } : photo
      );
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
      return { success: true };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Subscribe to photo updates (future: Firebase real-time)
  subscribeToPhotos: (callback) => {
    // Placeholder for Firebase real-time listeners
    // For now, return unsubscribe function
    return () => {};
  }
};