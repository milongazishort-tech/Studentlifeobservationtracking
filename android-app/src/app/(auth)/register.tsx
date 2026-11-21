import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User, School, BookOpen } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ApiStandardError } from '@/types/api.types';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiStandardError | null>(null);

  const handleRegister = async () => {
    // Basic frontend checks
    if (!name.trim() || !email.trim() || !university.trim() || !department.trim() || !password) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'All fields are required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (password.length < 8) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 8 characters long.',
        field: 'password',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const message = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        university: university.trim(),
        department: department.trim(),
        password,
      });

      Alert.alert(
        'Registration Successful',
        message || 'Please check your email to verify your account before logging in.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/(auth)/login' as any),
          },
        ]
      );
    } catch (err: any) {
      setError(err as ApiStandardError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Begin your 30-day student self-improvement journey</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <ErrorBanner message={error?.message ?? null} code={error?.code} />

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, error?.field === 'name' && styles.inputError]}>
                <User size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mahfuzur Rahman"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, error?.field === 'email' && styles.inputError]}>
                <Mail size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="student@university.edu"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            {/* University */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>University / Institution</Text>
              <View style={[styles.inputWrapper, error?.field === 'university' && styles.inputError]}>
                <School size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. SMUCT"
                  placeholderTextColor="#94A3B8"
                  value={university}
                  onChangeText={(val) => {
                    setUniversity(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            {/* Department */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department / Major</Text>
              <View style={[styles.inputWrapper, error?.field === 'department' && styles.inputError]}>
                <BookOpen size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science & Engineering"
                  placeholderTextColor="#94A3B8"
                  value={department}
                  onChangeText={(val) => {
                    setDepartment(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password (min. 8 characters)</Text>
              <View style={[styles.inputWrapper, error?.field === 'password' && styles.inputError]}>
                <Lock size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (error) setError(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Create Student Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Link to Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already registered? </Text>
              <Link href={"/(auth)/login" as any} asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeIcon: {
    padding: 4,
  },
  submitBtn: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
  },
});
