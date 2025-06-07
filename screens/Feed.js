import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';
import { colors, spacing } from '../src/theme';
import { feedService } from '../src/services/feed';
import { authService } from '../src/services/auth';
import PhotoItem from '../src/components/PhotoItem';

export default function FeedScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const currentUser = authService.getCurrentUser();

  const loadPhotos = useCallback(async () => {
    try {
      const allPhotos = await feedService.getAllPhotos();
      setPhotos(allPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, [loadPhotos]);

  const handlePhotoPress = useCallback((photo) => {
    // Navigate to full-size photo view (implement later)
    Alert.alert('Photo', 'Full-size view coming soon!');
  }, []);

  const handleLike = useCallback(async (photoId) => {
    const result = await feedService.toggleLike(photoId);
    if (result.success) {
      await loadPhotos(); // Refresh to show updated like status
    } else {
      Alert.alert('Error', 'Failed to update like status');
    }
  }, [loadPhotos]);

  const handleDelete = useCallback(async (photoId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await feedService.deletePhoto(photoId);
            if (result.success) {
              await loadPhotos(); // Refresh to remove deleted photo
            } else {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  }, [loadPhotos]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const renderPhoto = useCallback(({ item }) => (
    <PhotoItem
      photo={item}
      onPress={handlePhotoPress}
      onLike={handleLike}
      onDelete={handleDelete}
      currentUserEmail={currentUser?.email}
    />
  ), [handlePhotoPress, handleLike, handleDelete, currentUser?.email]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Photos Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start taking photos to see them here!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[screenStyles.container, styles.centered]}>
        <Text style={screenStyles.subtitle}>Loading photos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.container}>
      <View style={styles.header}>
        <Text style={screenStyles.title}>Photo Feed</Text>
      </View>
      
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={photos.length === 0 ? styles.emptyContainer : styles.listContainer}
      />
      
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xl, // Extra padding for notch/status bar
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.md,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.SKY_BLUE,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.SKY_BLUE + '30', // Semi-transparent
    backgroundColor: colors.DARK_BLUE,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: colors.PAPER_YELLOW,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.DARK_BLUE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});