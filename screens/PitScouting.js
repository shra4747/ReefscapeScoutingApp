// screens/BlankScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the correct package
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';

const PitScouting = () => {
  const [teamNumber, setTeamNumber] = useState(''); // State for Team Number
  const [scouterID, setScouterID] = useState(''); // State for Scouter ID
  const [height, setHeight] = useState('42'); // State for Height
  const [length, setLength] = useState('30'); // State for Length
  const [width, setWidth] = useState('30'); // State for Width
  const [cycleTime, setCycleTime] = useState(0); // State for Cycle Time (now a slider)
  const [driverExperience, setDriverExperience] = useState(0); // State for Driver Experience (now a slider)

  // Drive Train Dropdown
  const [openDriveTrain, setOpenDriveTrain] = useState(false);
  const [driveTrainValue, setDriveTrainValue] = useState(null);
  const [driveTrainItems, setDriveTrainItems] = useState([
    { label: 'Select drive train...', value: null },
    { label: 'Swerve', value: 'swerve' },
    { label: 'Tank', value: 'tank' },
    { label: 'Other', value: 'other' },
  ]);

  const handleTeamNumberChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    setTeamNumber(cleanedText);
  };

  const handleScouterIDChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    setScouterID(cleanedText);
  };

  const handleCycleTimeChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, ''); // Allow only integers
    setCycleTime(cleanedText);
  };

  const handleDriverExperienceChange = (text) => {
    setDriverExperience(text); // Allow any text input
  };

  // Generate an array of numbers for the picker (e.g., 0 to 99)
  const generateNumbers = (start, end) => {
    const numbers = [];
    for (let i = start; i <= end; i++) {
      numbers.push(i.toString());
    }
    return numbers;
  };

  // Generate numbers for height (0 to 42), length (0 to 30), and width (0 to 30)
  const heightNumbers = generateNumbers(0, 42); // Height range: 0 to 42
  const lengthNumbers = generateNumbers(0, 30); // Length range: 0 to 30
  const widthNumbers = generateNumbers(0, 30); // Width range: 0 to 30

  // Function to dismiss the keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderContent = () => (
    <>
      <View style={[styles.centeredInputContainer, { marginTop: 80 }]}>
        <Text style={styles.centeredTitle}>Scouter ID</Text>
        <TextInput 
          style={styles.centeredInput} 
          keyboardType="numeric" 
          placeholder="Enter scouter ID" 
          value={scouterID} 
          onChangeText={handleScouterIDChange} 
          maxLength={5} 
        />
      </View>
      <View style={styles.centeredInputContainer}>
        <Text style={styles.centeredTitle}>Team Number</Text>
        <TextInput 
          style={styles.centeredInput} 
          keyboardType="numeric" 
          placeholder="Enter team number" 
          value={teamNumber} 
          onChangeText={handleTeamNumberChange} 
          maxLength={5} 
        />
      </View>
      <View style={styles.rowContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerTitle}>Length</Text>
          <Picker
            selectedValue={length}
            style={styles.picker}
            onValueChange={(itemValue) => setLength(itemValue)}
            itemStyle={styles.pickerItem}
            zIndex={1000}
          >
            {lengthNumbers.map((num) => (
              <Picker.Item key={num} label={num} value={num} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerTitle}>Width</Text>
          <Picker
            selectedValue={width}
            style={styles.picker}
            onValueChange={(itemValue) => setWidth(itemValue)}
            itemStyle={styles.pickerItem}
            zIndex={1000}
          >
            {widthNumbers.map((num) => (
              <Picker.Item key={num} label={num} value={num} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerTitle}>Height</Text>
          <Picker
            selectedValue={height}
            style={styles.picker}
            onValueChange={(itemValue) => setHeight(itemValue)}
            itemStyle={styles.pickerItem}
            zIndex={1000}
          >
            {heightNumbers.map((num) => (
              <Picker.Item key={num} label={num} value={num} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={[styles.centeredInputContainer, { marginTop: 60 }]}>
        <Text style={styles.dropdownTitle}>Drive Train</Text>
        <DropDownPicker
          open={openDriveTrain}
          value={driveTrainValue}
          items={driveTrainItems}
          setOpen={setOpenDriveTrain}
          setValue={setDriveTrainValue}
          setItems={setDriveTrainItems}
          placeholder="Select Drive Train"
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          zIndex={3000}
        />
      </View>
      <View style={styles.centeredInputContainer}>
        <Text style={styles.centeredTitle}>Cycle Time: {cycleTime}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={25}
          step={1}
          value={cycleTime}
          onValueChange={(value) => setCycleTime(value)}
          minimumTrackTintColor="#000000"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#000000"
        />
      </View>
      <View style={styles.centeredInputContainer}>
        <Text style={styles.centeredTitle}>Driver Experience: {driverExperience}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={25}
          step={1}
          value={driverExperience}
          onValueChange={(value) => setDriverExperience(value)}
          minimumTrackTintColor="#000000"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#000000"
        />
      </View>
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={[1]} // Single item to render the content
          renderItem={renderContent}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled" // Ensure keyboard dismisses on tap
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Add padding to ensure content is not cut off
  },
  centeredInputContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  centeredTitle: {
    alignSelf: 'center',
    marginBottom: 8,
    color: 'black',
  },
  centeredInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 300,
    paddingLeft: 8,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '90%',
  },
  pickerColumn: {
    alignItems: 'center',
    width: '30%',
  },
  pickerTitle: {
    alignSelf: 'center',
    marginBottom: 8,
    color: 'black',
  },
  picker: {
    height: 150, // Height of the picker
    width: '100%',
  },
  pickerItem: {
    fontSize: 24, // Larger font size for better visibility
    textAlign: 'center', // Center the text in the wheel
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 5,
    color: 'black',
  },
  dropdown: {
    borderColor: 'gray',
  },
  dropdownContainer: {
    width: '80%',
  },
  slider: {
    width: '80%',
    height: 40,
  },
});

export default PitScouting;