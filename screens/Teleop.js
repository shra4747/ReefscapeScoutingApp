// screens/BlankScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity, Animated, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const Teleop = () => {  

  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [stationCount, setStationCount] = useState(0);
  const [algaeGroundCount, setAlgaeGroundCount] = useState(0);
  const [coralGroundCount, setCoralGroundCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const navigation = useNavigation();
  const [selectedSection, setSelectedSection] = useState(null);
  const [reef, setReef] = useState([]);
  const [currentAction, setCurrentAction] = useState({});
  const [showAlgaeTypeModal, setShowAlgaeTypeModal] = useState(false);
  const [showAlgaeActionModal, setShowAlgaeActionModal] = useState(false);
  const [teamNumber, setTeamNumber] = useState(null);

  const [allianceColor, setAllianceColor] = useState("Blue"); // Default value
  const [driverStation, setDriverStation] = useState(null); // New state for driver station
  const [currentAlgaeType, setCurrentAlgaeType] = useState(null);
  const [algaeModalText, setAlgaeModalText] = useState('Algae Location');

  // Calculate total ground count
  const groundCount = algaeGroundCount + coralGroundCount;

  // Add this state variable for the ground type modal
  const [showGroundTypeModal, setShowGroundTypeModal] = useState(false);

  // Add this state variable at the top with other state declarations
  const [lastGroundType, setLastGroundType] = useState(null);

  useEffect(() => {
    const retrieveAllianceColor = async () => {
      try {
        const color = await AsyncStorage.getItem('ALLIANCE_COLOR');
        if (color !== null) {
          setAllianceColor(color);
        }
      } catch (error) {
        console.error('Error retrieving alliance color:', error);
      }
    };

    retrieveAllianceColor();
  }, []);

  useEffect(() => {
    const retrieveDriverStation = async () => {
      try {
        const station = await AsyncStorage.getItem('DRIVER_STATION');
        if (station !== null) {
          setDriverStation(station);
        }
      } catch (error) {
        console.error('Error retrieving driver station:', error);
      }
    };

    retrieveDriverStation();
  }, []);

  // Use allianceColor to set global_color
  const global_color = allianceColor === "Blue" ? "#308aff" : "#ff3030"; // Adjust based on your needs

  // Use allianceColor and driverStation to set the image source
  const imageSource = () => {
    if (allianceColor === "Red") {
      return driverStation === "Right" ? require('../assets/Redreverse.png') : require('../assets/RedReefVUSE.png');
    } else {
      return driverStation === "Right" ? require('../assets/bluereverse.png') : require('../assets/BlueReefVUSE.png');
    }
  };

  useEffect(() => {
    retrieveReefData();
    
    if (showNotification) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 50,  // Match Auto's value
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -150,  // Match Auto's value
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => setShowNotification(false));
    }
  }, [showNotification]);

  const retrieveReefData = async () => {
    try {
      const value = await AsyncStorage.getItem('REEF_DATA');
      if (value !== null) {
        setReef(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error retrieving reef data:', error);
    }
  };

  const storeReefData = async (newReefData) => {
    try {
      await AsyncStorage.setItem('REEF_DATA', JSON.stringify(newReefData));
    } catch (error) {
      console.error('Error storing reef data:', error);
    }
  };

  const storeTeleopData = async () => {
    const TeleopData = {
      groundAlgaeCount: algaeGroundCount,
      groundCoralCount: coralGroundCount,
      stationCoralCount: stationCount
    };
    try {
      await AsyncStorage.setItem('Teleop_PICKUPS', JSON.stringify(TeleopData));
    } catch (error) {
      console.error('Error storing Teleop data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await storeTeleopData();
      // Add heavy haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      navigation.navigate("EndGame");
    } catch (error) {
      console.error('Error submitting teleop data:', error);
      // Add error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const sectionMapDSLeft = {
    'ML': 'HL',
    'HL': 'HR',
    'HR': 'MR',
    'MR': 'BR',
    'BR': 'BL',
    'BL': "ML",
  };

  const sectionMapDSRight = {
    'ML': 'BR',
    'HL': 'BL',
    'HR': 'ML',
    'MR': 'HL',
    'BR': 'HR',
    'BL': "MR",
  };

  const handleTap = (event) => {
    if (event.nativeEvent.state === State.END) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { x, y } = event.nativeEvent;
      const { width, height } = imageLayout;
      
      const centerX = width / 2;
      const centerY = height / 2;
      const relativeX = x - centerX;
      const relativeY = y - centerY;
      const angle = Math.atan2(relativeY, relativeX);
      const degrees = (angle * 180 / Math.PI + 360) % 360;
      
      // Get section based on angle
      let section;
      if (degrees >= 300 || degrees < 0) section = 'HR';
      else if (degrees >= 0 && degrees < 60) section = 'MR';
      else if (degrees >= 60 && degrees < 120) section = 'BR';
      else if (degrees >= 120 && degrees < 180) section = 'BL';
      else if (degrees >= 180 && degrees < 240) section = 'ML';
      else if (degrees >= 240 && degrees < 300) section = 'HL';

      
      
      setSelectedSection(section);

      // Append the selected section to the reef list

      if (selectedSection === section) {
          const nextSection = driverStation == "Right" ? sectionMapDSRight[section] : sectionMapDSLeft[section]
          navigation.navigate('AutoP2', { selectedSection: nextSection, phase: "teleop" });
          setSelectedSection(null);
      } else {
        setSelectedSection(section);
      }

      setCurrentAction({
        ...currentAction,
        slice: section
      });
    }
  };

  const handleImageLayout = (event) => {
    setImageLayout(event.nativeEvent.layout);
  };

  const handleLevelSelect = (level) => {
    setCurrentAction({
      ...currentAction,
      level: level
    });
  };

  const handleUndo = async () => {
    try {
        // Get both REEF and Algae data
        const reefValue = await AsyncStorage.getItem('REEF_DATA');
        const algaeValue = await AsyncStorage.getItem('ALGAE_DATA');
        
        let reefData = reefValue ? JSON.parse(reefValue) : [];
        let algaeData = algaeValue ? JSON.parse(algaeValue) : [];
        
        // Find the most recent action across both lists
        let mostRecentAction = null;
        let actionType = null;
        
        // Check last reef action
        if (reefData.length > 0) {
            const lastReef = reefData[reefData.length - 1];
            if (!mostRecentAction || new Date(lastReef.timestamp) > new Date(mostRecentAction.timestamp)) {
                mostRecentAction = lastReef;
                actionType = 'REEF';
            }
        }
        
        // Check last algae action
        if (algaeData.length > 0) {
            const lastAlgae = algaeData[algaeData.length - 1];
            if (!mostRecentAction || new Date(lastAlgae.timestamp) > new Date(mostRecentAction.timestamp)) {
                mostRecentAction = lastAlgae;
                actionType = 'ALGAE';
            }
        }
        
        if (mostRecentAction) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (actionType === 'REEF') {
                reefData = reefData.slice(0, -1);
                await AsyncStorage.setItem('REEF_DATA', JSON.stringify(reefData));
                setReef(reefData);
                setShowNotification(`REEF action undone: ${mostRecentAction.slice} ${mostRecentAction.level}`);
            } else {
                algaeData = algaeData.slice(0, -1);
                await AsyncStorage.setItem('ALGAE_DATA', JSON.stringify(algaeData));
                setShowNotification(`ALGAE action undone: ${mostRecentAction.action}`);
            }
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setShowNotification('No actions to undo');
        }
    } catch (error) {
        console.error('Error undoing last action:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowNotification('Error undoing last action');
    }
  };

  // SVG paths for each hexagon section
  const getSectionPath = (section) => {
    const { width, height } = imageLayout;
    const centerX = width / 2 + 5;
    const centerY = height / 2 + 10;
    const baseRadius = Math.min(width, height) * 0.325;

    // Calculate points for the section
    const startAngle = {
      'HR': 300, 'MR': 0, 'BR': 60,
      'BL': 120, 'ML': 180, 'HL': 240
    }[section];
    
    const endAngle = startAngle + 60;
    
    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Adjust radius based on whether it's a vertical or horizontal edge
    const getAdjustedRadius = (angle) => {
      // Normalize angle to 0-360
      const normalizedAngle = ((angle % 360) + 360) % 360;
      
      // Vertical edges (30°, 150°, 210°, 330°) need less radius
      // Horizontal edges (90°, 270°) need more radius
      if (normalizedAngle % 60 === 30) {
        return baseRadius * 0.92;  // Vertical edges
      } else if (normalizedAngle % 180 === 90) {
        return baseRadius * 1.08;  // Horizontal edges
      }
      return baseRadius;  // Diagonal edges
    };

    const radius1 = getAdjustedRadius(startAngle);
    const radius2 = getAdjustedRadius(endAngle);
    
    const x1 = centerX + radius1 * Math.cos(startRad);
    const y1 = centerY + radius1 * Math.sin(startRad);
    const x2 = centerX + radius2 * Math.cos(endRad);
    const y2 = centerY + radius2 * Math.sin(endRad);
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} L ${x2} ${y2} Z`;
  };

  const handleAlgaeButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAlgaeTypeModal(true);
  };

  const handleAlgaeTypeSelect = (type) => {
    if (type === 'Cancel') {
      setShowAlgaeTypeModal(false);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAlgaeModalText('Algae Action');
      setCurrentAlgaeType(type);
    }
  };

  const handleAlgaeAction = async (action) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const algaeData = {
      type: currentAlgaeType,
      action: action,
      phase: "teleop",
      timestamp: new Date().toISOString()
    };

    console.log(algaeData)

    try {
      const existingData = await AsyncStorage.getItem('ALGAE_DATA');
      let updatedData = [];
      
      if (existingData) {
        updatedData = JSON.parse(existingData);
      }
      
      updatedData.push(algaeData);
      console.log(updatedData)
      await AsyncStorage.setItem('ALGAE_DATA', JSON.stringify(updatedData));
      setShowAlgaeTypeModal(false);
      setAlgaeModalText('Algae Location'); // Reset text after action
    } catch (error) {
      console.error('Error storing algae data:', error);
    }

    
  };

  // Add useEffect to fetch team number
  useEffect(() => {
    const fetchTeamNumber = async () => {
      try {
        const matchInfo = await AsyncStorage.getItem('MATCH_INFO');
        if (matchInfo) {
          const parsedInfo = JSON.parse(matchInfo);
          setTeamNumber(parsedInfo.team_number);
        }
      } catch (error) {
        console.error('Error fetching team number:', error);
      }
    };
    fetchTeamNumber();
  }, []);

  // Define styles after determining global_color
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#000000",
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 40,
      marginBottom: 10,
      color: 'white',
    },
    topButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 10,
      marginTop: 10,
      marginBottom: 20,
    },
    undoButton: {
      backgroundColor: global_color,
      padding: 10,
      borderRadius: 5,
      alignSelf: 'flex-start',
      zIndex: 1,
    },
    undoButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    proceedButton: {
      backgroundColor: global_color,
      padding: 10,
      borderRadius: 5,
      alignSelf: 'flex-start',
      zIndex: 1,
    },
    proceedButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    imageContainer: {
      width: '150%',
      aspectRatio: 1,
      marginTop: -45,

    },
    image: {
      width: '100%',
      height: '100%',
    },
    algaeButton: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: global_color,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    algaeButtonText: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    countersContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    },
    counterButtonGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    groundButton: {
      backgroundColor: global_color,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginRight: 10,
    },
    groundButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    stationButton: {
      backgroundColor: global_color,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginRight: 10,
    },
    stationButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    incrementButton: {
      backgroundColor: global_color,
      width: 40,
      height: 40,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 5,
    },
    decrementButton: {
      backgroundColor: global_color,
      width: 40,
      height: 40,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlButtonText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
    notification: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: global_color,
      padding: 15,
      alignItems: 'center',
      zIndex: 100,
    },
    notificationText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    redoButton: {
      backgroundColor: global_color,
      padding: 10,
      borderRadius: 5,
      alignSelf: 'flex-start',
      zIndex: 1,
    },
    TeleopP2Container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100, // Ensure it appears on top
    },
    actionButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: 10,
    },
    actionButton: {
      backgroundColor: global_color,
      padding: 10,
      margin: 5,
      borderRadius: 5,
    },
    actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    doneButton: {
      backgroundColor: '#00FF00',
      padding: 10,
      margin: 5,
      borderRadius: 5,
    },
    doneButtonText: {
      color: 'black',
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: '#000',
    },
    driveStationButton: {
      backgroundColor: global_color,
      padding: 15,
      borderRadius: 5,
      marginVertical: 5,
      alignItems: 'center',
      width: '100%', // Fill the modal width
    },
    driveStationButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    cancelButton: {
      backgroundColor: '#ccc',
      padding: 15,
      borderRadius: 5,
      marginTop: 10,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    teamNumberText: {
      fontSize: 18,
      color: 'white',
      marginBottom: 10,
    },
    modalOptionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalOptionWithImage: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: global_color,
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 5,
    },
    optionImage: {
      width: 60,
      height: 60,
      marginBottom: 10,
    },
    modalOption: {
      backgroundColor: global_color,
      padding: 15,
      borderRadius: 5,
      marginVertical: 5,
      alignItems: 'center',
    },
    modalOptionText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    defenseButton: {
      backgroundColor: global_color,
      padding: 10,
      borderRadius: 5,
      marginHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    defenseButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
      marginLeft: 5,
    },
  });

  // Modify handleGroundIncrement to add light haptic feedback
  const handleGroundIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);  // Add light feedback when + is clicked
    setShowGroundTypeModal(true);
  };

  // Modify handleGroundTypeSelect to add success feedback
  const handleGroundTypeSelect = (type) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);  // Change to success feedback
    if (type === 'algae') {
      setAlgaeGroundCount(prev => prev + 1);
    } else if (type === 'coral') {
      setCoralGroundCount(prev => prev + 1);
    }
    setLastGroundType(type);
    setShowGroundTypeModal(false);
  };

  // Modify handleGroundDecrement to use the last type
  const handleGroundDecrement = () => {
    if (groundCount > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // If we have a last type, decrement that specific counter
      if (lastGroundType === 'algae' && algaeGroundCount > 0) {
        setAlgaeGroundCount(prev => prev - 1);
      } else if (lastGroundType === 'coral' && coralGroundCount > 0) {
        setCoralGroundCount(prev => prev - 1);
      } else {
        // If no last type or that type is at 0, decrement whichever counter is greater
        if (algaeGroundCount >= coralGroundCount && algaeGroundCount > 0) {
          setAlgaeGroundCount(prev => prev - 1);
          setLastGroundType('algae');
        } else if (coralGroundCount > 0) {
          setCoralGroundCount(prev => prev - 1);
          setLastGroundType('coral');
        }
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleStationIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStationCount(prev => prev + 1);
  };

  const handleStationDecrement = () => {
    if (stationCount > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStationCount(prev => prev - 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDefensePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate('Defense');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.notification,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <Text style={styles.notificationText}>{showNotification}</Text>
      </Animated.View>

      <Text style={styles.title}>Teleop</Text>
      {teamNumber && (
        <Text style={styles.teamNumberText}>Scouting Team: {teamNumber}</Text>
      )}
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity 
          style={styles.undoButton} 
          onPress={handleUndo}
        >
          <Text style={styles.undoButtonText}>Undo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.defenseButton, { zIndex: 100 }]}
          onPress={handleDefensePress}
        >
          <Ionicons name="shield" size={18} color="white" />
          <Text style={styles.defenseButtonText}>Defense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.proceedButton} 
          onPress={handleSubmit}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
      <View 
        style={styles.imageContainer}
        onLayout={handleImageLayout}
      >
        <Image
          source={imageSource()}
          style={styles.image}
          resizeMode="contain"
        />
        
        <TapGestureHandler onHandlerStateChange={handleTap}>
          <Svg style={[StyleSheet.absoluteFill, {transform: [{rotate: '30deg'}]}]}>
            {selectedSection && (
              <Path
                d={getSectionPath(selectedSection)}
                fill={allianceColor === "Blue" ? "rgba(0, 0, 255, 0.3)" : "rgba(255, 0, 0, 0.3)"}  // Semi-transparent highlight
                stroke={allianceColor === "Blue" ? "blue" : "red"}
                strokeWidth="2"
              />
            )}
          </Svg>
        </TapGestureHandler>
      </View>
      <View style={{ height: 100 }} />
      <TouchableOpacity 
        style={styles.algaeButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAlgaeTypeModal(true);
        }}
      >
        <Text style={styles.algaeButtonText}>Algae</Text>
      </TouchableOpacity>
      
      <View style={styles.countersContainer}>
        <View style={styles.counterButtonGroup}>
          <TouchableOpacity style={styles.incrementButton} onPress={handleGroundIncrement}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.groundButton}>
            <Text style={styles.groundButtonText}>Ground: {groundCount}</Text>
          </View>
          <TouchableOpacity style={styles.decrementButton} onPress={handleGroundDecrement}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.counterButtonGroup, { marginTop: 10 }]}>
          <TouchableOpacity style={styles.incrementButton} onPress={handleStationIncrement}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.stationButton}>
            <Text style={styles.stationButtonText}>Station: {stationCount}</Text>
          </View>
          <TouchableOpacity style={styles.decrementButton} onPress={handleStationDecrement}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showAlgaeTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAlgaeTypeModal(false);
          setAlgaeModalText('Algae Location');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{algaeModalText}</Text>
            {algaeModalText === 'Algae Location' ? (
              <>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleAlgaeTypeSelect('Processor')}
                >
                  <Text style={styles.modalOptionText}>Processor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleAlgaeTypeSelect('Barge Net')}
                >
                  <Text style={styles.modalOptionText}>Barge Net</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.modalOption, { backgroundColor: '#006400' }]}
                  onPress={() => handleAlgaeAction('make')}
                >
                  <Text style={styles.modalOptionText}>Make</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalOption, { backgroundColor: '#FF0000' }]}
                  onPress={() => handleAlgaeAction('miss')}
                >
                  <Text style={styles.modalOptionText}>Miss</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAlgaeTypeModal(false);
                setAlgaeModalText('Algae Location');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add this new Modal component */}
      <Modal
        visible={showGroundTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGroundTypeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Ground Pickup Type</Text>
            <View style={styles.modalOptionsRow}>
              <TouchableOpacity
                style={styles.modalOptionWithImage}
                onPress={() => handleGroundTypeSelect('algae')}
              >
                <Image
                  source={require('../assets/algae.png')}
                  style={styles.optionImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalOptionText}>Algae</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalOptionWithImage}
                onPress={() => handleGroundTypeSelect('coral')}
              >
                <Image
                  source={require('../assets/coral.png')}
                  style={styles.optionImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalOptionText}>Coral</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowGroundTypeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Teleop;