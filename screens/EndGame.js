// screens/EndGame.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from 'expo-checkbox';
import Slider from '@react-native-community/slider';  // Make sure to install this package
import { useNavigation } from '@react-navigation/native';  // Add this import

const EndGame = () => {
  const navigation = useNavigation();  // Add this
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
              <Text style={styles.optionText}>Shallow Hang</Text>
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
              <Text style={styles.optionText}>Deep Hang</Text>
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
              <Text style={styles.optionText}>Park</Text>
            </View>
          )}
          {(!isAnyOptionSelected() || failedClimb) && (
            <View style={styles.checkboxRow}>
              <CheckBox
                value={failedClimb}
                onValueChange={() => handleOptionSelect('failedClimb', setFailedClimb)}
              />
              <Text style={styles.optionText}>Failed Climb/Park</Text>
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
            minimumTrackTintColor="#ff3030"
            maximumTrackTintColor="#ffffff"
            thumbTintColor="#ff3030"
          />
        </View>
      )}

      <TouchableOpacity 
        style={styles.undoButton}
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
        style={styles.submitButton}
        onPress={() => navigation.navigate('PostGame')}
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
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#ffffff',
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
    borderColor: '#ff3030',
    backgroundColor: '#1a1a1a',
    opacity: 0.8,
  },
  selectedRectangle: {
    backgroundColor: '#90EE90',
  },
  hiddenCheckbox: {
    display: 'none',
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
  submitButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: '#ff3030',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  undoButton: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    backgroundColor: '#ff3030',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 100,
    width: '80%',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  optionText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default EndGame;
