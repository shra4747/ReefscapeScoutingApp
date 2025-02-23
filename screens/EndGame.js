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
  const [park, setPark] = React.useState(true); // Start in park position
  const [failedClimb, setFailedClimb] = React.useState(false);
  const [hangTime, setHangTime] = React.useState(0);
  const [isDeep, setIsDeep] = React.useState(false);
  const [endGameData, setEndGameData] = React.useState([]); // List to store end game data
  const [allianceColor, setAllianceColor] = React.useState('#ff3030'); // Default to red

  // Animation values
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(90); // Start horizontal (park position)
  const chainHeight = useSharedValue(0); // Start with no chain

  // Get alliance color from AsyncStorage
  React.useEffect(() => {
    const getColor = async () => {
      const color = await AsyncStorage.getItem('ALLIANCE_COLOR');
      setAllianceColor(color?.toLowerCase() === 'blue' ? '#007AFF' : '#ff3030');
    };
    getColor();
  }, []);

  const handleTap = () => {
    if (park) {
      // Move to shallow hang position from park
      translateY.value = withSpring(40); // Move up
      rotateZ.value = withSpring(0); // Rotate to vertical
      chainHeight.value = withSpring(40); // Show chain
      setShallowHang(true);
      setPark(false);
    } else if (shallowHang) {
      // Move to deep hang position from shallow
      translateY.value = withSpring(130); // Move up further
      chainHeight.value = withSpring(130); // Extend chain
      setDeepHang(true);
      setShallowHang(false);
    } else {
      // Move back to park position from deep
      translateY.value = withSpring(0); // Move down
      rotateZ.value = withSpring(90); // Rotate to horizontal
      chainHeight.value = withSpring(0); // Hide chain
      setPark(true);
      setDeepHang(false);
    }
  };

  const boxStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotateZ: `${rotateZ.value}deg` }
      ],
      backgroundColor: allianceColor, // Use alliance color
    };
  });

  const chainStyle = useAnimatedStyle(() => {
    return {
      height: chainHeight.value,
    };
  });

  // Function to handle option selection
  const handleOptionSelect = (option) => {
    // Toggle the selected option
    if (option === 'park') {
      setPark(prev => !prev);
      setFailedClimb(false);
    } else if (option === 'failedClimb') {
      setFailedClimb(prev => !prev);
      setPark(false);
    } else {
      // For other options, reset both park and failedClimb
      setPark(false);
      setFailedClimb(false);
    }
  };

  const handleSubmit = async () => {
    // Determine the hang status based on animation values
    const hangStatus = park ? 'Park' : 
                      deepHang ? 'Deep Hang' : 
                      'Shallow Hang';
    
    const hangData = {
      hang: hangStatus,
      hangTime: (hangStatus !== 'Park' && !failedClimb) ? hangTime : undefined, // Only include hangTime if not in park and not failed
    };

    // Add the hang data to the endGameData list
    setEndGameData(hangData);

    // Log the endGameData to the console
    console.log('End Game Data:', hangData);
    await AsyncStorage.setItem('ENDGAME_DATA', JSON.stringify(hangData));

    // Navigate to PostGame screen
    navigation.navigate('PostGame');
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

        {/* Keep hang status text unchanged */}
        <Text style={styles.hangStatusText}>
          {park ? 'Park' : (deepHang ? 'Deep Hang' : 'Shallow Hang')}
        </Text>

        {/* Conditionally render failed climb checkbox */}
        {!park && (
          <View style={styles.parkOptionsContainer}>
            <View style={styles.checkboxRow}>
              <CheckBox
                value={failedClimb}
                onValueChange={() => setFailedClimb(prev => !prev)}
                style={styles.checkbox}
              />
              <Text style={styles.checkboxText}>Failed Climb/Park</Text>
            </View>
          </View>
        )}
      </View>

      {/* Conditionally render hang time slider */}
      {!park && (
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
        style={[styles.button, styles.submitButton]}
        onPress={handleSubmit}
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