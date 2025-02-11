// screens/EndGame.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import CheckBox from 'expo-checkbox';
import Slider from '@react-native-community/slider';  // Make sure to install this package
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EndGame = () => {
  const navigation = useNavigation();
  const [shallowHang, setShallowHang] = React.useState(false);
  const [deepHang, setDeepHang] = React.useState(false);
  const [park, setPark] = React.useState(false);
  const [failedClimb, setFailedClimb] = React.useState(false);
  const [hangTime, setHangTime] = React.useState(0);
  const [isDeep, setIsDeep] = React.useState(false);
  const [endGameData, setEndGameData] = React.useState([]); // List to store end game data

  // Animation values
  const translateY = useSharedValue(0);
  const isDeepPosition = useSharedValue(false);

  const handleTap = () => {
    if (isDeepPosition.value) {
      // Move up
      translateY.value = withSpring(0);
      isDeepPosition.value = false;
      setIsDeep(false);
      setShallowHang(true); // Set shallow hang when toggling up
      setDeepHang(false); // Reset deep hang when toggling up
    } else {
      // Move down
      translateY.value = withSpring(80);
      isDeepPosition.value = true;
      setIsDeep(true);
      setDeepHang(true); // Set deep hang when toggling down
      setShallowHang(false); // Reset shallow hang when toggling down
    }
  };

  const boxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const chainStyle = useAnimatedStyle(() => {
    return {
      height: translateY.value + 40, // Base height + translation
    };
  });

  // Function to handle option selection
  const handleOptionSelect = (option) => {
    // Reset all options first
    setShallowHang(false);
    setDeepHang(false);
    setPark(false);
    setFailedClimb(false);
    
    // Set the selected option
    if (option === 'park') {
      setPark(true);
    } else if (option === 'failedClimb') {
      setFailedClimb(true);
    }
  };

  const handleSubmit = async () => {
    // Prepare the data to be submitted
    const hangStatus = shallowHang ? 'Shallow Hang' : deepHang ? 'Deep Hang' : park ? 'Park' : failedClimb ? 'Failed Park' : null;
    
    // Ensure hangStatus is not null before proceeding
    if (hangStatus) {
      const hangData = {
        hang: hangStatus,
        hangTime: (shallowHang || deepHang) ? hangTime : undefined, // Only include hangTime if shallow or deep is selected
      };

      // Add the hang data to the endGameData list
      setEndGameData(hangData);

      // Log the endGameData to the console
      console.log('End Game Data:', hangData);
      await AsyncStorage.setItem('ENDGAME_DATA', JSON.stringify(hangData));

      // Navigate to PostGame screen
      navigation.navigate('PostGame');
    } else {
      console.log('No hang status selected. Please select a hang type.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>End Game</Text>
      <View style={styles.mainContainer}>
        <GestureHandlerRootView style={styles.visualContainer}>
          <View style={styles.hangVisual}>
            <Animated.View style={[styles.chain, chainStyle]} />
            <TouchableOpacity onPress={handleTap}>
              <Animated.View style={[styles.rectangle, boxStyle]} />
            </TouchableOpacity>
          </View>
        </GestureHandlerRootView>

        {/* Add hang status text */}
        <Text style={styles.hangStatusText}>
          {park || failedClimb ? 'NONE' : (isDeep ? 'Deep Hang' : 'Shallow Hang')}
        </Text>

        {/* Park status checkboxes */}
        <View style={styles.parkOptionsContainer}>
          <View style={styles.checkboxRow}>
            <CheckBox
              value={park}
              onValueChange={() => handleOptionSelect('park')}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxText}>Park</Text>
          </View>
          <View style={styles.checkboxRow}>
            <CheckBox
              value={failedClimb}
              onValueChange={() => handleOptionSelect('failedClimb')}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxText}>Failed Climb/Park</Text>
          </View>
        </View>
      </View>
      {/* Move Slider for hang time to the bottom of the screen */}
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
        onPress={handleSubmit} // Call handleSubmit to compile data
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
    height: 200, // Ensure enough space for animation
  },
  chain: {
    width: 3,
    backgroundColor: '#808080',
    position: 'absolute',
    top: 0,
  },
  rectangle: {
    width: 60,
    height: 80,
    borderWidth: 3,
    borderColor: '#ff3030',
    backgroundColor: '#ff3030',
    opacity: 0.8,
  },
  parkOptionsContainer: {
    marginTop: 40,
    flexDirection: 'column',
    gap: 20,
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkboxText: {
    fontSize: 25,
    color: '#ffffff',
  },
  button: {
    position: 'absolute',
    bottom: 40,
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
  undoButton: {
    left: 40,
  },
  submitButton: {
    right: 40,
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
  checkbox: {
    width: 30,
    height: 30,
  },
  hangStatusText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default EndGame;