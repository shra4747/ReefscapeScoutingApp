// screens/BlankScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AutoP21 = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Reef</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.makeButton}>
          <Text style={styles.buttonText}>Make</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.missButton}>
          <Text style={styles.buttonText}>Miss</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.deAlgaefyButton}>
        <Text style={styles.deAlgaefyText}>De-Algaefy</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.doneButton}
        onPress={() => navigation.navigate('Auto')}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
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
    paddingVertical: 30,
    paddingHorizontal: 75,
    borderRadius: 10,
    elevation: 3,
  },
  missButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 30,
    paddingHorizontal: 75,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  deAlgaefyButton: {
    backgroundColor: '#008080',
    width: 180,
    height: 180,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    alignSelf: 'center',
    elevation: 3,
  },
  deAlgaefyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AutoP21;