// screens/BlankScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AutoP2 = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const navigation = useNavigation();

  const handleLevelPress = (level) => {
    setSelectedLevel(level);
    navigation.navigate('AutoP21');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.reefTitle}>Reef</Text>
      <View style={styles.buttonContainer}>
        {['L4', 'L3', 'L2', 'L1'].map((level) => (
          <TouchableOpacity 
            key={level}
            style={[
              styles.button,
              selectedLevel === level && styles.selectedButton
            ]}
            onPress={() => handleLevelPress(level)}
          >
            <Text style={[
              styles.buttonText,
              selectedLevel === level && styles.selectedButtonText
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B0082',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reefTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
    color: 'white',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 100,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 10,
    width: 250,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: 'black',
  },
});

export default AutoP2;