import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other',
];

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [state, setState]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    try {
      setLoading(true);
      await register({ name: name.trim(), phone: phone.trim(), password, state });
    } catch (e: any) {
      Alert.alert('Registration Failed', e?.response?.data?.detail || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D1117', '#162032']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Ionicons name="leaf" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>CROOPIC</Text>
            <Text style={styles.tagline}>Smart Farming, Healthier Crops</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of Indian farmers using AI to protect their crops</Text>

            {/* Name */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputWrap}>
              <Text style={styles.phoneCode}>+91</Text>
              <TextInput
                style={[styles.input, { paddingLeft: 8 }]}
                placeholder="10-digit Mobile Number"
                placeholderTextColor={COLORS.textMuted}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* State (optional) */}
            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your State (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={state}
                onChangeText={setState}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#2ECC71', '#27AE60']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Create Account →</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={[styles.linkText, { color: COLORS.primary }]}>Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  scroll:     { flexGrow: 1, padding: SPACING.lg, justifyContent: 'center' },
  header:     { alignItems: 'center', marginBottom: SPACING.xl },
  logoWrap:   {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(46,204,113,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appName:    { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 2 },
  tagline:    { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title:      { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  subtitle:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 20 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 52,
  },
  inputIcon:  { marginRight: 8 },
  phoneCode:  { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.md, marginRight: 4 },
  input:      { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  eyeBtn:     { padding: 4 },
  primaryBtn: { marginTop: SPACING.sm, borderRadius: RADIUS.md, overflow: 'hidden' },
  btnGradient:{ height: 52, justifyContent: 'center', alignItems: 'center' },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md, letterSpacing: 0.5 },
  linkRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  linkText:   { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
});
