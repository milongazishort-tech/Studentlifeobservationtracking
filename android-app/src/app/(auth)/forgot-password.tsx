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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/common/Button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ApiStandardError } from '@/types/api.types';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<ApiStandardError | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Please enter your account email address.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await AuthService.forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(res.message);
      setSubmitted(true);
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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={22} color="#0F172A" />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the student email associated with your account and we will send a password reset link.
            </Text>
          </View>

          <View style={styles.card}>
            {submitted ? (
              <View style={styles.successContainer}>
                <CheckCircle2 size={48} color="#16A34A" style={styles.successIcon} />
                <Text style={styles.successTitle}>Check Your Inbox</Text>
                <Text style={styles.successSubtitle}>{successMessage}</Text>
                <Button
                  title="Return to Sign In"
                  onPress={() => router.replace('/(auth)/login' as any)}
                  style={styles.returnBtn}
                />
              </View>
            ) : (
              <>
                <ErrorBanner message={error?.message ?? null} code={error?.code} />

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Student Email Address</Text>
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

                <Button
                  title="Send Reset Instructions"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </>
            )}
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  header: {
    marginBottom: 24,
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
    marginTop: 6,
    lineHeight: 20,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
    height: 50,
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
  submitBtn: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  returnBtn: {
    width: '100%',
  },
});
