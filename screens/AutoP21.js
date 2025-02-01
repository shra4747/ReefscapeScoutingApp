// screens/BlankScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AutoP21 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processor</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B0082',
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
});

export default AutoP21;