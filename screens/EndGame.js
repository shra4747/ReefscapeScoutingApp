// screens/EndGame.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Easing } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedReaction
} from 'react-native-reanimated';
import CheckBox from 'expo-checkbox';
import Slider from '@react-native-community/slider';  // Make sure to install this package
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const EndGame = () => {
  const navigation = useNavigation();
  const [shallowHang, setShallowHang] = React.useState(false);
  const [deepHang, setDeepHang] = React.useState(false);
  const [park, setPark] = React.useState(false); // Start with park off
  const [nonePhase, setNonePhase] = React.useState(true); // None phase is default
  const [failedClimb, setFailedClimb] = React.useState(false);
  const [hangTime, setHangTime] = React.useState(0);
  const [isDeep, setIsDeep] = React.useState(false);
  const [endGameData, setEndGameData] = React.useState([]); // List to store end game data
  const [allianceColor, setAllianceColor] = React.useState('#ff3030'); // Default to red
  const [showTapText, setShowTapText] = React.useState(true); // New state for tap text visibility
  const blinkAnim = useSharedValue(0); // Changed to useSharedValue

  // Animation values
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(90); // Start horizontal (none phase)
  const chainHeight = useSharedValue(0); // Start with no chain

  // Get alliance color from AsyncStorage
  React.useEffect(() => {
    const getColor = async () => {
      const color = await AsyncStorage.getItem('ALLIANCE_COLOR');
      setAllianceColor(color?.toLowerCase() === 'blue' ? '#007AFF' : '#ff3030');
    };
    getColor();
  }, []);

  // Blinking animation
  React.useEffect(() => {
    if (nonePhase && showTapText) {
      blinkAnim.value = withSpring(1, { duration: 500 }); // Faster initial spring
      const interval = setInterval(() => {
        blinkAnim.value = blinkAnim.value === 0 ? 1 : 0;
      }, 500); // Changed from 1000ms to 500ms
      return () => clearInterval(interval);
    }
  }, [nonePhase, showTapText]);

  const handleTap = () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (nonePhase) {
      setShowTapText(false);
      translateY.value = withSpring(0);
      rotateZ.value = withSpring(90);
      chainHeight.value = withSpring(0);
      setPark(true);
      setNonePhase(false);
    } else if (park) {
      translateY.value = withSpring(40);
      rotateZ.value = withSpring(0);
      chainHeight.value = withSpring(40);
      setShallowHang(true);
      setPark(false);
    } else if (shallowHang) {
      translateY.value = withSpring(130);
      chainHeight.value = withSpring(130);
      setDeepHang(true);
      setShallowHang(false);
    } else {
      translateY.value = withSpring(0);
      rotateZ.value = withSpring(90);
      chainHeight.value = withSpring(0);
      setNonePhase(true);
      setDeepHang(false);
    }
  };

  const boxStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { rotateZ: `${rotateZ.value}deg` }
      ],
      backgroundColor: nonePhase ? 'transparent' : allianceColor, // Transparent in none phase
      borderWidth: nonePhase ? 2 : 0, // Add border in none phase
      borderColor: allianceColor, // Use alliance color for border
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
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Check if hang is selected and hang time is 0
    if (!nonePhase && !park && hangTime === 0) {
      alert('Hang Time: Invalid Input');
      return;
    }

    // Determine the hang status based on animation values
    let hangStatus = nonePhase ? 'None' : 
                    park ? 'Park' : 
                    deepHang ? 'Deep Hang' : 
                    'Shallow Hang';
    
    // Append "Failed" if failedClimb is checked and not in None or Park phase
    if (failedClimb && !nonePhase && !park) {
      hangStatus += ' Failed';
    }
    
    const hangData = {
      hang: hangStatus,
      hangTime: (hangStatus !== 'None' && hangStatus !== 'Park') ? hangTime : undefined,
    };

    // Add the hang data to the endGameData list
    setEndGameData(hangData);

    // Log the endGameData to the console
    await AsyncStorage.setItem('ENDGAME_DATA', JSON.stringify(hangData));

    // Navigate to PostGame screen
    navigation.navigate('PostGame');
  };

  const blinkStyle = useAnimatedStyle(() => {
    return {
      opacity: blinkAnim.value,
    };
  });

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

        {nonePhase && showTapText && (
          <Animated.Text style={[styles.tapText, blinkStyle]}>
            TAP TO CHANGE
          </Animated.Text>
        )}

        <Text style={styles.hangStatusText}>
          {nonePhase ? 'None' : 
           park ? 'Park' : 
           (deepHang ? 'Deep Hang' : 'Shallow Hang')}
        </Text>

        {/* Conditionally render failed climb checkbox */}
        {!nonePhase && !park && (
          <View style={styles.parkOptionsContainer}>
            <View style={styles.checkboxRow}>
              <CheckBox
                value={failedClimb}
                onValueChange={(value) => {
                  // Add haptic feedback
                  Haptics.notificationAsync(
                    value ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
                  );
                  setFailedClimb(value);
                }}
                style={styles.checkbox}
                color={allianceColor}
              />
              <Text style={styles.checkboxText}>  Failed to Climb</Text>
            </View>
          </View>
        )}

        {/* Conditionally render hang time slider */}
        {!nonePhase && !park && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Hang Time: {hangTime.toFixed(1)} seconds</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={15}
              step={0.1}
              value={hangTime}
              onValueChange={(value) => {
                // Add haptic feedback
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHangTime(value);
              }}
              minimumTrackTintColor={allianceColor}
              maximumTrackTintColor="#ffffff"
              thumbTintColor={allianceColor}
            />
          </View>
        )}
      </View>
      
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
    position: 'absolute',
    bottom: -40,
    width: '80%',
    alignItems: 'center',
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
    bottom: -150,
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
  tapText: {
    position: 'absolute',
    bottom: 250, // Position above the visual
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default EndGame;