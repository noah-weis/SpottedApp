import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PhotoOverlay({ 
  photo, 
  visible, 
  onLike, 
  onDelete, 
  currentUserEmail,
  onClose 
}) {
  const translateY = useSharedValue(visible ? 0 : 200);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(200, {
        damping: 20,
        stiffness: 100,
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0, 0.8]),
  }));

  const isOwnPhoto = photo?.userEmail === currentUserEmail;
  
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

  if (!photo) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
      
      {/* Overlay Panel */}
      <Animated.View style={[styles.container, animatedStyle]}>
        <BlurView style={styles.blurView} intensity={80} tint="dark">
          <View style={styles.content}>
            {/* User Info Section */}
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{photo.userEmail}</Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(photo.timestamp)}
                </Text>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.likeButton,
                  photo.liked && styles.likedButton
                ]} 
                onPress={() => onLike(photo.id)}
              >
                <Text style={[
                  styles.actionIcon,
                  photo.liked && styles.likedIcon
                ]}>
                  {photo.liked ? '♥' : '♡'}
                </Text>
                <Text style={[
                  styles.actionText,
                  photo.liked && styles.likedText
                ]}>
                  {photo.liked ? 'Liked' : 'Like'}
                </Text>
              </TouchableOpacity>
              
              {isOwnPhoto && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => onDelete(photo.id)}
                >
                  <Text style={styles.actionIcon}>🗑</Text>
                  <Text style={[styles.actionText, styles.deleteText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.closeButton]} 
                onPress={onClose}
              >
                <Text style={styles.actionIcon}>✕</Text>
                <Text style={styles.actionText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 10, // Extra padding for home indicator
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: 14,
    color: colors.SKY_BLUE,
    opacity: 0.8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
  },
  likeButton: {
    backgroundColor: 'rgba(132, 194, 226, 0.2)', // SKY_BLUE with transparency
  },
  likedButton: {
    backgroundColor: colors.SKY_BLUE,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    fontSize: 24,
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.xs,
  },
  likedIcon: {
    color: colors.TREE_GREEN,
  },
  actionText: {
    fontSize: 12,
    color: colors.PAPER_YELLOW,
    fontWeight: '500',
  },
  likedText: {
    color: colors.TREE_GREEN,
  },
  deleteText: {
    color: '#ff6b6b',
  },
});
