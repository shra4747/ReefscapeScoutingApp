// screens/BlankScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AutoP2 = ({ navigation, route }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { selectedSection, phase, onActionComplete } = route.params;
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [showDeAlgaefyModal, setShowDeAlgaefyModal] = useState(false);
  const [deAlgaefySelected, setDeAlgaefySelected] = useState(false);
  const [deAlgaefyWithAttempt, setDeAlgaefyWithAttempt] = useState(false);

  const handleLevelPress = (level) => {
    setSelectedLevel(level);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleAction = (action) => {
    if (action === 'dealgaefy') {
      setDeAlgaefySelected(!deAlgaefySelected);
      return; // Don't store data yet, just toggle the state
    }

    const actionData = {
      level: selectedLevel,
      action: action,
      phase: phase,
      slice: selectedSection,
      dealgaefy: deAlgaefySelected,
      dealgaefyWithAttempt: deAlgaefyWithAttempt
    };

    storeData(actionData);
  };

  const handleDeAlgaefyChoice = (choice) => {
    if (choice === 'only') {
      const actionData = {
        level: selectedLevel,
        action: 'dealgaefy_only',
        phase: phase,
        slice: selectedSection,
        dealgaefy: true,
        dealgaefyWithAttempt: false
      };
      storeData(actionData);
      setDeAlgaefySelected(false);
      navigation.goBack();
    } else {
      setDeAlgaefyWithAttempt(true);
      setShowDeAlgaefyModal(false);
    }
  };

  const handleDeAlgaefyOnly = () => {
    const actionData = {
      level: selectedLevel,
      action: 'dealgaefy_only',
      phase: phase,
      slice: selectedSection,
      dealgaefy: true
    };
    storeData(actionData);
    navigation.goBack();
  };

  const retrieveAndLogData = async () => {
    try {
      const existingData = await AsyncStorage.getItem('REEF_DATA');
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        console.log('Accumulated REEF Data:', parsedData);
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  const storeData = async (actionData) => {
    try {
      const existingData = await AsyncStorage.getItem('REEF_DATA');
      let updatedData = [];
      
      if (existingData) {
        updatedData = JSON.parse(existingData);
      }
      
      updatedData.push(actionData);
      await AsyncStorage.setItem('REEF_DATA', JSON.stringify(updatedData));
      
      // Log the accumulated data after storing
      await retrieveAndLogData();
      
      // Only navigate back once
      if (navigation.isFocused()) {
        navigation.goBack();
      }
      
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  const showDeAlgaefy = selectedLevel === 'L2' || selectedLevel === 'L3';

  return (
    <View style={styles.container}>
      <Text style={styles.reefTitle}>Reef</Text>
      <View style={styles.buttonContainer}>
        {['L4', 'L3', 'L2', 'L1'].map((level) => (
          <TouchableOpacity 
            key={level}
            style={[
              styles.button,
              selectedLevel === level && styles.selectedButton
            ]}
            onPress={() => handleLevelPress(level)}
          >
            <Text style={[
              styles.buttonText,
              selectedLevel === level && styles.selectedButtonText
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View 
        style={[
          styles.optionsContainer,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.optionsButtonContainer}>
          <TouchableOpacity 
            style={styles.makeButton}
            onPress={() => handleAction('make')}
          >
            <Text style={styles.optionButtonText}>Make</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.missButton}
            onPress={() => handleAction('miss')}
          >
            <Text style={styles.optionButtonText}>Miss</Text>
          </TouchableOpacity>
        </View>
        
        {showDeAlgaefy && (
          <View style={styles.deAlgaefyContainer}>
            <TouchableOpacity 
              style={[
                styles.deAlgaefyButton,
                deAlgaefySelected && {
                  borderColor: '#00ff00',
                  shadowColor: '#00ff00',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 5
                }
              ]}
              onPress={() => setDeAlgaefySelected(!deAlgaefySelected)}
            >
              <Text style={styles.deAlgaefyText}>De-Algaefy + Coral Attempt</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deAlgaefyOnlyButton}
              onPress={handleDeAlgaefyOnly}
            >
              <Text style={styles.optionButtonText}>De-Algaefy ONLY</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* De-Algaefy Choice Modal */}
      <Modal
        visible={showDeAlgaefyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeAlgaefyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>De-Algaefy Options</Text>
            <TouchableOpacity
              style={styles.driveStationButton}
              onPress={() => handleDeAlgaefyChoice('only')}
            >
              <Text style={styles.driveStationButtonText}>De-Algaefy ONLY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.driveStationButton}
              onPress={() => handleDeAlgaefyChoice('with_attempt')}
            >
              <Text style={styles.driveStationButtonText}>De-Algaefy + Coral Attempt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDeAlgaefyModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reefTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 30,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 25,
  },
  button: {
    width: 280,
    height: 80,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff3030',
  },
  selectedButton: {
    backgroundColor: '#90EE90',
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: 'black',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    maxHeight: 280,
  },
  optionsButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  makeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 15,
    width: '47%',
    height: 80,
    justifyContent: 'center',
  },
  missButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 15,
    width: '47%',
    height: 80,
    justifyContent: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deAlgaefyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  deAlgaefyButton: {
    backgroundColor: '#000000',
    padding: 12,
    height: 70,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff0000',
    width: '100%',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deAlgaefyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#ff3030',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  },
  driveStationButton: {
    backgroundColor: "#000000",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
    width: '100%',
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
    width: '100%',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deAlgaefyOnlyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 15,
    width: '100%',
    height: 70,
    justifyContent: 'center',
  },
});

export default AutoP2;