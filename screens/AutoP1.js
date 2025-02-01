// screens/BlankScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AutoP1 = () => {
  const [selectedNumber, setSelectedNumber] = useState(null);

  const handleNumberPress = (number) => {
    setSelectedNumber(number);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Processor</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.makeButton}>
          <Text style={styles.buttonText}>Make</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.missButton}>
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
      <TouchableOpacity style={styles.doneButton}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2E7D32',
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
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  missButton: {
    backgroundColor: '#FF3B30',
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
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
    position: 'absolute',
    bottom: 40,
  },
  doneButtonText: {
    color: 'white',
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
});

export default AutoP1;