// screens/Confirmation.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Confirmation = () => {
  const navigation = useNavigation();

  const handleSubmit = () => {
    // Perform any confirmation logic here
    
    // Navigate to StartPage
    navigation.navigate('StartPage');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>
        You have successfully scouted this match. Click SUBMIT.
      </Text>

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  submitButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Confirmation;