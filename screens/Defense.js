// screens/BlankScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const Defense = ({ navigation }) => {
  const [intakeDelay, setIntakeDelay] = useState(0);
  const [stationDelay, setStationDelay] = useState(0);
  const [stationReroute, setStationReroute] = useState(0);
  const [allianceColor, setAllianceColor] = useState("Blue");
  const [showTimer, setShowTimer] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [processorBlock, setProcessorBlock] = useState(0);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Add handlers for increment/decrement
  const handleIntakeIncrement = () => {
    setIntakeDelay(prev => prev + 1);
  };

  const handleIntakeDecrement = () => {
    if (intakeDelay > 0) {
      setIntakeDelay(prev => prev - 1);
    }
  };

  const handleStationPress = () => {
    setShowTimer(true);
    setTime(0);
    setIsRunning(true);
  };

  const handleTimerClose = () => {
    setIsRunning(false);
    setShowTimer(false);
    
    // Update station delay time to accumulate values
    setStationDelay(prev => {
      const newValue = prev ? `${prev},${time}` : `${time}`;
      saveDefenseData(newValue);
      return newValue;
    });
  };

  const handleRerouteIncrement = () => {
    setStationReroute(prev => prev + 1);
  };

  const handleRerouteDecrement = () => {
    if (stationReroute > 0) {
      setStationReroute(prev => prev - 1);
    }
  };

  const handleProcessorIncrement = () => {
    setProcessorBlock(prev => prev + 1);
  };

  const handleProcessorDecrement = () => {
    if (processorBlock > 0) {
      setProcessorBlock(prev => prev - 1);
    }
  };

  const handlePenaltyPress = () => {
    setShowPenaltyModal(true);
  };

  const calculateDPR = (defenseData) => {
    // Calculate station delay total
    const stationDelayTotal = defenseData.station_delay_time
      .split(',')
      .reduce((sum, time) => sum + Number(time), 0);

    // Calculate penalties total with updated weightages
    const penaltiesTotal = defenseData.penalties.reduce((sum, penalty) => {
      return sum + (penalty.type === 'Minor Foul' ? -3 : -6);
    }, 0);

    // Calculate DPR
    return (stationDelayTotal * 1) + 
           (defenseData.station_re_routes * 2) + 
           (defenseData.intake_block * 3) + 
           (defenseData.processor_block * 2) + 
           penaltiesTotal;
  };

  const saveDefenseData = async (newStationDelay = null) => {
    const defenseData = {
      penalties: [], // Will store penalty objects
      station_delay_time: newStationDelay || stationDelay,
      station_re_routes: stationReroute,
      intake_block: intakeDelay,
      processor_block: processorBlock
    };

    // Calculate and add DPR
    defenseData.DPR = calculateDPR(defenseData);

    try {
      await AsyncStorage.setItem('DEFENSE_DATA', JSON.stringify(defenseData));
      console.log('Defense data saved successfully:', defenseData);
    } catch (error) {
      console.error('Error saving defense data:', error);
    }
  };

  // Load defense data from AsyncStorage
  const loadDefenseData = async () => {
    try {
      const data = await AsyncStorage.getItem('DEFENSE_DATA');
      if (data !== null) {
        const parsedData = JSON.parse(data);
        setStationDelay(parsedData.station_delay_time || 0);
        setStationReroute(parsedData.station_re_routes || 0);
        setIntakeDelay(parsedData.intake_block || 0);
        setProcessorBlock(parsedData.processor_block || 0);
        console.log('Defense data loaded successfully:', parsedData);
      }
    } catch (error) {
      console.error('Error loading defense data:', error);
    }
  };

  // Add penalty to defense data
  const addPenalty = async (type) => {
    try {
      const data = await AsyncStorage.getItem('DEFENSE_DATA');
      const defenseData = data ? JSON.parse(data) : {
        penalties: [],
        station_delay_time: '',
        station_re_routes: 0,
        intake_block: 0,
        processor_block: 0
      };

      defenseData.penalties.push({
        type: type
      });

      // Recalculate DPR
      defenseData.DPR = calculateDPR(defenseData);

      await AsyncStorage.setItem('DEFENSE_DATA', JSON.stringify(defenseData));
      console.log('Penalty added successfully:', defenseData);
    } catch (error) {
      console.error('Error adding penalty:', error);
    }
  };

  // Update handlePenaltySelect to save penalties
  const handlePenaltySelect = async (type) => {
    setShowPenaltyModal(false);
    await addPenalty(type);
  };

  // Load data on component mount
  useEffect(() => {
    loadDefenseData();
  }, []);

  // Save data when any value changes
  useEffect(() => {
    saveDefenseData();
  }, [stationDelay, stationReroute, intakeDelay, processorBlock]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* Back Button with Text */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color="#FFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Defense Title */}
      <Text style={styles.title}>Defense</Text>

      <View style={styles.contentContainer}>
        {/* Penalties Button */}
        <TouchableOpacity 
          style={[
            styles.penaltyButton, 
            { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
          ]}
          onPress={handlePenaltyPress}
        >
          <Text style={styles.penaltyButtonText}>Penalties</Text>
        </TouchableOpacity>

        {/* Station Delay Button */}
        <TouchableOpacity 
          style={[
            styles.stationButton, 
            { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
          ]}
          onPress={handleStationPress}
        >
          <Text style={styles.stationButtonText}>Station Delay: {stationDelay}s</Text>
        </TouchableOpacity>

        {/* Add Station Re-Route Counter */}
        <View style={styles.counterButtonGroup}>
          <TouchableOpacity 
            style={[
              styles.incrementButton, 
              { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
            ]} 
            onPress={handleRerouteIncrement}
          >
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.rerouteButton}>
            <Text style={styles.rerouteButtonText}>Station Re-Route: {stationReroute}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.decrementButton, 
              { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
            ]} 
            onPress={handleRerouteDecrement}
          >
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>

        {/* Intake Delay Counter */}
        <View style={styles.counterButtonGroup}>
          <TouchableOpacity 
            style={[
              styles.incrementButton, 
              { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
            ]} 
            onPress={handleIntakeIncrement}
          >
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.intakeButton}>
            <Text style={styles.intakeButtonText}>Intake Block: {intakeDelay}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.decrementButton, 
              { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
            ]} 
            onPress={handleIntakeDecrement}
          >
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>

        {/* Add Processor Block Counter */}
        <View style={styles.counterButtonGroup}>
          <TouchableOpacity 
            style={[
              styles.incrementButton, 
              { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
            ]} 
            onPress={handleProcessorIncrement}
          >
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.processorButton}>
            <Text style={styles.processorButtonText}>Processor Block: {processorBlock}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.decrementButton, 
              { backgroundColor: allianceColor === "Blue" ? "#308aff" : "#ff3030" }
            ]} 
            onPress={handleProcessorDecrement}
          >
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Modal */}
        <Modal
          visible={showTimer}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.timerText}>{formatTime(time)}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleTimerClose}
              >
                <Text style={styles.closeButtonText}>Stop & Save</Text>
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
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.penaltyOption}
                onPress={() => handlePenaltySelect('Minor Foul')}
              >
                <Text style={styles.penaltyOptionText}>Minor Foul</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.penaltyOption}
                onPress={() => handlePenaltySelect('Major Foul')}
              >
                <Text style={styles.penaltyOptionText}>Major Foul</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 0,
  },
  counterButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  incrementButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  decrementButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  intakeButton: {
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  intakeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stationButton: {
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  stationButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  rerouteButton: {
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  rerouteButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#FF4444',
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
  processorButton: {
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  processorButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  penaltyButton: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    minWidth: 200,
  },
  penaltyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  penaltyOption: {
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  penaltyOptionText: {
    fontSize: 18,
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default Defense;