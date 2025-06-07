import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export default function PhotoItem({ photo, onPress, onLike, onDelete, currentUserEmail }) {
  const isOwnPhoto = photo.userEmail === currentUserEmail;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userEmail}>{photo.userEmail}</Text>
        <Text style={styles.timestamp}>
          {new Date(photo.timestamp).toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity onPress={() => onPress(photo)} activeOpacity={0.8}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, photo.liked && styles.likedButton]} 
          onPress={() => onLike(photo.id)}
        >
          <Text style={[styles.actionText, photo.liked && styles.likedText]}>
            {photo.liked ? '♥' : '♡'} Like
          </Text>
        </TouchableOpacity>
        
        {isOwnPhoto && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => onDelete(photo.id)}
          >
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.SPIRIT_GREEN,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.TREE_GREEN,
  },
  userEmail: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: colors.SKY_BLUE,
    fontSize: 14,
  },
  photo: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.TREE_GREEN,
  },
  likedButton: {
    backgroundColor: colors.SKY_BLUE,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionText: {
    color: colors.PAPER_YELLOW,
    fontSize: 14,
    fontWeight: '500',
  },
  likedText: {
    color: colors.TREE_GREEN,
  },
  deleteText: {
    color: colors.PAPER_YELLOW,
  },
});