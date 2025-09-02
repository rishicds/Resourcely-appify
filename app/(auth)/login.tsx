import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated, user } = useAuth();

  // Redirect user after successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, redirecting...');
      if (!user.hasCompletedOnboarding) {
        router.replace('/(onboarding)/skills' as any);
      } else {
        router.replace('/(tabs)' as any);
      }
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('Starting login process...');
    
    try {
      setIsLoading(true);
      console.log('Calling signIn with email:', email);
      await signIn(email, password);
      console.log('SignIn completed successfully');
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if the error indicates user not found/invalid credentials
      const isUserNotFound = 
        error.message?.toLowerCase().includes('user') && 
        (error.message?.toLowerCase().includes('not found') || 
         error.message?.toLowerCase().includes('invalid') ||
         error.message?.toLowerCase().includes('does not exist') ||
         error.code === 401 ||
         error.type === 'user_invalid_credentials' ||
         error.type === 'user_not_found');

      if (isUserNotFound) {
        // Show popup asking user to sign up instead
        Alert.alert(
          'Account Not Found',
          "We couldn't find an account with these credentials. Would you like to create a new account instead?",
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Sign Up',
              onPress: () => {
                // Navigate to register with prefilled email and password
                router.push({
                  pathname: '/register',
                  params: {
                    prefillEmail: email,
                    prefillPassword: password
                  }
                } as any);
              },
            },
          ]
        );
      } else {
        // Show generic error for other types of errors
        Alert.alert('Login Failed', error.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register' as any);
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

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={() => {
                  console.log('Login button pressed!');
                  handleLogin();
                }}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text style={styles.linkText}>Sign Up</Text>
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
    width: width * 0.6,
    height: width * 0.6,
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
    // Claymorphic inner shadow effect
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
    // Claymorphic style
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
    color: '#6b7280',
  },
  linkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
