// screens/loginpage.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const RegisterPage = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    // Add validation for empty fields
    if (!firstName.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);  // Add error feedback
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);  // Add error feedback
      alert('Passwords do not match!');
      return;
    }

    try {
      const regsterData = {
        username,
        password,
        first_name: firstName,
        scouter_id: Math.floor(Math.random() * 100000),
      };
      const regiserResponse = await fetch('http://192.168.68.67:8081/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regsterData),
      });

      if (!regiserResponse.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);  // Add error feedback
        alert('Error registering. Please try again.');
        return;
      }

      const res = await regiserResponse.json();
      const access_token = res['access_token']
      await AsyncStorage.setItem('ACCESS_TOKEN', access_token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);  // Add success feedback
      navigation.replace('StartPage');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);  // Add error feedback
      alert('Error registering. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Image
          source={require('../assets/Team75LogoVUSE.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>
          <Text style={{ color: '#ff0000' }}>Robo Raiders</Text>
          <Text style={{ color: '#ffffff' }}>: Register</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            onKeyPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            onKeyPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onKeyPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🚫👁️‍🗨️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onKeyPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '🚫👁️‍🗨️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleRegister}
        >
          <Text style={styles.loginButtonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginRedirectButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            navigation.replace('LoginPage');
          }}
        >
          <Text style={styles.loginRedirectText}>Already have an account? Login here</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  loginButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginRedirectButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ff0000'
  },
  loginRedirectText: {
    color: '#ff0000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
    alignSelf: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    color: '#000000',
  },
  eyeButton: {
    padding: 10,
  },
  eyeIcon: {
    fontSize: 20,
  },
});

export default RegisterPage;