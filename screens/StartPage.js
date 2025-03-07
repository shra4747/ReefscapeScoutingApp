import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  interpolate
} from 'react-native-reanimated';

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

  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allianceColor, setAllianceColor] = useState(null);
  const [driverStation, setDriverStation] = useState('Left');
  const rotation = useSharedValue(0);

  const [openPosition, setOpenPosition] = useState(false);
  const [valuePosition, setValuePosition] = useState(null);
  const [itemsPosition, setItemsPosition] = useState([
    { label: 'Far Starting Position', value: 'far' },
    { label: 'Middle Starting Position', value: 'middle' },
    { label: 'Close Starting Position', value: 'close' }
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg`
      }]
    };
  });

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        
        const response = await fetch(`http://97.107.134.214:5002/schedule`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch schedule');
        
        const data = await response.json();
        setScheduleData(data);
        
        // Update matches dropdown
        const uniqueMatches = [...new Set(data.map(item => item.match_number))];
        setItemsMatch(uniqueMatches.map(match => ({
          label: `Match ${match}`,
          value: match.toString()
        })));

      } catch (error) {
        Alert.alert('Error', 'Failed to load schedule');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add focus listener
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSchedule();
    });

    // Initial fetch
    fetchSchedule();

    // Cleanup
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (valueMatch) {
      const teamsForMatch = scheduleData
        .filter(item => item.match_number.toString() === valueMatch)
        .map(item => ({
          label: `Team ${item.team_number}`,
          value: item.team_number.toString(),
          alliance: item.alliance_color
        }));
      
      setItemsTeam(teamsForMatch);
    }
  }, [valueMatch, scheduleData]);

  useEffect(() => {
    if (valueTeam && itemsTeam.length > 0) {
      const selectedTeam = itemsTeam.find(team => team.value === valueTeam);
      if (selectedTeam) {
        setAllianceColor(selectedTeam.alliance.toLowerCase());
      }
    }
  }, [valueTeam, itemsTeam]);

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

  useEffect(() => {
    const loadDriverStation = async () => {
      const storedStation = await AsyncStorage.getItem('START_DRIVER_STATION');
      if (storedStation) {
        setDriverStation(storedStation);
        // Set initial rotation if needed
        rotation.value = withSpring(storedStation === 'Right' ? 1 : 0, {
          damping: 12,
          stiffness: 90,
          mass: 1
        });
      } else {
        await AsyncStorage.setItem('START_DRIVER_STATION', 'Left');
      }
    };
    loadDriverStation();
  }, []);

  const toggleDriverStation = () => {
    const newValue = driverStation === 'Left' ? 'Right' : 'Left';
    setDriverStation(newValue);
    AsyncStorage.setItem('START_DRIVER_STATION', newValue);
    
    rotation.value = withSpring(newValue === 'Right' ? 1 : 0, {
      damping: 12,
      stiffness: 90,
      mass: 1
    });

  };

  const handleSubmit = async () => {
    if (valueMatch === null || valueTeam === null || valuePosition === null || allianceColor === null) {
      Alert.alert('Error', 'Please fill in all fields before submitting');
      return;
    }

    // Flip starting position based on driver station and alliance color
    let finalPosition = valuePosition;
    if (driverStation == "Right") {
      if (allianceColor == "blue") {

      }
      else if (allianceColor == "red") {
        finalPosition = (finalPosition === "close") ? "far" : "close"
      }

    }

    if (driverStation == "Left") {
      if (allianceColor == "red") {

      }
      else if (allianceColor == "blue") {
        finalPosition = (finalPosition === "close") ? "far" : "close"
      }

    }
    

    if (driverStation == "Left" && allianceColor == "red") {
      await AsyncStorage.setItem('DRIVER_STATION', "Left");
    }
    else if (driverStation == "Right" && allianceColor == "blue") {
      await AsyncStorage.setItem('DRIVER_STATION', "Left");
    }
    else {
      await AsyncStorage.setItem('DRIVER_STATION', "Right");
    }

    const newData = {
      match_number: valueMatch,
      team_number: valueTeam,
      match_start_time: new Date().toISOString(),
      alliance_color: allianceColor == "red" ? "Red" : "Blue",
      start_position: finalPosition || 'none' // Use the flipped position
    };

    setStartPageData([newData]);

    await AsyncStorage.setItem('ALLIANCE_COLOR', allianceColor == "red" ? "Red" : "Blue");
    await AsyncStorage.setItem('AUTO_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('Teleop_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('PROCESSOR_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('REEF_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('ENDGAME_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('POSTGAME_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('MATCH_INFO', JSON.stringify(newData));
    // await AsyncStorage.setItem('STARTING_POSITION', finalPosition || 'none');


    setScouterId('');
    setOpenMatch(false);
    setValueMatch(null);
    setItemsTeam([]);
    setOpenTeam(false);
    setValueTeam(null);
    setStartPageData([]);
    // setItemsPosition()

    navigation.navigate('Auto');
  };

  const handleAllianceColorSelect = (color) => {
    setAllianceColor(color);
    
    Alert.alert(
      'Select Driver Station',
      'Please choose your driver station:',
      [
        {
          text: 'Right Driver Station',
          onPress: async () => {
            await AsyncStorage.setItem('DRIVER_STATION', 'Right');
            await AsyncStorage.setItem('DRIVER_STATION_ORDER', 'reversed');
          },
          style: 'default',
        },
        {
          text: 'Left Driver Station',
          onPress: async () => {
            await AsyncStorage.setItem('DRIVER_STATION', 'Left');
            await AsyncStorage.setItem('DRIVER_STATION_ORDER', 'normal');
          },
          style: 'default',
        },
      ],
      { 
        cancelable: true,
        userInterfaceStyle: 'dark',
      }
    );
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

        {/* Admin Console Button */}
        <TouchableOpacity
          style={[styles.adminButton, { left: '50%', transform: [{ translateX: -100 }, { translateY: 20 }] }]}
          onPress={() => {
            Alert.prompt(
              'Admin Access',
              'Enter password:',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Submit',
                  onPress: (password) => {
                    if (password === 'HOUSTON2025') {
                      navigation.navigate('AdminConsole');
                    } else {
                      Alert.alert('Error', 'Incorrect password');
                    }
                  },
                },
              ],
              'secure-text'
            );
          }}
        >
          <Text style={styles.adminButtonText}>Admin Console</Text>
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
          source={require('../assets/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={toggleDriverStation} style={styles.fieldContainer}>
          <Animated.Image
            source={require('../assets/field.png')}
            style={[styles.fieldImage, animatedStyle]}
          />
        </TouchableOpacity>

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

        {/* Display Selected Match, Team, and Alliance */}
        <Text style={styles.resultText}>Selected Match: {valueMatch || 'None'}</Text>
        {valueTeam && <Text style={styles.resultText}>Selected Team: {valueTeam}</Text>}
        <Text style={styles.resultText}>
          Alliance Color: {allianceColor ? allianceColor.charAt(0).toUpperCase() + allianceColor.slice(1) : 'None'}
        </Text>

        {/* Starting Position Dropdown */}
        <Text style={styles.title}>Starting Position</Text>
        <DropDownPicker
          open={openPosition}
          value={valuePosition}
          items={itemsPosition}
          setOpen={setOpenPosition}
          setValue={setValuePosition}
          setItems={setItemsPosition}
          containerStyle={styles.dropdownContainer}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={1000}
          zIndexInverse={3000}
        />

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
    backgroundColor: 'red',
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
    width: '50%',
    height: 100,
    alignSelf: 'center',
    // marginVertical: 20,
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
  fieldContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  fieldImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  adminButton: {
    position: 'absolute',
    top: 40,
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 15,
    width: 200,
    height: 35,
    alignItems: 'center',
  },
  adminButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default StartPage;