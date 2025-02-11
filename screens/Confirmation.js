// screens/Confirmation.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Confirmation = () => {
  const navigation = useNavigation();

  const onSubmit = async () => {
    try {
      // Get all the stored data
      const matchInfo = await AsyncStorage.getItem('MATCH_INFO');
      const autoPickups = await AsyncStorage.getItem('AUTO_PICKUPS');
      const teleopPickups = await AsyncStorage.getItem('Teleop_PICKUPS');
      const processorData = await AsyncStorage.getItem('PROCESSOR_DATA');
      const reefData = await AsyncStorage.getItem('REEF_DATA');
      const endgameData = await AsyncStorage.getItem('ENDGAME_DATA');
      const postgameData = await AsyncStorage.getItem('POSTGAME_DATA');

      // Compile all data into one object
      const submissionData = {
        matchInfo: JSON.parse(matchInfo),
        autoPickups: JSON.parse(autoPickups),
        teleopPickups: JSON.parse(teleopPickups),
        processorData: JSON.parse(processorData),
        reefData: JSON.parse(reefData),
        endgameData: JSON.parse(endgameData),
        postgameData: JSON.parse(postgameData)
      };

      console.log('Final Submission Data:', submissionData);

      // Clear all stored data
      await AsyncStorage.multiRemove([
        'MATCH_INFO',
        'AUTO_PICKUPS',
        'Teleop_PICKUPS', 
        'PROCESSOR_DATA',
        'REEF_DATA',
        'ENDGAME_DATA',
        'POSTGAME_DATA',
        'ALLIANCE_COLOR'
      ]);

      // Navigate back to start
      navigation.popToTop();

    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>
        You have successfully scouted this match. Click SUBMIT.
      </Text>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={onSubmit}
      >
        <Text style={styles.backButtonText}>Submit</Text>
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
  backButton: {
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
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Confirmation;