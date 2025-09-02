import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const prefillEmail = params.prefillEmail as string || '';
  const prefillPassword = params.prefillPassword as string || '';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState(prefillPassword);
  const [confirmPassword, setConfirmPassword] = useState(prefillPassword);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  // Show a helpful message if data was prefilled from login
  useEffect(() => {
    if (prefillEmail && prefillPassword) {
      Alert.alert(
        'Welcome!',
        'We\'ve prefilled your email and password from your login attempt. Please enter your name to complete the registration.',
        [{ text: 'OK' }]
      );
    }
  }, [prefillEmail, prefillPassword]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password, name);
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            {/* Lottie Animation */}
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../assets/lottie/Login.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the community</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, prefillEmail && styles.prefilledInput]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {prefillEmail && (
                  <Text style={styles.prefilledHint}>✓ Prefilled from login attempt</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, prefillPassword && styles.prefilledInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                />
                {prefillPassword && (
                  <Text style={styles.prefilledHint}>✓ Prefilled from login attempt</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, prefillPassword && styles.prefilledInput]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                />
                {prefillPassword && (
                  <Text style={styles.prefilledHint}>✓ Prefilled from login attempt</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  animation: {
    width: width * 0.5,
    height: width * 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2d3748',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#718096',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#5a67d8',
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    shadowColor: '#a0aec0',
    borderColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#718096',
  },
  linkText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  prefilledInput: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
    shadowColor: '#48bb78',
    shadowOpacity: 0.15,
  },
  prefilledHint: {
    fontSize: 12,
    color: '#38a169',
    fontWeight: '600',
    marginTop: 4,
  },
});
