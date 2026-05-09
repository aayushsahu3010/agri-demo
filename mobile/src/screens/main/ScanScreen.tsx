/**
 * ScanScreen.tsx
 * ─────────────────────────────────────────────────────────
 * Let the farmer pick a photo (camera or gallery) →
 * preview → send to FastAPI /predict/scan → push to
 * ResultScreen with the response.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { scanCrop } from '../../services/api';
import { saveToHistory } from '../../services/historyStore';

type Stage = 'idle' | 'preview' | 'scanning' | 'done';

export default function ScanScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [stage, setStage]       = useState<Stage>('idle');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // ── Pick from gallery ────────────────────────────────
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow photo library access in Settings to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setStage('preview');
      Haptics.selectionAsync();
    }
  };

  // ── Take with custom camera ───────────────────────────
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
        if (photo?.uri) {
          setImageUri(photo.uri);
          setStage('preview');
          Haptics.selectionAsync();
        }
      } catch (err) {
        Alert.alert('Error', 'Could not capture photo');
      }
    }
  };

  // ── Run AI scan ───────────────────────────────────────
  const runScan = async () => {
    if (!imageUri) return;
    try {
      setStage('scanning');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const result = await scanCrop(imageUri);
      await saveToHistory(result);
      setStage('done');
      navigation.navigate('Result', { scan: result });
      // reset after navigating
      setTimeout(() => { setImageUri(null); setStage('idle'); }, 600);
    } catch (err: any) {
      setStage('preview');
      Alert.alert(
        'Scan Failed',
        err?.response?.data?.detail ?? 'Could not reach server. Make sure backend is running.',
      );
    }
  };

  const resetScan = () => { setImageUri(null); setStage('idle'); };

  return (
    <LinearGradient colors={['#0D1117', '#162032']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="scan" size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Crop Scanner</Text>
            <Text style={styles.headerSub}>AI-Powered Disease Detection</Text>
          </View>
        </View>

        {/* ── Idle state (Custom Camera View) ── */}
        {stage === 'idle' && (
          <View style={styles.cameraWrapper}>
            {!permission ? (
              <View style={styles.idleLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : !permission.granted ? (
              <View style={styles.permWrap}>
                <Ionicons name="camera-outline" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
                <Text style={styles.permText}>Camera access is required to scan crops.</Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
                  <Text style={styles.permBtnText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CameraView style={styles.camera} facing="back" ref={cameraRef}>
                <View style={styles.cameraBottomBar}>
                  <TouchableOpacity style={styles.cameraGalleryBtn} onPress={pickFromGallery} activeOpacity={0.8}>
                    <Ionicons name="images" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.shutterBtn} onPress={takePicture} activeOpacity={0.85}>
                    <View style={styles.shutterInner} />
                  </TouchableOpacity>

                  <View style={{ width: 44 }} />
                </View>
              </CameraView>
            )}
          </View>
        )}

        {/* ── Preview state ── */}
        {(stage === 'preview' || stage === 'scanning') && imageUri && (
          <>
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              {stage === 'scanning' && (
                <View style={styles.scanningOverlay}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.scanningText}>Analysing leaf…</Text>
                  <Text style={styles.scanningSubText}>Running AI model — this takes ~5s</Text>
                </View>
              )}
            </View>

            {stage === 'preview' && (
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.retakeBtn} onPress={resetScan} activeOpacity={0.85}>
                  <Ionicons name="refresh" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.scanBtn} onPress={runScan} activeOpacity={0.85}>
                  <LinearGradient colors={['#2ECC71', '#27AE60']} style={styles.scanGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="flash" size={18} color="#fff" />
                    <Text style={styles.scanBtnText}>Analyse Crop →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  scroll:     { padding: SPACING.lg, paddingTop: 56, paddingBottom: 40 },

  header:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  headerIcon:  {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(46,204,113,0.12)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(46,204,113,0.25)',
  },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  headerSub:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },

  idleLoading: { flex: 1, height: 400, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  
  cameraWrapper: {
    height: 480,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.border,
  },
  camera: { flex: 1, justifyContent: 'flex-end' },
  cameraBottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, paddingTop: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cameraGalleryBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  shutterBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  
  permWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  permText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 22 },
  permBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: 14, borderRadius: RADIUS.lg },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md },

  previewWrap: {
    borderRadius: RADIUS.xl, overflow: 'hidden',
    marginBottom: SPACING.lg, position: 'relative',
    height: 320,
  },
  previewImage:     { width: '100%', height: '100%' },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,17,23,0.8)',
    justifyContent: 'center', alignItems: 'center', gap: SPACING.md,
  },
  scanningText:    { color: COLORS.primary, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  scanningSubText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },

  previewActions: { flexDirection: 'row', gap: SPACING.md },
  retakeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  retakeText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sizes.md },
  scanBtn:    { flex: 2, borderRadius: RADIUS.lg, overflow: 'hidden' },
  scanGrad:   {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: SPACING.md,
  },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md },
});
