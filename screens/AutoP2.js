// screens/BlankScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AutoP2 = ({ navigation, route }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { selectedSection } = route.params; // Get the selected section if needed
  const slideAnim = useRef(new Animated.Value(400)).current;

  const handleLevelPress = (level) => {
    setSelectedLevel(level);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleDone = () => {
    navigation.goBack()
  };

  const showDeAlgaefy = selectedLevel === 'L2' || selectedLevel === 'L3';

  return (
    <View style={styles.container}>
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

      <Animated.View 
        style={[
          styles.optionsContainer,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.optionsButtonContainer}>
          <TouchableOpacity style={styles.makeButton}>
            <Text style={styles.optionButtonText}>Make</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.missButton}>
            <Text style={styles.optionButtonText}>Miss</Text>
          </TouchableOpacity>
        </View>
        
        {showDeAlgaefy && (
          <TouchableOpacity style={styles.deAlgaefyButton}>
            <Text style={styles.deAlgaefyText}>De-Algaefy</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reefTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 30,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 25,
  },
  button: {
    width: 280,
    height: 80,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff3030',
  },
  selectedButton: {
    backgroundColor: '#90EE90',
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: 'black',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    maxHeight: 280,
  },
  optionsButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  makeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 15,
    width: '47%',
    height: 80,
    justifyContent: 'center',
  },
  missButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 15,
    width: '47%',
    height: 80,
    justifyContent: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deAlgaefyButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  deAlgaefyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#ff3030',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AutoP2;