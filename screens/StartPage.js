import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const BlankScreen = () => {
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

  const handleInputChange = (value) => {
    // Allow only numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setScouterId(numericValue);
  };

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

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Page Title */}
        <View style={[styles.titleContainer, { position: 'absolute', top: 80 }]}>
          <Text style={[styles.pageTitle, { color: 'black' }]}>TEAM 75:</Text>
          <Text style={[styles.pageTitle, { color: 'red' }]}> SCOUTING APP</Text>
        </View>

        <Image 
          source={{uri: 'https://static.wixstatic.com/media/3c0a84_5655d31135124d9fa8073e1c4bcffbd6~mv2.png/v1/fill/w_560,h_198,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fd_frc_reefscape_wordmark_black_pms_edit.png'}}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Scouter ID Input */}
        <Text style={styles.title}>Scouter ID</Text>
        <TextInput
          style={styles.input}
          value={scouterId}
          onChangeText={handleInputChange}
          keyboardType="numeric"
          placeholder="Enter Scouter ID"
          placeholderTextColor="#888"
        />

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

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => {
            // Add your submit logic here
            console.log('Submit pressed');
          }}
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
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '80%',
    marginBottom: 20,
  },
  dropdown: {
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  dropdownBox: {
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: '80%',
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
  },
});

export default BlankScreen;
