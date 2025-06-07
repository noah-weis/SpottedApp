import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  TouchableOpacity,
  Text,
  Dimensions,
  StatusBar
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  clamp,
} from 'react-native-reanimated';
import { colors, spacing } from '../src/theme';
import { feedService } from '../src/services/feed';
import { authService } from '../src/services/auth';
import PhotoViewer from '../src/components/PhotoViewer';
import PhotoOverlay from '../src/components/PhotoOverlay';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showHints, setShowHints] = useState(true);
  
  const translateY = useSharedValue(0);
  const gestureRef = useRef();
  const hintTimerRef = useRef();
  
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

  const handleLike = useCallback(async (photoId) => {
    try {
      const result = await feedService.toggleLike(photoId);
      if (result.success) {
        // Update local state optimistically
        setPhotos(prev => prev.map(photo => 
          photo.id === photoId ? { ...photo, liked: !photo.liked } : photo
        ));
      } else {
        Alert.alert('Error', 'Failed to update like status');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  }, []);

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
              const updatedPhotos = photos.filter(photo => photo.id !== photoId);
              setPhotos(updatedPhotos);
              
              // Adjust current index if needed
              if (updatedPhotos.length === 0) {
                // No photos left, will show empty state
                setCurrentIndex(0);
              } else if (currentIndex >= updatedPhotos.length) {
                // Current index is beyond the new array length
                setCurrentIndex(updatedPhotos.length - 1);
              }
              // If currentIndex < updatedPhotos.length, keep current index
            } else {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  }, [currentIndex, photos]);

  const navigateToPhoto = useCallback((direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, photos.length]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      const shouldGoToNext = event.translationY < -SCREEN_HEIGHT * 0.2 && event.velocityY < -500;
      const shouldGoToPrevious = event.translationY > SCREEN_HEIGHT * 0.2 && event.velocityY > 500;
      
      if (shouldGoToNext) {
        // Animate to complete the upward scroll
        translateY.value = withTiming(-SCREEN_HEIGHT, {
          duration: 200,
        }, (finished) => {
          if (finished) {
            runOnJS(navigateToPhoto)(1);
            // Reset translateY after the photo change
            translateY.value = 0;
          }
        });
      } else if (shouldGoToPrevious) {
        // Animate to complete the downward scroll
        translateY.value = withTiming(SCREEN_HEIGHT, {
          duration: 200,
        }, (finished) => {
          if (finished) {
            runOnJS(navigateToPhoto)(-1);
            // Reset translateY after the photo change
            translateY.value = 0;
          }
        });
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const previousPhotoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [0, 1],
      'clamp'
    );
    const scale = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [0.8, 1],
      'clamp'
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const nextPhotoStyle = useAnimatedStyle(() => {
    const translateYNext = interpolate(
      translateY.value,
      [-SCREEN_HEIGHT, 0],
      [0, SCREEN_HEIGHT],
      'clamp'
    );
    return {
      transform: [{ translateY: translateYNext }],
    };
  });

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Auto-hide hints after 3 seconds
  useEffect(() => {
    if (photos.length > 1 && showHints) {
      hintTimerRef.current = setTimeout(() => {
        setShowHints(false);
      }, 3000);
    }
    
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, [photos.length, showHints]);

  const handleSingleTap = useCallback(() => {
    setShowOverlay(prev => !prev);
  }, []);

  const handleDoubleTap = useCallback(() => {
    // Double tap to like is handled in PhotoViewer
  }, []);

  const handleRefresh = useCallback(async () => {
    await loadPhotos();
  }, [loadPhotos]);

  const handleBack = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading photos...</Text>
      </SafeAreaView>
    );
  }

  if (photos.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start taking photos to see them here!
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPhoto = photos[currentIndex];
  const previousPhoto = currentIndex > 0 ? photos[currentIndex - 1] : null;
  const nextPhoto = currentIndex < photos.length - 1 ? photos[currentIndex + 1] : null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.TREE_GREEN} />
      
      {/* Background Photos for Smooth Transitions */}
      {previousPhoto && (
        <Animated.View style={[styles.photoContainer, styles.backgroundPhoto, previousPhotoStyle]}>
          <PhotoViewer
            photo={previousPhoto}
            isActive={false}
            onDoubleTap={handleDoubleTap}
            onSingleTap={handleSingleTap}
            onLike={handleLike}
            showOverlay={false}
          />
        </Animated.View>
      )}
      
      {nextPhoto && (
        <Animated.View style={[styles.photoContainer, styles.backgroundPhoto, nextPhotoStyle]}>
          <PhotoViewer
            photo={nextPhoto}
            isActive={false}
            onDoubleTap={handleDoubleTap}
            onSingleTap={handleSingleTap}
            onLike={handleLike}
            showOverlay={false}
          />
        </Animated.View>
      )}
      
      {/* Main Photo */}
      <PanGestureHandler ref={gestureRef} onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.photoContainer, animatedStyle]}>
          <PhotoViewer
            photo={currentPhoto}
            isActive={true}
            onDoubleTap={handleDoubleTap}
            onSingleTap={handleSingleTap}
            onLike={handleLike}
            showOverlay={showOverlay}
          />
        </Animated.View>
      </PanGestureHandler>
      
      {/* Top Bar with Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topButton} onPress={handleBack}>
          <Text style={styles.topButtonText}>✕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.topButton} onPress={handleRefresh}>
          <Text style={styles.topButtonText}>⟳</Text>
        </TouchableOpacity>
      </View>
      
      {/* Photo Counter */}
      <View style={styles.photoCounter}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {photos.length}
        </Text>
      </View>
      
      {/* Overlay */}
      <PhotoOverlay
        photo={currentPhoto}
        visible={showOverlay}
        onLike={handleLike}
        onDelete={handleDelete}
        currentUserEmail={currentUser?.email}
        onClose={() => setShowOverlay(false)}
      />
      
      {/* Navigation Hints */}
      {photos.length > 1 && showHints && (
        <View style={styles.navigationHints}>
          {currentIndex < photos.length - 1 && (
            <View style={[styles.hint, styles.hintUp]}>
              <Text style={styles.hintText}>Swipe up for next</Text>
            </View>
          )}
          {currentIndex > 0 && (
            <View style={[styles.hint, styles.hintDown]}>
              <Text style={styles.hintText}>Swipe down for previous</Text>
            </View>
          )}
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.TREE_GREEN,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundPhoto: {
    zIndex: 0,
  },
  loadingText: {
    fontSize: 18,
    color: colors.PAPER_YELLOW,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.SKY_BLUE,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.SPIRIT_GREEN,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  backButtonText: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoCounter: {
    position: 'absolute',
    top: 100,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    zIndex: 10,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  navigationHints: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
    pointerEvents: 'none',
  },
  hint: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    alignItems: 'center',
  },
  hintUp: {
    top: '25%',
  },
  hintDown: {
    bottom: '25%',
  },
  hintText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
});