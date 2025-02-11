import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StartPage = () => {
  const navigation = useNavigation();
  const [scouterId, setScouterId] = useState(''); // Scouter ID state
  const [openMatch, setOpenMatch] = useState(false); // Match dropdown open state
  const [valueMatch, setValueMatch] = useState(null); // Selected match value
  const [itemsMatch, setItemsMatch] = useState(
    Array.from({ length: 14 }, (_, i) => ({
      label: `Match ${i + 1}`,
      value: `${i + 1}`,
    }))
  );

  const [openTeam, setOpenTeam] = useState(false); // Team dropdown open state
  const [valueTeam, setValueTeam] = useState(null); // Selected team value
  const [itemsTeam, setItemsTeam] = useState([]); // Team options

  const [startPageData, setStartPageData] = useState([]); // List to store start page data

  const [openAlliance, setOpenAlliance] = useState(false); // Alliance color dropdown open state
  const [allianceColor, setAllianceColor] = useState(null); // Alliance color state
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    // Generate random 5-digit team numbers when a match is selected
    if (valueMatch) {
      const randomTeams = Array.from({ length: 6 }, () => {
        const randomTeamNumber = Math.floor(10000 + Math.random() * 90000).toString();
        return { label: `Team ${randomTeamNumber}`, value: randomTeamNumber };
      });
      setItemsTeam(randomTeams);
    }
  }, [valueMatch]);

  useEffect(() => {
    // Close the team dropdown when the match dropdown is reopened
    if (openMatch) {
      setOpenTeam(false);
    }
  }, [openMatch]);

  useEffect(() => {
    // Reset the team dropdown if the match selection changes
    if (valueMatch !== null) {
      setValueTeam(null);
    }
  }, [valueMatch]);

  const handleSubmit = async () => {
    // Prepare the data to be submitted
    const newData = {
      match_number: valueMatch,
      team_number: valueTeam,
      alliance_color: allianceColor, // Include alliance color in the data
    };

    // Add the new data to the startPageData list
    setStartPageData([newData]);

    // Store the alliance color in AsyncStorage
    await AsyncStorage.setItem('ALLIANCE_COLOR', allianceColor); // Store selected color

    await AsyncStorage.setItem('AUTO_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('Teleop_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('PROCESSOR_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('REEF_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('ENDGAME_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('POSTGAME_DATA', JSON.stringify([]));

    await AsyncStorage.setItem('MATCH_INFO', JSON.stringify(newData));

    // Log the startPageData to the console
    console.log('Start Page Data:', newData);

    setScouterId(''); // Reset Scouter ID
    setOpenMatch(false); // Reset Match dropdown
    setValueMatch(null); // Reset Match value
    setItemsTeam([]); // Reset Team options
    setOpenTeam(false); // Reset Team dropdown
    setValueTeam(null); // Reset Team value
    setStartPageData([]); // Reset start page data
    setOpenAlliance(false); // Reset Alliance dropdown
    setAllianceColor(null); // Reset Alliance color

    // Navigate to the next screen
    navigation.navigate('Auto');
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Page Title */}
        <View style={[styles.titleContainer, { position: 'absolute', top: 80 }]}>
          <Text style={[styles.pageTitle, { color: 'red' }]}>TEAM 75:</Text>
          <Text style={[styles.pageTitle, { color: 'white' }]}> SCOUTING APP</Text>
        </View>

        <Image 
          source={{uri: 'https://static.wixstatic.com/media/3c0a84_5655d31135124d9fa8073e1c4bcffbd6~mv2.png/v1/fill/w_560,h_198,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fd_frc_reefscape_wordmark_black_pms_edit.png'}}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Alliance Color Selection */}
        <Text style={styles.title}>Select Alliance Color</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.colorButton, allianceColor === 'Red' ? styles.selectedButtonRed : styles.defaultButton]}
            onPress={() => setAllianceColor('Red')}
          >
            <Text style={styles.buttonText}>Red</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.colorButton, allianceColor === 'Blue' ? styles.selectedButtonBlue : styles.defaultButton]}
            onPress={() => setAllianceColor('Blue')}
          >
            <Text style={styles.buttonText}>Blue</Text>
          </TouchableOpacity>
        </View>

        {/* Match Number Dropdown */}
        <Text style={styles.title}>Match Number</Text>
        <DropDownPicker
          open={openMatch}
          value={valueMatch}
          items={itemsMatch}
          setOpen={setOpenMatch}
          setValue={setValueMatch}
          setItems={setItemsMatch}
          containerStyle={styles.dropdownContainer}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={3000}  // Higher z-index for top dropdown
          zIndexInverse={1000}
        />

        {/* Team Number Dropdown (Visible only after match selection) */}
        {valueMatch && (
          <>
            <Text style={styles.title}>Team Number</Text>
            <DropDownPicker
              open={openTeam}
              value={valueTeam}
              items={itemsTeam}
              setOpen={setOpenTeam}
              setValue={setValueTeam}
              setItems={setItemsTeam}
              containerStyle={styles.dropdownContainer}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownBox}
              zIndex={2000} // Lower than match dropdown
              zIndexInverse={1000}
            />
          </>
        )}

        {/* Display Selected Match and Team */}
        <Text style={styles.resultText}>Selected Match: {valueMatch || 'None'}</Text>
        {valueTeam && <Text style={styles.resultText}>Selected Team: {valueTeam}</Text>}
        <Text style={styles.resultText}>Selected Alliance Color: {allianceColor || 'None'}</Text>

        {/* Updated Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000', // Black background
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff', // White text
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff', // White text for other titles
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#ff3030', // Red border
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000', // Black text for input
    backgroundColor: '#ffffff', // White background for input
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '80%',
    marginBottom: 20,
  },
  dropdown: {
    borderColor: '#ff3030', // Red border
    backgroundColor: '#ffffff', // White background for dropdown
  },
  dropdownBox: {
    borderColor: '#ccc',
    backgroundColor: '#ffffff', // White background for dropdown box
  },
  resultText: {
    fontSize: 16,
    color: '#ffffff', // White text
  },
  submitButton: {
    backgroundColor: '#ff3030', // Red button
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 40,
  },
  submitButtonText: {
    color: 'white', // White text
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: '80%',
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
  },
  colorButton: {
    width: '49%', // Adjust width as needed
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  selectedButtonRed: {
    backgroundColor: '#ff3030', // Background color for selected red button
  },
  selectedButtonBlue: {
    backgroundColor: '#308aff', // Background color for selected blue button
  },
  defaultButton: {
    backgroundColor: '#ccc', // Default background color for unselected buttons
  },
  buttonText: {
    color: 'white', // White text for button text
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default StartPage;
