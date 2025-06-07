import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Image, 
  Dimensions, 
  StyleSheet, 
  ActivityIndicator,
  TouchableWithoutFeedback,
  Text
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotoViewer({ 
  photo, 
  isActive, 
  onDoubleTap, 
  onSingleTap,
  onLike,
  showOverlay 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // Animation values
  const overlayOpacity = useSharedValue(showOverlay ? 1 : 0);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  
  // Use useRef to persist tap values across renders
  const tapCountRef = React.useRef(0);
  const tapTimerRef = React.useRef(null);

  useEffect(() => {
    overlayOpacity.value = withTiming(showOverlay ? 1 : 0, { duration: 300 });
  }, [showOverlay]);

  useEffect(() => {
    if (photo?.uri) {
      Image.getSize(photo.uri, (width, height) => {
        setImageDimensions({ width, height });
      });
    }
  }, [photo?.uri]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleTap = () => {
    tapCountRef.current++;
    
    if (tapCountRef.current === 1) {
      tapTimerRef.current = setTimeout(() => {
        // Single tap
        runOnJS(onSingleTap)();
        tapCountRef.current = 0;
      }, 300);
    } else if (tapCountRef.current === 2) {
      // Double tap
      clearTimeout(tapTimerRef.current);
      tapCountRef.current = 0;
      
      // Heart animation
      heartScale.value = withSpring(1.2, { 
        damping: 10,
        stiffness: 100 
      }, () => {
        heartScale.value = withSpring(0, { damping: 15 });
      });
      
      heartOpacity.value = withTiming(1, { duration: 100 }, () => {
        heartOpacity.value = withTiming(0, { duration: 800 });
      });
      
      runOnJS(onDoubleTap)();
      runOnJS(onLike)(photo.id);
    }
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // Calculate image display dimensions while maintaining aspect ratio
  const getImageStyle = () => {
    if (!imageDimensions.width || !imageDimensions.height) {
      return { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
    }

    const imageAspectRatio = imageDimensions.width / imageDimensions.height;
    const screenAspectRatio = SCREEN_WIDTH / SCREEN_HEIGHT;

    if (imageAspectRatio > screenAspectRatio) {
      // Image is wider than screen
      return {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH / imageAspectRatio,
      };
    } else {
      // Image is taller than screen
      return {
        width: SCREEN_HEIGHT * imageAspectRatio,
        height: SCREEN_HEIGHT,
      };
    }
  };

  if (!photo) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.SKY_BLUE} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={[styles.image, getImageStyle()]}
            resizeMode="cover"
            onLoad={handleImageLoad}
          />
          
          {!imageLoaded && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.SKY_BLUE} />
            </View>
          )}
          
          {/* Double-tap heart animation */}
          <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
            <View style={styles.heart}>
              <Text style={styles.heartText}>
                ♥
              </Text>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.TREE_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    maxWidth: SCREEN_WIDTH,
    maxHeight: SCREEN_HEIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heartContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  heart: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  heartText: {
    fontSize: 40,
    color: '#ff4757',
    fontWeight: 'bold',
  },
});
