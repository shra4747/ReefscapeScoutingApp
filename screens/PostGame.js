// screens/PostGame.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';

const PostGame = () => {
  const navigation = useNavigation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [openRobotType, setOpenRobotType] = useState(false);
  const [openIntake, setOpenIntake] = useState(false);
  const [openEndEffector, setOpenEndEffector] = useState(false);
  const [robotTypeValue, setRobotTypeValue] = useState(null);
  const [intakeValue, setIntakeValue] = useState(null);
  const [endEffectorValue, setEndEffectorValue] = useState(null);
  
  const [robotTypeItems, setRobotTypeItems] = useState([
    { label: 'Select a robot type...', value: null },
    { label: 'Coral', value: 'coral' },
    { label: 'Algae', value: 'algae' },
    { label: 'Coral and Algae', value: 'coral_and_algae' },
    { label: 'Shooter', value: 'shooter' },
    { label: 'Feeder', value: 'feeder' },
    { label: 'Chassis', value: 'chassis' },
    { label: 'Defense', value: 'defense' },
  ]);

  const [intakeItems, setIntakeItems] = useState([
    { label: 'Select an intake method...', value: null },
    { label: 'Human Player Station', value: 'human_station' },
    { label: 'Ground', value: 'ground' },
    { label: 'Both', value: 'both' },
  ]);

  const [endEffectorItems, setEndEffectorItems] = useState([
    { label: 'Select an end-effector type...', value: null },
    { label: '2-in-1 Hold', value: '2in1_hold' },
    { label: 'Double Hold', value: 'double_hold' },
    { label: 'Single Hold', value: 'single_hold' },
    { label: 'No Hold', value: 'no_hold' },
  ]);

  const handleSubmit = () => {
    if (!robotTypeValue || !intakeValue || !endEffectorValue) {
      // Don't proceed if any value is null
      return;
    }
    
    console.log({
      robotType: robotTypeValue,
      intake: intakeValue,
      endEffector: endEffectorValue
    });
    navigation.navigate('Confirmation');
  };

  if (showConfirmation) {
    return (
      <View style={styles.confirmationContainer}>
        <Text style={styles.successText}>
          You have successfully submitted
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowConfirmation(false)}
        >
          <Text style={styles.backButtonText}>Back to Start Page</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 20 }]}>Postgame</Text>
      
      <Text style={[styles.dropdownTitle, { marginTop: 20 }]}>Robot Type</Text>
      <DropDownPicker
        open={openRobotType}
        value={robotTypeValue}
        items={robotTypeItems}
        setOpen={setOpenRobotType}
        setValue={setRobotTypeValue}
        setItems={setRobotTypeItems}
        placeholder="Select Robot Type"
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        zIndex={3000}
      />

      <Text style={[styles.dropdownTitle, { marginTop: 20 }]}>Robot Intake</Text>
      <DropDownPicker
        open={openIntake}
        value={intakeValue}
        items={intakeItems}
        setOpen={setOpenIntake}
        setValue={setIntakeValue}
        setItems={setIntakeItems}
        placeholder="Select Robot Intake"
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        zIndex={2000}
      />

      <Text style={[styles.dropdownTitle, { marginTop: 20 }]}>Robot End-Effector</Text>
      <DropDownPicker
        open={openEndEffector}
        value={endEffectorValue}
        items={endEffectorItems}
        setOpen={setOpenEndEffector}
        setValue={setEndEffectorValue}
        setItems={setEndEffectorItems}
        placeholder="Select End-Effector Type"
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        zIndex={1000}
      />

      <TouchableOpacity 
        style={[styles.submitButton, { marginTop: 20 }]} 
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
    paddingTop: 40,
    backgroundColor: '#000000', // Black background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff', // White text
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginLeft: '10%',
    marginBottom: 5,
    color: '#ff3030', // Red text for emphasis
  },
  dropdown: {
    borderColor: '#ff3030', // Red border
  },
  dropdownContainer: {
    width: '80%',
  },
  submitButton: {
    backgroundColor: '#ff3030', // Red button
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 40,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white', // White text
    fontSize: 18,
    fontWeight: '600',
  },
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2196F3',
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

export default PostGame;