import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  interpolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const EVENT_CODE = 'NJFLA'; // Manually set your event code here

const StartPage = () => {
  const navigation = useNavigation();
  const [scouterId, setScouterId] = useState('');
  const [matchNumber, setMatchNumber] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [startPageData, setStartPageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allianceColor, setAllianceColor] = useState(null);
  const [driverStation, setDriverStation] = useState('Left');
  const rotation = useSharedValue(0);

  const [scheduleData, setScheduleData] = useState([]);

  const [openPosition, setOpenPosition] = useState(false);
  const [valuePosition, setValuePosition] = useState(null);
  const [itemsPosition, setItemsPosition] = useState([
    { label: 'Far Starting Position', value: 'far' },
    { label: 'Middle Starting Position', value: 'middle' },
    { label: 'Close Starting Position', value: 'close' }
  ]);
  const [teamPositions, setTeamPositions] = useState([]);

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);

  // New state for match search
  const [matchSearch, setMatchSearch] = useState('');
  const [filteredMatches, setFilteredMatches] = useState([]);

  // New state for pagination
  const [currentMatchPage, setCurrentMatchPage] = useState(0);
  const matchesPerPage = 6;

  // New state for cool dropdown
  const [openMatchDropdown, setOpenMatchDropdown] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateX: `${interpolate(rotation.value, [0, 1], [0, 180])}deg`
        },
        {
          rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg`
        }
      ]
    };
  });

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const authToken = await AsyncStorage.getItem('ACCESS_TOKEN');
        
        const scheduleResponse = await fetch(`http://10.0.0.213:5002/schedule/${EVENT_CODE}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!scheduleResponse.ok) throw new Error('Failed to fetch schedule');
        
        const scheduleData = await scheduleResponse.json();
        const scoutedResponse = await fetch(`http://10.0.0.213:5002/robots_in_match`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!scoutedResponse.ok) throw new Error('Failed to fetch scouted matches');
        
        const scoutedMatches = await scoutedResponse.json();
        
        const availableMatches = scheduleData.schedule.filter(scheduleItem => 
          !scoutedMatches.some(scoutedItem => 
            scoutedItem.match_number === scheduleItem.match_number &&
            scoutedItem.event_code === scheduleItem.event_code
          )
        );

        // Get unique matches
        const uniqueMatches = [...new Set(availableMatches.map(item => item.match_number))]
          .map(matchNumber => ({
            label: `Match ${matchNumber}`,
            value: matchNumber.toString()
          }));
        
        setMatches(uniqueMatches);
        setScheduleData(availableMatches);

        // Automatically select the first match if available
        if (uniqueMatches.length > 0) {
          setSelectedMatch(uniqueMatches[0].value);
        }

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
    if (selectedMatch) {
      const teamsInMatch = scheduleData
        .filter(item => item.match_number.toString() === selectedMatch)
        .map(item => ({
          label: `Team ${item.team_number}`,
          value: item.team_number.toString(),
          alliance: item.alliance_color
        }));

      // Sort teams: red alliance first, then blue alliance
      const sortedTeams = teamsInMatch.sort((a, b) => {
        if (a.alliance === 'red' && b.alliance === 'blue') return -1;
        if (a.alliance === 'blue' && b.alliance === 'red') return 1;
        return 0;
      });
      
      setTeams(sortedTeams);
    }
  }, [selectedMatch, scheduleData]);

  useEffect(() => {
    if (valuePosition && teamPositions.length > 0) {
      const selectedTeam = teamPositions.find(team => team.value === valuePosition.value);
      if (selectedTeam) {
        setAllianceColor(selectedTeam.alliance.toLowerCase());
      }
    }
  }, [valuePosition, teamPositions]);

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
    
    // Save both driver station and order based on alliance color
    const stationOrder = allianceColor === 'red' ? 
      (newValue === 'Right' ? 'reversed' : 'normal') :
      (newValue === 'Right' ? 'normal' : 'reversed');
    
    AsyncStorage.multiSet([
      ['START_DRIVER_STATION', newValue],
      ['DRIVER_STATION', newValue],
      ['DRIVER_STATION_ORDER', stationOrder]
    ]);
    
    rotation.value = withSpring(newValue === 'Right' ? 1 : 0, {
      damping: 12,
      stiffness: 90,
      mass: 1
    });
  };

  const handleAllianceColorSelect = (color) => {
    setAllianceColor(color);
    
    // Update driver station order based on selected color
    const stationOrder = color === 'red' ? 
      (driverStation === 'Right' ? 'reversed' : 'normal') :
      (driverStation === 'Right' ? 'normal' : 'reversed');
    
    Alert.alert(
      'Select Driver Station',
      'Please choose your driver station:',
      [
        {
          text: 'Right Driver Station',
          onPress: async () => {
            await AsyncStorage.multiSet([
              ['DRIVER_STATION', 'Right'],
              ['DRIVER_STATION_ORDER', stationOrder]
            ]);
            setDriverStation('Right');
            rotation.value = withSpring(1, {
              damping: 12,
              stiffness: 90,
              mass: 1
            });
          },
          style: 'default',
        },
        {
          text: 'Left Driver Station',
          onPress: async () => {
            await AsyncStorage.multiSet([
              ['DRIVER_STATION', 'Left'],
              ['DRIVER_STATION_ORDER', stationOrder]
            ]);
            setDriverStation('Left');
            rotation.value = withSpring(0, {
              damping: 12,
              stiffness: 90,
              mass: 1
            });
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

  const handleSubmit = async () => {
    if (!selectedMatch || !selectedTeam || !valuePosition || !allianceColor) {
      Alert.alert('Error', 'Please select all fields before submitting');
      return;
    }

    const newData = {
      match_number: selectedMatch,
      team_number: selectedTeam,
      event_code: EVENT_CODE,
      match_start_time: new Date().toISOString(),
      alliance_color: allianceColor == "red" ? "Red" : "Blue",
      start_position: valuePosition || 'none'
    };

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

    // Print out the submitted data
    console.log('Submitted Data:', newData);
    console.log('Match Number:', selectedMatch);
    console.log('Team Number:', selectedTeam);
    console.log('Event Code:', EVENT_CODE);
    console.log('Alliance Color:', allianceColor);
    console.log('Starting Position:', valuePosition);

    setStartPageData([newData]);

    await AsyncStorage.setItem('ALLIANCE_COLOR', allianceColor == "red" ? "Red" : "Blue");
    await AsyncStorage.setItem('AUTO_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('Teleop_PICKUPS', JSON.stringify([]));
    await AsyncStorage.setItem('PROCESSOR_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('REEF_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('ENDGAME_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('POSTGAME_DATA', JSON.stringify([]));
    await AsyncStorage.setItem('MATCH_INFO', JSON.stringify(newData));

    setScouterId('');
    setValuePosition(null);
    setItemsPosition([
      { label: 'Far Starting Position', value: 'far' },
      { label: 'Middle Starting Position', value: 'middle' },
      { label: 'Close Starting Position', value: 'close' }
    ]);

    setMatchNumber('');
    setTeamNumber('');

    navigation.navigate('Auto');
  };

  // Update match filtering
  useEffect(() => {
    if (matchSearch) {
      const filtered = matches.filter(match => 
        match.label.toLowerCase().includes(matchSearch.toLowerCase())
      );
      setFilteredMatches(filtered);
    } else {
      setFilteredMatches(matches);
    }
  }, [matchSearch, matches]);

  // Paginated matches
  const paginatedMatches = () => {
    const startIndex = currentMatchPage * matchesPerPage;
    return filteredMatches.slice(startIndex, startIndex + matchesPerPage);
  };

  // Improved match selection UI
  const renderMatchSelection = () => (
    <View style={styles.matchSelectionContainer}>
      <Text style={styles.selectionTitle}>Select Match</Text>
      <DropDownPicker
        open={openMatchDropdown}
        value={selectedMatch}
        items={matches}
        setOpen={setOpenMatchDropdown}
        setValue={setSelectedMatch}
        setItems={setMatches}
        placeholder="Select a match"
        style={styles.simpleDropdown}
        containerStyle={styles.dropdownContainer}
        dropDownContainerStyle={styles.simpleDropdownBox}
        zIndex={1000}
        zIndexInverse={3000}
        onChangeValue={(value) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedMatch(value);
          setSelectedTeam(null);
        }}
      />
    </View>
  );

  // Improved team selection UI
  const renderTeamSelection = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.selectionTitle2}>Select Team</Text>
      <View style={styles.teamCarousel}>
        {teams.map((team, index) => (
          <Animated.View
            key={team.value}
            style={[
              styles.teamCard,
              selectedTeam === team.value && styles.selectedTeamCard,
              {
                transform: [
                  { 
                    scale: selectedTeam === team.value ? 1 : 0.9 
                  },
                  { 
                    translateY: selectedTeam === team.value ? 0 : 10 
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.teamContent,
                team.alliance === 'red' && styles.redTeam,
                team.alliance === 'blue' && styles.blueTeam
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedTeam(team.value);
                setAllianceColor(team.alliance.toLowerCase());
              }}
            >
              <Text style={styles.teamNumber}>{team.label}</Text>
              <View style={styles.allianceIndicator}>
                <Text style={styles.allianceText}>
                  {team.alliance === 'red' ? 'Red Alliance' : 'Blue Alliance'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            {/* Left Profile Button */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                navigation.navigate('PitScouting');
              }}
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
              style={styles.adminButton}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
              style={styles.profileButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                navigation.navigate('Profile');
              }}
            >
              <View style={styles.profileIcon}>
                <Image
                  source={require('../assets/converted_image.jpeg')}
                  style={styles.profileImage}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.pageTitle, { color: 'red' }]}>TEAM 75:</Text>
            <Text style={[styles.pageTitle, { color: 'white' }]}> SCOUTING APP</Text>
          </View>

          {/* Rest of the content */}
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

          <View style={styles.contentContainer}>
            {renderMatchSelection()}
            {selectedMatch && renderTeamSelection()}

            {/* Starting Position Dropdown */}
            <View style={styles.positionContainer}>
              <Text style={styles.title}>Starting Position</Text>
              <DropDownPicker
                open={openPosition}
                value={valuePosition}
                items={itemsPosition}
                setOpen={setOpenPosition}
                setValue={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setValuePosition(value);
                }}
                setItems={setItemsPosition}
                placeholder="Select Starting Position"
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                dropDownContainerStyle={styles.dropdownBox}
                zIndex={1000}
                zIndexInverse={3000}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Start Match {selectedMatch}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingVertical: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 25,
  },
  profileButton: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: -100,
    width: '100%',
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
    marginTop: 15,
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
    marginBottom: 0,
    alignSelf: 'center',
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
    backgroundColor: '#808080',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
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
    opacity: 0
    // marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  colorButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 15,
    width: 200,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectionContainer: {
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  selectionTitle2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 0,
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  matchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  matchButton: {
    width: '30%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#444',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#444',
  },
  paginationText: {
    color: 'white',
    fontSize: 14,
  },
  teamList: {
    width: '100%',
  },
  teamItem: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#444',
  },
  teamItemText: {
    color: 'white',
    fontSize: 14,
  },
  coolDropdown: {
    backgroundColor: '#333',
    borderColor: '#444',
    borderRadius: 10,
  },
  coolDropdownBox: {
    backgroundColor: '#333',
    borderColor: '#444',
    borderRadius: 10,
    marginTop: 5,
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  teamCarousel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  teamCard: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  selectedTeamCard: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  teamContent: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  teamNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  allianceIndicator: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  allianceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  redTeam: {
    backgroundColor: '#ff3030',
  },
  blueTeam: {
    backgroundColor: '#308aff',
  },
  matchSelectionContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  simpleDropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#444',
    borderRadius: 10,
  },
  simpleDropdownBox: {
    backgroundColor: '#ffffff',
    borderColor: '#444',
    borderRadius: 10,
    marginTop: 5,
  },
  contentContainer: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  positionContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: -15
  },
});

export default StartPage;