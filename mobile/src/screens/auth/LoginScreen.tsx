import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing Info', 'Enter your phone number and password.');
      return;
    }
    try {
      setLoading(true);
      await login(phone, password);
    } catch (e: any) {
      Alert.alert('Login Failed', e?.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D1117', '#162032']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>

        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Ionicons name="leaf" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>CROOPIC</Text>
          <Text style={styles.tagline}>AI-Powered Crop Health</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Log in to scan your crops and get instant treatment advice</Text>

          {/* Phone */}
          <View style={styles.inputWrap}>
            <Text style={styles.phoneCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
              <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={['#2ECC71', '#27AE60']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Log In →</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
            <Text style={styles.linkText}>New to CROOPIC? </Text>
            <Text style={[styles.linkText, { color: COLORS.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Feature pills */}
        <View style={styles.pills}>
          {['🌿 38 Crop Diseases', '🤖 90%+ Accuracy', '🇮🇳 Hindi Support'].map((t) => (
            <View key={t} style={styles.pill}>
              <Text style={styles.pillText}>{t}</Text>
            </View>
          ))}
        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  inner:      { flex: 1, padding: SPACING.lg, justifyContent: 'center' },
  header:     { alignItems: 'center', marginBottom: SPACING.xl },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(46,204,113,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)',
  },
  appName:    { fontSize: FONTS.sizes.xxl + 4, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 3 },
  tagline:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  title:    { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 20 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 52,
  },
  phoneCode: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.md, marginRight: 6 },
  input:     { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  primaryBtn:  { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  btnGradient: { height: 52, justifyContent: 'center', alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md, letterSpacing: 0.5 },
  linkRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  linkText:    { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  pills:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: {
    backgroundColor: 'rgba(46,204,113,0.1)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)',
  },
  pillText: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '600' },
});
