import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  StatusBar,
  Dimensions,
  Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { colors, spacing } from '../src/theme';
import { feedService } from '../src/services/feed';
import { authService } from '../src/services/auth';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });
  const cameraRef = useRef(null);

  useEffect(() => {
    // Request camera permissions when component mounts
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const showCustomAlert = (title, message, buttons = []) => {
    setModalConfig({
      title,
      message,
      buttons
    });
    setShowModal(true);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        // Get current user info
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          showCustomAlert(
            'Sign In Required',
            'You must be signed in to take photos',
            [
              { 
                text: 'OK', 
                onPress: () => setShowModal(false)
              }
            ]
          );
          return;
        }

        // Create photo data object for feed
        const photoData = {
          uri: photo.uri,
          userId: currentUser.id,
          userUsername: currentUser.username,
          tags: [] // Future: tagged users
        };

        // Save photo to feed
        const result = await feedService.addPhoto(photoData);
        
        if (result.success) {
          showCustomAlert(
            'Photo Saved!',
            'Your photo has been added to the feed.',
            [
              { 
                text: 'View Feed', 
                onPress: () => {
                  setShowModal(false);
                  navigation.navigate('Feed');
                },
                style: 'primary'
              },
              { 
                text: 'Take Another', 
                onPress: () => setShowModal(false),
                style: 'secondary'
              }
            ]
          );
        } else {
          showCustomAlert(
            'Error',
            'Failed to save photo to feed',
            [
              { 
                text: 'OK', 
                onPress: () => setShowModal(false)
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        showCustomAlert(
          'Error',
          'Failed to take picture',
          [
            { 
              text: 'OK', 
              onPress: () => setShowModal(false)
            }
          ]
        );
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <BlurView style={styles.permissionBlurView} intensity={100} tint="dark">
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Camera Access</Text>
            <Text style={styles.permissionText}>
              We need your permission to use the camera to capture and share your moments
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Camera View */}
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      />
      
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <BlurView style={styles.topBarBlur} intensity={80} tint="dark">
          <TouchableOpacity style={styles.backButtonTop} onPress={handleBack}>
            <Text style={styles.backButtonTopText}>✕</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <BlurView style={styles.bottomControlsBlur} intensity={90} tint="dark">
          <View style={styles.controlsContainer}>
            {/* Take Picture Button */}
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonOuter}>
                <View style={styles.captureButtonInner} />
              </View>
            </TouchableOpacity>
            
            {/* Flip Camera Button */}
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView style={styles.modalBlurView} intensity={100} tint="dark">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalConfig.title}</Text>
              <Text style={styles.modalMessage}>{modalConfig.message}</Text>
              <View style={styles.modalButtons}>
                {modalConfig.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalButton,
                      button.style === 'primary' && styles.primaryButton,
                      button.style === 'secondary' && styles.secondaryButton,
                      modalConfig.buttons.length === 1 && styles.singleButton
                    ]}
                    onPress={button.onPress}
                  >
                    <Text style={[
                      styles.modalButtonText,
                      button.style === 'primary' && styles.primaryButtonText,
                      button.style === 'secondary' && styles.secondaryButtonText
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.TREE_GREEN,
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
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.TREE_GREEN,
  },
  permissionBlurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    maxWidth: 320,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    color: colors.SKY_BLUE,
    fontSize: 16,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.SPIRIT_GREEN,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minWidth: 160,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    minWidth: 160,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    zIndex: 1000,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topBarBlur: {
    borderRadius: 22,
  },
  backButtonTop: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonTopText: {
    fontSize: 18,
    color: colors.PAPER_YELLOW,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginHorizontal: spacing.lg,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bottomControlsBlur: {
    paddingVertical: spacing.lg,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  captureButton: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.PAPER_YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.SKY_BLUE,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.SPIRIT_GREEN,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flipButtonText: {
    fontSize: 24,
    color: colors.PAPER_YELLOW,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 280,
    marginHorizontal: spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    textAlign: 'center',
    color: colors.SKY_BLUE,
    fontSize: 16,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    marginHorizontal: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: colors.SPIRIT_GREEN,
  },
  primaryButtonText: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: '600',
  },
  singleButton: {
    marginHorizontal: spacing.xl,
  },
  modalButtonText: {
    color: colors.PAPER_YELLOW,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
