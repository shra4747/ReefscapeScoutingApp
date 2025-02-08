// screens/BlankScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AutoP1 = ({ route }) => {
  const navigation = useNavigation();
  const { selectedSection, phase, onActionComplete } = route.params;
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleNumberPress = (number) => {
    if (selectedAction) {
      handleAction(selectedAction);
    }
    setSelectedNumber(number);
  };

  const handleAction = async (action) => {
    if (!selectedNumber) return;

    const actionData = {
      rating: selectedNumber,
      action: action,
      phase: phase
    };

    try {
      const existingData = await AsyncStorage.getItem('PROCESSOR_DATA');
      let updatedData = [];
      
      if (existingData) {
        updatedData = JSON.parse(existingData);
      }
      
      updatedData.push(actionData);
      console.log('Accumulated PROCESSOR Data:', updatedData);
      await AsyncStorage.setItem('PROCESSOR_DATA', JSON.stringify(updatedData));
      navigation.goBack();
      
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Processor</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.makeButton, selectedAction === 'make' && styles.selectedActionButton]}
          onPress={() => {
            setSelectedAction('make');
          }}
        >
          <Text style={styles.buttonText}>Make</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.missButton, selectedAction === 'miss' && styles.selectedActionButton]}
          onPress={() => {
            setSelectedAction('miss');
          }}
        >
          <Text style={styles.buttonText}>Miss</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.ratingTitle}>Processing Rating</Text>
      <View style={styles.numberContainer}>
        {[1, 2, 3, 4, 5].map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.numberButton,
              selectedNumber === number && styles.selectedNumber
            ]}
            onPress={() => handleNumberPress(number)}
          >
            <Text style={styles.numberText}>{number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: '40%',
  },
  makeButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  missButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  numberContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 0,
  },
  numberButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  selectedNumber: {
    backgroundColor: '#FFD700',
  },
  numberText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 80,
  },
  selectedActionButton: {
    backgroundColor: '#FFD700',
  },
});

export default AutoP1;