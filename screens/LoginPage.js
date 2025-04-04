// screens/loginpage.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const LoginPage = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Log the username and password on login attempt

    const loginData = {
      username, // Assuming scouterID is used as the username
      password,
    };

    const loginResponse = await fetch('http://192.168.68.67:8081/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
    const res = await loginResponse.json();

    if (!loginResponse.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert(res.message);
      return;
    }

    try {
      const _ = res['access_token'];
    }
    catch (error) {
      alert(res.message);
    }
    
    try {
      // Store the access token in AsyncStorage
      const access_token = res['access_token'];
      await AsyncStorage.setItem('ACCESS_TOKEN', access_token);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('StartPage');
    } catch (error) {
      console.error('Error storing access token:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Error saving login information. Please try again.');
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
          <Text style={{ color: '#ffffff' }}>: Login</Text>
        </Text>
        
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

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerRedirectButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            navigation.replace('RegisterPage');
          }}
        >
          <Text style={styles.registerRedirectText}>Don't have an account? Register here</Text>
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
  registerRedirectButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff0000',
    marginTop: 10,
    width: '100%',
  },
  registerRedirectText: {
    color: '#ff0000',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginPage;