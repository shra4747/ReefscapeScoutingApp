import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const StartPage = () => {
  const navigation = useNavigation();
  const [scouterId, setScouterId] = useState('');
  const [openMatch, setOpenMatch] = useState(false);
  const [valueMatch, setValueMatch] = useState(null);
  const [itemsMatch, setItemsMatch] = useState(
    Array.from({ length: 14 }, (_, i) => ({
      label: `Match ${i + 1}`,
      value: `${i + 1}`,
    }))
  );

  const [openTeam, setOpenTeam] = useState(false);
  const [valueTeam, setValueTeam] = useState(null);
  const [itemsTeam, setItemsTeam] = useState([]);

  const [startPageData, setStartPageData] = useState([]);

  const [openAlliance, setOpenAlliance] = useState(false);
  const [allianceColor, setAllianceColor] = useState(null);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (valueMatch) {
      const randomTeams = Array.from({ length: 6 }, () => {
        const randomTeamNumber = Math.floor(10000 + Math.random() * 90000).toString();
        return { label: `Team ${randomTeamNumber}`, value: randomTeamNumber };
      });
      setItemsTeam(randomTeams);
    }
  }, [valueMatch]);

  useEffect(() => {
    if (openMatch) {
      setOpenTeam(false);
    }
  }, [openMatch]);

  useEffect(() => {
    if (valueMatch !== null) {
      setValueTeam(null);
    }
  }, [valueMatch]);

  const handleSubmit = async () => {
    const newData = {
      match_number: valueMatch,
      team_number: valueTeam,
      alliance_color: allianceColor,
    };

    setStartPageData([newData]);

    await AsyncStorage.setItem('ALLIANCE_COLOR', allianceColor);
    await AsyncStorage.setItem('AUTO_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('Teleop_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('PROCESSOR_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('REEF_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('ENDGAME_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('POSTGAME_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('MATCH_INFO', JSON.stringify(newData));

    console.log('Start Page Data:', newData);

    setScouterId('');
    setOpenMatch(false);
    setValueMatch(null);
    setItemsTeam([]);
    setOpenTeam(false);
    setValueTeam(null);
    setStartPageData([]);
    setOpenAlliance(false);
    setAllianceColor(null);

    navigation.navigate('Auto');
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Left Profile Button */}
        <TouchableOpacity
          style={[styles.profileButton, { left: 20 }]}
          onPress={() => navigation.navigate('PitScouting')}
        >
          <View style={styles.profileIcon}>
            <Image
              source={require('../assets/th.jpeg')}
              style={styles.profileImage}
            />
          </View>
        </TouchableOpacity>

        {/* Right Profile Button */}
        <TouchableOpacity
          style={[styles.profileButton, { right: 20 }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileIcon}>
            <Image
              source={require('../assets/converted_image.jpeg')}
              style={styles.profileImage}
            />
          </View>
        </TouchableOpacity>

        {/* Rest of the StartPage UI */}
        <View style={[styles.titleContainer, { position: 'absolute', top: 100 }]}>
          <Text style={[styles.pageTitle, { color: 'red' }]}>TEAM 75:</Text>
          <Text style={[styles.pageTitle, { color: 'white' }]}> SCOUTING APP</Text>
        </View>

        <Image
          source={{ uri: 'https://static.wixstatic.com/media/3c0a84_5655d31135124d9fa8073e1c4bcffbd6~mv2.png/v1/fill/w_560,h_198,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fd_frc_reefscape_wordmark_black_pms_edit.png' }}
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
          zIndex={3000}
          zIndexInverse={1000}
        />

        {/* Team Number Dropdown */}
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
              zIndex={2000}
              zIndexInverse={1000}
            />
          </>
        )}

        {/* Display Selected Match and Team */}
        <Text style={styles.resultText}>Selected Match: {valueMatch || 'None'}</Text>
        {valueTeam && <Text style={styles.resultText}>Selected Team: {valueTeam}</Text>}
        <Text style={styles.resultText}>Selected Alliance Color: {allianceColor || 'None'}</Text>

        {/* Submit Button */}
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
    backgroundColor: '#000000',
  },
  profileButton: {
    position: 'absolute',
    top: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#ff3030',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '80%',
    marginBottom: 20,
  },
  dropdown: {
    borderColor: '#ff3030',
    backgroundColor: '#ffffff',
  },
  dropdownBox: {
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  resultText: {
    fontSize: 16,
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#ff3030',
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
  colorButton: {
    width: '49%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  selectedButtonRed: {
    backgroundColor: '#ff3030',
  },
  selectedButtonBlue: {
    backgroundColor: '#308aff',
  },
  defaultButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
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