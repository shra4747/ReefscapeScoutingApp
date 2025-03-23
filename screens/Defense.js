import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Modal, StyleSheet, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

const Defense = ({ navigation }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [intakeDelay, setIntakeDelay] = useState(0);
  const [stationReroute, setStationReroute] = useState(0);
  const [processorBlock, setProcessorBlock] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [pinningTime, setPinningTime] = useState([]);
  const [stationBlock, setStationBlock] = useState(0);
  const [allianceColor, setAllianceColor] = useState("Blue");
  const [pinningStartTime, setPinningStartTime] = useState(0);
  const [displayPinningTime, setDisplayPinningTime] = useState(0);
  const [foulsReef, setFoulsReef] = useState(0);
  const [foulsBarge, setFoulsBarge] = useState(0);
  const [bounceAnim] = useState(new Animated.Value(1));
  const [pinFouls, setPinFouls] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Add useEffect to get alliance color
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

  // Add handlers for increment/decrement
  const handleIntakeIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIntakeDelay(prev => prev + 1);
  };

  const handleIntakeDecrement = () => {
    if (intakeDelay > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIntakeDelay(prev => prev - 1);
    }
    else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleTimerClose = () => {
    setIsRunning(false);
    setShowTimer(false);
  };

  const handleRerouteIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStationReroute(prev => prev + 1);
  };

  const handleRerouteDecrement = () => {
    if (stationReroute > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStationReroute(prev => prev - 1);
    }
    else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleProcessorIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProcessorBlock(prev => prev + 1);
  };

  const handleProcessorDecrement = () => {
    if (processorBlock > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setProcessorBlock(prev => prev - 1);
    }
    else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePinningStart = () => {
    setIsPinning(true);
    setPinningStartTime(performance.now());
    setDisplayPinningTime(0);
  };

  const handlePinningEnd = () => {
    const endTime = performance.now();
    const duration = (endTime - pinningStartTime) / 1000; // Convert to seconds
    setIsPinning(false);
    
    // Save pinning time as an array with the new duration as a float
    setPinningTime(prev => [...prev, parseFloat(duration.toFixed(5))]);
  };

  // Update useEffect to update display time
  useEffect(() => {
    let interval;
    if (isPinning) {
      interval = setInterval(() => {
        setDisplayPinningTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPinning]);

  // Add useEffect for bounce animation
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    if (isPinning) {
      bounce.start();
    } else {
      bounce.stop();
      bounceAnim.setValue(1);
    }

    return () => bounce.stop();
  }, [isPinning]);

  const saveDefenseData = async (newStationDelay = null) => {
    const defenseData = {
      station_re_routes: stationReroute,
      intake_block: intakeDelay,
      processor_block: processorBlock,
      station_block: stationBlock,
      pin_fouls: pinFouls,
      fouls_reef: foulsReef,
      fouls_barge: foulsBarge
    };

    console.log('Saving data:', defenseData);

    try {
      await AsyncStorage.setItem('DEFENSE_DATA', JSON.stringify(defenseData));
    } catch (error) {
      console.error('Error saving defense data:', error);
    }
  };
  // Modify loadDefenseData to only load data if it exists
  const loadDefenseData = async () => {
    try {
      const data = await AsyncStorage.getItem('DEFENSE_DATA');
      if (data !== null) {
        const parsedData = JSON.parse(data);
        
        // Update all state values
        setStationReroute(parsedData.station_re_routes || 0);
        setIntakeDelay(parsedData.intake_block || 0);
        setProcessorBlock(parsedData.processor_block || 0);
        setStationBlock(parsedData.station_block || 0);
        setPinFouls(parsedData.pin_fouls || 0);
        setFoulsReef(parsedData.fouls_reef || 0);
        setFoulsBarge(parsedData.fouls_barge || 0);
        
        console.log('Loaded data:', parsedData);
      } else {
        // If no data exists, initialize with empty values
        setStationReroute(0);
        setIntakeDelay(0);
        setProcessorBlock(0);
        setStationBlock(0);
        setPinFouls(0);
        setFoulsReef(0);
        setFoulsBarge(0);
      }
    } catch (error) {
      console.error('Error loading defense data:', error);
    }
  };

  // Update the useEffect for component mount
  useEffect(() => {
    const initialize = async () => {
      await loadDefenseData();
    };
    initialize();
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Modify the station block increment handler
  const handleStationBlockIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStationBlock(prev => prev + 1);
  };

  // Modify the station block decrement handler
  const handleStationBlockDecrement = () => {
    if (stationBlock > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStationBlock(prev => prev - 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Modify the pin foul handlers
  const handlePinFoulIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinFouls(prev => prev + 1);
  };

  const handlePinFoulDecrement = () => {
    if (pinFouls > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPinFouls(prev => prev - 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Modify the foul in reef handlers
  const handleFoulReefIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFoulsReef(prev => prev + 1);
  };

  const handleFoulReefDecrement = () => {
    if (foulsReef > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFoulsReef(prev => prev - 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Modify the foul in barge handlers
  const handleFoulBargeIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFoulsBarge(prev => prev + 1);
  };

  const handleFoulBargeDecrement = () => {
    if (foulsBarge > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFoulsBarge(prev => prev - 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={getStyles(allianceColor).container}>
      {/* Back Button with Text */}
      <TouchableOpacity 
        style={[getStyles(allianceColor).backButton, { top: 30 }]}
        onPress={async () => {
          await saveDefenseData();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          navigation.goBack();
        }}
      >
        <Ionicons name="arrow-back" size={20} color="#FFF" />
        <Text style={getStyles(allianceColor).backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Proceed to Endgame Button */}
      <TouchableOpacity 
        style={[getStyles(allianceColor).endgameButton, { top: 30 }]}
        onPress={async () => {
          await saveDefenseData();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          navigation.navigate('EndGame');
        }}
      >
        <Text style={getStyles(allianceColor).endgameButtonText}>Endgame</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>

      {/* Defense Title */}
      <Text style={[getStyles(allianceColor).title, { marginTop: 40, marginRight: 30 }]}>Defense</Text>

      <View style={getStyles(allianceColor).contentContainer}>
        {/* Actions Section */}
        <View style={getStyles(allianceColor).sectionContainer}>
          {/* Station Counters Group */}
          <View style={getStyles(allianceColor).counterButtonGroup}>
            <TouchableOpacity 
              style={getStyles(allianceColor).stationIncrementButton} 
              onPress={handleRerouteIncrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>+</Text>
            </TouchableOpacity>
            <View style={getStyles(allianceColor).counterDisplay}>
              <Text style={getStyles(allianceColor).counterText}>Station Re-Route: {stationReroute}</Text>
            </View>
            <TouchableOpacity 
              style={getStyles(allianceColor).stationIncrementButton} 
              onPress={handleRerouteDecrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Station Block Counter */}
          <View style={getStyles(allianceColor).counterButtonGroup}>
            <TouchableOpacity 
              style={getStyles(allianceColor).stationIncrementButton} 
              onPress={handleStationBlockIncrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>+</Text>
            </TouchableOpacity>
            <View style={getStyles(allianceColor).counterDisplay}>
              <Text style={getStyles(allianceColor).counterText}>Station Block: {stationBlock}</Text>
            </View>
            <TouchableOpacity 
              style={getStyles(allianceColor).stationIncrementButton} 
              onPress={handleStationBlockDecrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Intake Fail Counter */}
          <View style={getStyles(allianceColor).counterButtonGroup}>
            <TouchableOpacity 
              style={getStyles(allianceColor).intakeIncrementButton} 
              onPress={handleIntakeIncrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>+</Text>
            </TouchableOpacity>
            <View style={getStyles(allianceColor).counterDisplay}>
              <Text style={getStyles(allianceColor).counterText}>Intake Fail: {intakeDelay}</Text>
            </View>
            <TouchableOpacity 
              style={getStyles(allianceColor).intakeIncrementButton} 
              onPress={handleIntakeDecrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Processor Block Counter */}
          <View style={getStyles(allianceColor).counterButtonGroup}>
            <TouchableOpacity 
              style={getStyles(allianceColor).processorIncrementButton} 
              onPress={handleProcessorIncrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>+</Text>
            </TouchableOpacity>
            <View style={getStyles(allianceColor).counterDisplay}>
              <Text style={getStyles(allianceColor).counterText}>Processor Block: {processorBlock}</Text>
            </View>
            <TouchableOpacity 
              style={getStyles(allianceColor).processorIncrementButton} 
              onPress={handleProcessorDecrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={getStyles(allianceColor).divider} />

        {/* Fouls Section */}
        <View style={getStyles(allianceColor).sectionContainer}>
          {/* Pin Foul Counter */}
          <View style={getStyles(allianceColor).counterButtonGroup}>
            <TouchableOpacity 
              style={getStyles(allianceColor).foulIncrementButton} 
              onPress={handlePinFoulIncrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>+</Text>
            </TouchableOpacity>
            <View style={getStyles(allianceColor).counterDisplay}>
              <Text style={getStyles(allianceColor).counterText}>Pin Foul: {pinFouls}</Text>
            </View>
            <TouchableOpacity 
              style={getStyles(allianceColor).foulIncrementButton} 
              onPress={handlePinFoulDecrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Foul in Reef Counter */}
          <View style={getStyles(allianceColor).counterButtonGroup}>
            <TouchableOpacity 
              style={getStyles(allianceColor).foulIncrementButton} 
              onPress={handleFoulReefIncrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>+</Text>
            </TouchableOpacity>
            <View style={getStyles(allianceColor).counterDisplay}>
              <Text style={getStyles(allianceColor).counterText}>Foul in Reef: {foulsReef}</Text>
            </View>
            <TouchableOpacity 
              style={getStyles(allianceColor).foulIncrementButton} 
              onPress={handleFoulReefDecrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Foul in Barge Counter */}
          <View style={getStyles(allianceColor).counterButtonGroup}>
            <TouchableOpacity 
              style={getStyles(allianceColor).foulIncrementButton} 
              onPress={handleFoulBargeIncrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>+</Text>
            </TouchableOpacity>
            <View style={getStyles(allianceColor).counterDisplay}>
              <Text style={getStyles(allianceColor).counterText}>Foul in Barge: {foulsBarge}</Text>
            </View>
            <TouchableOpacity 
              style={getStyles(allianceColor).foulIncrementButton} 
              onPress={handleFoulBargeDecrement}
            >
              <Text style={getStyles(allianceColor).controlButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timer Modal */}
        <Modal
          visible={showTimer}
          transparent={true}
          animationType="slide"
        >
          <View style={getStyles(allianceColor).modalContainer}>
            <View style={getStyles(allianceColor).modalContent}>
              <Text style={getStyles(allianceColor).timerText}>{formatTime(time)}</Text>
              <TouchableOpacity 
                style={getStyles(allianceColor).closeButton}
                onPress={handleTimerClose}
              >
                <Text style={getStyles(allianceColor).closeButtonText}>Stop & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Penalty Modal */}
        <Modal
          visible={showPenaltyModal}
          transparent={true}
          animationType="slide"
        >
          <View style={getStyles(allianceColor).modalContainer}>
            <View style={getStyles(allianceColor).modalContent}>
              <TouchableOpacity 
                style={getStyles(allianceColor).penaltyOption}
                onPress={() => handlePenaltySelect('Minor Foul')}
              >
                <Text style={getStyles(allianceColor).penaltyOptionText}>Minor Foul</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={getStyles(allianceColor).penaltyOption}
                onPress={() => handlePenaltySelect('Major Foul')}
              >
                <Text style={getStyles(allianceColor).penaltyOptionText}>Major Foul</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

// Update styles to be a function that takes allianceColor
const getStyles = (allianceColor) => {
  const global_color = allianceColor === "Blue" ? "#308aff" : "#ff3030";
  const foulColor = "#8A2BE2";
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1E1E1E',
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      marginTop: 50,
    },
    counterButtonGroup: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 10,
    },
    stationIncrementButton: {
      padding: 15,
      borderRadius: 8,
      marginRight: 5,
      backgroundColor: '#666', // Gray for station buttons
    },
    intakeIncrementButton: {
      padding: 15,
      borderRadius: 8,
      marginRight: 5,
      backgroundColor: '#ff3030', // Red for intake fail
    },
    processorIncrementButton: {
      padding: 15,
      borderRadius: 8,
      marginRight: 5,
      backgroundColor: '#20B2AA', // Teal for processor
    },
    foulIncrementButton: {
      padding: 15,
      borderRadius: 8,
      marginRight: 5,
      backgroundColor: '#000', // Black for fouls
    },
    counterDisplay: {
      backgroundColor: '#333',
      padding: 15,
      borderRadius: 10,
      minWidth: 150,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    counterText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    controlButtonText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: '#2A2A2A',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      width: '80%',
    },
    timerText: {
      fontSize: 48,
      fontWeight: 'bold',
      marginVertical: 20,
      color: '#FFFFFF',
    },
    closeButton: {
      backgroundColor: global_color,
      padding: 15,
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    title: {
      top: 25,
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFF',
      textAlign: 'center',
      
      marginBottom: 20,
    },
    backButton: {
      position: 'absolute',
      marginTop: 35,
      left: 20,
      zIndex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: global_color,
      borderRadius: 5,
    },
    backButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      marginLeft: 5,
    },
    sectionContainer: {
      width: '100%',
      marginTop: 20,
      padding: 15,
      backgroundColor: '#2A2A2A',
      borderRadius: 15,
      elevation: 3,
    },
    divider: {
      height: 1,
      backgroundColor: '#444',
      marginVertical: 20,
      width: '90%',
      alignSelf: 'center',
    },
    pinningButtonContainer: {
      alignItems: 'center', // Center horizontally
      marginVertical: 20,
    },
    pinningButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: global_color,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    pinningButtonActive: {
      backgroundColor: '#FF4500', // Zesty orange
      shadowColor: '#FF4500', // Zesty glow
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 20,
      elevation: 15,
    },
    pinningButtonText: {
      color: '#FFF',
      fontSize: 20, // Adjusted for circular button
      fontWeight: 'bold',
      textAlign: 'center',
    },
    penaltyOption: {
      padding: 20,
      borderRadius: 10,
      marginVertical: 10,
      alignItems: 'center',
      minWidth: '80%',
      backgroundColor: foulColor,
      elevation: 3,
    },
    penaltyOptionText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    endgameButton: {
      position: 'absolute',
      marginTop: 35,
      right: 20,
      zIndex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: global_color,
      borderRadius: 5,
    },
    endgameButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      marginRight: 5,
    },
  });
};

export default Defense;