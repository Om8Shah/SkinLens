import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const OVAL_WIDTH = width * 0.7;
const OVAL_HEIGHT = OVAL_WIDTH * 1.35;

export default function CameraScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState('front');
  const [photo, setPhoto] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={56} color={Colors.primary} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            SkinLens needs your camera to analyze your skin. Your photos stay on your device.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      setPhoto(result);
    } catch (e) {
      console.warn('Failed to take picture:', e);
    }
    setCapturing(false);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <StatusBar barStyle="light-content" />
        <Image source={{ uri: photo.uri }} style={styles.previewImage} />
        <View style={styles.previewOverlay}>
          <View style={[styles.previewTopBar, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.previewTitle}>Preview</Text>
          </View>
          <View style={[styles.previewActions, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setPhoto(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.usePhotoButton}
              onPress={() => navigation.navigate('Loading', { photoUri: photo.uri })}
              activeOpacity={0.8}
            >
              <Text style={styles.usePhotoText}>Use This Photo</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <StatusBar barStyle="light-content" />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.ovalGuideContainer}>
          <View style={styles.ovalGuide} />
          <Text style={styles.guideText}>Position your face within the oval</Text>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity onPress={toggleFacing} style={styles.flipButton}>
            <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.captureButtonOuter}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              activeOpacity={0.7}
              disabled={capturing}
            >
              {capturing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.flipButtonSpacer} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 16,
    padding: 8,
  },
  backLinkText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButtonSpacer: {
    width: 48,
  },
  ovalGuideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalGuide: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.7)',
    borderStyle: 'dashed',
  },
  guideText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingTop: 16,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  previewTopBar: {
    alignItems: 'center',
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  previewTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  usePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  usePhotoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
