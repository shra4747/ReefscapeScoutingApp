// screens/PostGame.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostGame = () => {
  const navigation = useNavigation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [openRobotType, setOpenRobotType] = useState(false);
  const [robotTypeValue, setRobotTypeValue] = useState([]);
  const [defenseNotes, setDefenseNotes] = useState('');
  
  const [robotTypeItems, setRobotTypeItems] = useState([
    { label: 'Coral', value: 'coral' },
    { label: 'Algae', value: 'algae' },
    { label: 'Shooter', value: 'shooter' },
    { label: 'Chassis', value: 'chassis' },
    { label: 'Defense', value: 'defense' },
  ]);

  const handleSubmit = async () => {
    if (robotTypeValue.length === 0) {
      // Don't proceed if no robot types are selected
      return;
    }
    
    const postGameData = {
      robotType: robotTypeValue,
      defenseNotes: robotTypeValue.includes('defense') ? defenseNotes : null
    }

    console.log("Post Game Data: ", postGameData);
    await AsyncStorage.setItem('POSTGAME_DATA', JSON.stringify(postGameData));

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
        placeholder="Select Robot Type(s)"
        multiple={true}
        mode="BADGE"
        badgeDotColors={["#ff3030"]}
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        zIndex={3000}
      />

      {robotTypeValue.includes('defense') && (
        <>
          <Text style={[styles.dropdownTitle, { marginTop: 20 }]}>Defense Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Enter defense notes..."
            placeholderTextColor="#888"
            value={defenseNotes}
            onChangeText={setDefenseNotes}
            multiline
          />
        </>
      )}

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
  notesInput: {
    width: '80%',
    minHeight: 100,
    borderColor: '#ff3030',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    color: '#fff',
    backgroundColor: '#222',
    textAlignVertical: 'top',
  },
});

export default PostGame;