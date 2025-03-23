// screens/BlankScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity, Animated, Modal, Alert, Vibration, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const Auto = () => {  

  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [stationCount, setStationCount] = useState(0);
  const [groundCount, setGroundCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const navigation = useNavigation();
  const [selectedSection, setSelectedSection] = useState(null);
  const [reef, setReef] = useState([]);
  const [currentAction, setCurrentAction] = useState({});
  const [showDriveStationModal, setShowDriveStationModal] = useState(false);
  const [driveStation, setDriveStation] = useState(null);
  const [showStationTypeModal, setShowStationTypeModal] = useState(false);
  const [showProcessorModal, setShowProcessorModal] = useState(false);
  const [stationData, setStationData] = useState([]);
  const [groundData, setGroundData] = useState([]);

  const [allianceColor, setAllianceColor] = useState("Blue"); // Default value
  const [driverStation, setDriverStation] = useState(null); // New state for driver station
  const [driverStationOrder, setDriverStationOrder] = useState('normal');
  const [teamNumber, setTeamNumber] = useState(null);

  const [showAlgaeTypeModal, setShowAlgaeTypeModal] = useState(false);
  const [showAlgaeActionModal, setShowAlgaeActionModal] = useState(false);
  const [currentAlgaeType, setCurrentAlgaeType] = useState(null);
  const [algaeModalText, setAlgaeModalText] = useState('Algae Location');

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

  useEffect(() => {
    retrieveReefData();
    
    if (showNotification) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -150,
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

  const storeAutoData = async () => {
    const autoData = {
      groundCount: groundData,
      stationCount: stationData,
    };
    try {
      await AsyncStorage.setItem('AUTO_PICKUPS', JSON.stringify(autoData));
    } catch (error) {
      console.error('Error storing auto data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await storeAutoData();
      // Add heavy haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      navigation.navigate("Teleop");
    } catch (error) {
      console.error('Error submitting auto data:', error);
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

      // If the same section is clicked again, navigate to AutoP2
      if (selectedSection === section) {
        const nextSection = driverStation == "Right" ? sectionMapDSRight[section] : sectionMapDSLeft[section]
        navigation.navigate('AutoP2', { selectedSection: nextSection, phase: "auto" });
        setSelectedSection(null);
      } else {
        // Set the new selected section
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
        // Get both REEF and PROCESSOR data
        const reefValue = await AsyncStorage.getItem('REEF_DATA');
        const processorValue = await AsyncStorage.getItem('PROCESSOR_DATA');
        
        let reefData = reefValue ? JSON.parse(reefValue) : [];
        let processorData = processorValue ? JSON.parse(processorValue) : [];
        // Find the most recent action across both lists
        let mostRecentAction = null;
        let actionType = null;
        
        // Check last reef action
        if (reefData.length > 0) {
            const lastReef = reefData[reefData.length - 1];
            if (!mostRecentAction || new Date(lastReef.timestamp).getTime() > new Date(mostRecentAction.timestamp).getTime()) {
                mostRecentAction = lastReef;
                actionType = 'REEF';
            }
        }
        
        // Check last processor action
        if (processorData.length > 0) {
            const lastProcessor = processorData[processorData.length - 1];
            if (!mostRecentAction || new Date(lastProcessor.timestamp).getTime() > new Date(mostRecentAction.timestamp).getTime()) {
                mostRecentAction = lastProcessor;
                actionType = 'PROCESSOR';
            }
        }
        
        if (mostRecentAction) {
            if (actionType === 'REEF') {
                // Remove last reef action
                reefData = reefData.slice(0, -1);
                await AsyncStorage.setItem('REEF_DATA', JSON.stringify(reefData));
                setReef(reefData);
                setShowNotification(`REEF action undone: ${mostRecentAction.slice} ${mostRecentAction.level}`);
            } else {
                // Remove last processor action
                processorData = processorData.slice(0, -1);
                await AsyncStorage.setItem('PROCESSOR_DATA', JSON.stringify(processorData));
                setShowNotification(`PROCESSOR action undone: ${mostRecentAction.action}`);
            }
        } else {
            setShowNotification('No actions to undo');
        }
    } catch (error) {
        console.error('Error undoing last action:', error);
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

  const handleGroundIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGroundCount(prev => prev + 1);
    setGroundData(prev => [...prev, { type: 'ground', timestamp: new Date().toISOString() }]);
  };

  const handleGroundDecrement = () => {
    if (groundCount > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setGroundCount(prev => prev - 1);
      setGroundData(prev => prev.slice(0, -1));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDriveStationSelect = (station) => {
    setDriveStation(station);
    setGroundCount(groundCount + 1);
    setShowDriveStationModal(false);
    
    const newGroundPickup = {
      type: 'ground',
      driveStation: station,
      timestamp: new Date().toISOString()
    };
    const newGroundData = [...groundData, newGroundPickup];
    setGroundData(newGroundData);
    storeGroundData(newGroundData);
  };

  const storeGroundData = async (data) => {
    try {
      await AsyncStorage.setItem('GROUND_PICKUPS', JSON.stringify(data));
    } catch (error) {
      console.error('Error storing ground data:', error);
    }
  };

  const handleStationIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStationCount(prev => prev + 1);
    setStationData(prev => [...prev, { type: 'station', timestamp: new Date().toISOString() }]);
  };

  const storeStationData = async (data) => {
    try {
      await AsyncStorage.setItem('STATION_PICKUPS', JSON.stringify(data));
    } catch (error) {
      console.error('Error storing station data:', error);
    }
  };
  
  const handleProcessorAction = async (action) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const processorData = {
      action: action,
      phase: "auto",
      timestamp: new Date().toISOString()
    };

    try {
      const existingData = await AsyncStorage.getItem('PROCESSOR_DATA');
      let updatedData = [];
      
      if (existingData) {
        updatedData = JSON.parse(existingData);
      }
      
      updatedData.push(processorData);
      await AsyncStorage.setItem('PROCESSOR_DATA', JSON.stringify(updatedData));
      
      setShowProcessorModal(false);
    } catch (error) {
      console.error('Error storing processor data:', error);
      // Add error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Use allianceColor and driverStation to set the image source
  const imageSource = () => {
    if (allianceColor === "Red") {
      return driverStation === "Right" ? require('../assets/Redreverse.png') : require('../assets/RedReefVUSE.png');
    } else {
      return driverStation === "Right" ? require('../assets/bluereverse.png') : require('../assets/BlueReefVUSE.png');
    }
  };

  // Fetch driver station order on component mount
  useEffect(() => {
    const fetchDriverStationOrder = async () => {
      try {
        const order = await AsyncStorage.getItem('DRIVER_STATION_ORDER');
        if (order) {
          setDriverStationOrder(order);
        }
      } catch (error) {
        console.error('Error fetching driver station order:', error);
      }
    };
    fetchDriverStationOrder();
  }, []);

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

  const handleAlgaeButtonPress = () => {
    setShowAlgaeTypeModal(true);
  };

  const handleAlgaeTypeSelect = (type) => {
    if (type === 'Cancel') {
      setShowAlgaeTypeModal(false);
    } else {
      setAlgaeModalText('Algae Action');
      setCurrentAlgaeType(type);
    }
  };

  const handleAlgaeAction = async (action) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const algaeData = {
      type: currentAlgaeType,
      action: action,
      phase: "auto",
      timestamp: new Date().toISOString()
    };

    console.log('Algae Data:', algaeData);

    try {
      const existingData = await AsyncStorage.getItem('ALGAE_DATA');
      let updatedData = [];
      
      if (existingData) {
        updatedData = JSON.parse(existingData);
      }
      
      updatedData.push(algaeData);
      await AsyncStorage.setItem('ALGAE_DATA', JSON.stringify(updatedData));
      setShowAlgaeTypeModal(false);
      setAlgaeModalText('Algae Location'); // Reset text after action
    } catch (error) {
      console.error('Error storing algae data:', error);
    }
  };

  const handleStationDecrement = () => {
    if (stationCount > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStationCount(prev => prev - 1);
      setStationData(prev => prev.slice(0, -1));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

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
    processorButton: {
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
    processorButtonText: {
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
    autoP2Container: {
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
      width: '100%',
      padding: 15,
      backgroundColor: '#444',
      borderRadius: 5,
      marginBottom: 10,
      alignItems: 'center',
    },
    driveStationButtonText: {
      color: '#fff',
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
  });

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

      <Text style={styles.title}>Autonomous</Text>
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
        style={styles.processorButton}
        onPress={() => setShowProcessorModal(true)}
      >
      </TouchableOpacity>
      
      <View style={styles.countersContainer}>
        <View style={styles.counterButtonGroup}>
          <TouchableOpacity 
            style={styles.incrementButton} 
            onPress={handleGroundIncrement}
          >
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
          <TouchableOpacity 
            style={styles.incrementButton} 
            onPress={handleStationIncrement}
          >
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

      {/* Processor Action Modal */}
      <Modal
        visible={showProcessorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProcessorModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Processor Action</Text>
            <TouchableOpacity
              style={styles.driveStationButton}
              onPress={() => handleProcessorAction('make')}
            >
              <Text style={styles.driveStationButtonText}>Make</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.driveStationButton}
              onPress={() => handleProcessorAction('miss')}
            >
              <Text style={styles.driveStationButtonText}>Miss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowProcessorModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.algaeButton}
        onPress={handleAlgaeButtonPress}
      >
        <Text style={styles.algaeButtonText}>Algae</Text>
      </TouchableOpacity>

      {/* Algae Action Modal */}
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
    </View>
  );
};

export default Auto;