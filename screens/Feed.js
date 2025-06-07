import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../src/theme';
import { feedService } from '../src/services/feed';
import { authService } from '../src/services/auth';
import PhotoViewer from '../src/components/PhotoViewer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const flatListRef = useRef(null);

  // Load photos on screen focus
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
      loadCurrentUser();
    }, [])
  );

  const loadCurrentUser = async () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  };

  const loadPhotos = async () => {
    try {
      const photosData = await feedService.getAllPhotos();
      setPhotos(photosData);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const handleLike = async (photoId) => {
    try {
      await feedService.toggleLike(photoId);
      // Update local state
      setPhotos(prevPhotos =>
        prevPhotos.map(photo =>
          photo.id === photoId ? { ...photo, liked: !photo.liked } : photo
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleDelete = async (photoId) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo?.userUsername !== currentUser?.username) {
      Alert.alert('Error', 'You can only delete your own photos');
      return;
    }

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await feedService.deletePhoto(photoId);
              setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'now' : `${diffMinutes}m ago`;
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderPhoto = ({ item, index }) => {
    const isCurrentUser = item.userUsername === currentUser?.username;
    
    return (
      <View style={styles.photoContainer}>
        <PhotoViewer
          photo={item}
          isActive={index === currentIndex}
          onDoubleTap={() => handleLike(item.id)}
          onSingleTap={() => {}} // Could show/hide overlay in future
          onLike={handleLike}
          showOverlay={false}
        />
        
        {/* Bottom Overlay with User Info */}
        <View style={styles.bottomOverlay}>
          <BlurView style={styles.blurView} intensity={80} tint="dark">
            <View style={styles.overlayContent}>
              <View style={styles.userInfoSection}>
                <Text style={styles.userUsername}>{item.userUsername}</Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(item.timestamp)}
                </Text>
              </View>
              
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={[styles.actionButton, item.liked && styles.likedButton]}
                  onPress={() => handleLike(item.id)}
                >
                  <Text style={[styles.actionIcon, item.liked && styles.likedIcon]}>
                    {item.liked ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
                
                {isCurrentUser && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Photos Yet</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to share a moment!
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={navigateToCamera}>
          <Text style={styles.emptyButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <FlatList
        ref={flatListRef}
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.SKY_BLUE}
          />
        }
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
      
      {/* Floating Plus Button */}
      <TouchableOpacity style={styles.addButton} onPress={navigateToCamera}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.TREE_GREEN,
  },
  loadingText: {
    color: colors.PAPER_YELLOW,
    fontSize: 18,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.TREE_GREEN,
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.SKY_BLUE,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.SPIRIT_GREEN,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  blurView: {
    flex: 1,
  },
  overlayContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl, // Extra padding for home indicator
  },
  userInfoSection: {
    flex: 1,
  },
  userUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: 14,
    color: colors.SKY_BLUE,
    opacity: 0.8,
  },
  actionsSection: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likedButton: {
    backgroundColor: colors.SKY_BLUE,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.3)',
  },
  actionIcon: {
    fontSize: 20,
    color: colors.PAPER_YELLOW,
  },
  likedIcon: {
    color: colors.TREE_GREEN,
  },
  deleteIcon: {
    fontSize: 18,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.SPIRIT_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonText: {
    fontSize: 24,
    color: colors.PAPER_YELLOW,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});
