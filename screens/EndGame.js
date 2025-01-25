// screens/EndGame.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from 'expo-checkbox';
import Slider from '@react-native-community/slider';  // Make sure to install this package

const EndGame = () => {
  const [shallowHang, setShallowHang] = React.useState(false);
  const [deepHang, setDeepHang] = React.useState(false);
  const [park, setPark] = React.useState(false);
  const [failedClimb, setFailedClimb] = React.useState(false);
  const [hangTime, setHangTime] = React.useState(0);

  // Function to check if any option is selected
  const isAnyOptionSelected = () => {
    return shallowHang || deepHang || park || failedClimb;
  }

  // Function to handle option selection
  const handleOptionSelect = (option, setter) => {
    // Reset all options first
    setShallowHang(false);
    setDeepHang(false);
    setPark(false);
    setFailedClimb(false);
    // Set the selected option
    setter(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>End Game</Text>
      <View style={styles.mainContainer}>
        {/* Hang type checkboxes */}
        <View style={styles.visualContainer}>
          {(!isAnyOptionSelected() || shallowHang) && (
            <TouchableOpacity 
              style={styles.hangVisual} 
              onPress={() => handleOptionSelect('shallow', setShallowHang)}
            >
              <View style={styles.chainShallow} />
              <View style={[styles.rectangle, shallowHang && styles.selectedRectangle]} />
              <CheckBox
                style={styles.hiddenCheckbox}
                value={shallowHang}
                onValueChange={() => handleOptionSelect('shallow', setShallowHang)}
              />
              <Text>Shallow Hang</Text>
            </TouchableOpacity>
          )}

          {(!isAnyOptionSelected() || deepHang) && (
            <TouchableOpacity 
              style={[styles.hangVisual, { marginLeft: 40 }]} 
              onPress={() => handleOptionSelect('deep', setDeepHang)}
            >
              <View style={styles.chainDeep} />
              <View style={[styles.rectangle, deepHang && styles.selectedRectangle]} />
              <CheckBox
                style={styles.hiddenCheckbox}
                value={deepHang}
                onValueChange={() => handleOptionSelect('deep', setDeepHang)}
              />
              <Text>Deep Hang</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Park status checkboxes */}
        <View style={styles.parkOptionsContainer}>
          {(!isAnyOptionSelected() || park) && (
            <View style={styles.checkboxRow}>
              <CheckBox
                value={park}
                onValueChange={() => handleOptionSelect('park', setPark)}
              />
              <Text>Park</Text>
            </View>
          )}
          {(!isAnyOptionSelected() || failedClimb) && (
            <View style={styles.checkboxRow}>
              <CheckBox
                value={failedClimb}
                onValueChange={() => handleOptionSelect('failedClimb', setFailedClimb)}
              />
              <Text>Failed Climb/Park</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Only show slider if a hang option is selected */}
      {(shallowHang || deepHang) && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Hang Time: {hangTime.toFixed(1)} seconds</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={15}
            step={0.1}
            value={hangTime}
            onValueChange={setHangTime}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#000000"
            thumbTintColor="#007AFF"
          />
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, styles.undoButton]}
        onPress={() => {
          setShallowHang(false);
          setDeepHang(false);
          setPark(false);
          setFailedClimb(false);
          setHangTime(0);
        }}
      >
        <Text style={styles.buttonText}>Undo</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.submitButton]}
        onPress={() => {
          // Add submit functionality here
        }}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  mainContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  visualContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    height: 200,
    justifyContent: 'center',
  },
  hangVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainShallow: {
    width: 3,
    height: 40,
    backgroundColor: '#808080',
  },
  chainDeep: {
    width: 3,
    height: 120,
    backgroundColor: '#808080',
  },
  rectangle: {
    width: 60,
    height: 80,
    borderWidth: 3,
    borderColor: 'black',
  },
  selectedRectangle: {
    backgroundColor: '#90EE90',  // Changed from '#e0e0e0' to light green
  },
  hiddenCheckbox: {
    display: 'none',  // Hide the actual checkbox
  },
  parkOptionsContainer: {
    marginTop: 40,
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  undoButton: {
    left: 40,  // Position on the left
  },
  submitButton: {
    right: 40,  // Position on the right
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 100,  // Position above the buttons
    width: '80%',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default EndGame;
