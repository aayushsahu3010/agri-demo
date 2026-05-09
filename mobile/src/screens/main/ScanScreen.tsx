/**
 * ScanScreen.tsx
 * ─────────────────────────────────────────────────────────
 * Let the farmer pick a photo (camera or gallery) →
 * preview → send to FastAPI /predict/scan → push to
 * ResultScreen with the response.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import { scanCrop } from '../../services/api';
import { saveToHistory } from '../../services/historyStore';

type Stage = 'idle' | 'preview' | 'scanning' | 'done';

export default function ScanScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [stage, setStage]       = useState<Stage>('idle');

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
      aspect: [1, 1] as [number, number],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setStage('preview');
      Haptics.selectionAsync();
    }
  };

  // ── Take with camera ──────────────────────────────────
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow camera access in Settings to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1] as [number, number],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setStage('preview');
      Haptics.selectionAsync();
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

        {/* ── Idle state ── */}
        {stage === 'idle' && (
          <>
            <View style={styles.uploadZone}>
              <Ionicons name="leaf-outline" size={56} color={COLORS.primary} style={{ marginBottom: SPACING.md }} />
              <Text style={styles.uploadTitle}>Photograph a Leaf</Text>
              <Text style={styles.uploadText}>
                Take a clear, close-up photo of the{'\n'}affected leaf in good lighting.
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={takePhoto} activeOpacity={0.85}>
                <LinearGradient colors={['#2ECC71', '#27AE60']} style={styles.actionGrad}>
                  <Ionicons name="camera" size={26} color="#fff" />
                  <Text style={styles.actionText}>Camera</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={pickFromGallery} activeOpacity={0.85}>
                <View style={styles.actionOutline}>
                  <Ionicons name="images-outline" size={26} color={COLORS.primary} />
                  <Text style={[styles.actionText, { color: COLORS.primary }]}>Gallery</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
              {[
                'Use natural daylight — avoid flash',
                'Focus on the most affected leaf',
                'Capture the entire leaf in frame',
                'Avoid blurry or overexposed shots',
              ].map(tip => (
                <View key={tip} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
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

  uploadZone: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl, borderWidth: 2,
    borderColor: 'rgba(46,204,113,0.25)', borderStyle: 'dashed',
    padding: SPACING.xxl, alignItems: 'center', marginBottom: SPACING.lg,
  },
  uploadTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  uploadText:  { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  actionRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  actionBtn:  { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  actionGrad: { padding: SPACING.lg, alignItems: 'center', gap: 8 },
  actionOutline: {
    padding: SPACING.lg, alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
  },
  actionText: { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md },

  tipsCard:  {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  tipsTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  tipRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipText:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },

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
