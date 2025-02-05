// screens/BlankScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import 'react-native-gesture-handler';

const Auto = () => {
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [stationCount, setStationCount] = useState(0);
  const [groundCount, setGroundCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [tappedReef, setTappedReef] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const navigation = useNavigation();
  const [selectedSection, setSelectedSection] = useState(null);
  const [showAutoP2, setShowAutoP2] = useState(false);

  const alliance_color = "Red";

  useEffect(() => {
    if (showNotification) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => setShowNotification(false));
    }
  }, [showNotification]);

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
      
      setSelectedSection(section);

      if (selectedSection === section) {
          navigation.navigate('AutoP2', { selectedSection });
      } else {
        setSelectedSection(section);
      }
    }
  };

  const handleImageLayout = (event) => {
    setImageLayout(event.nativeEvent.layout);
  };

  const handleUndo = () => {
    setShowNotification(true);
  };

  const handleTappedReef = () => {
    setTappedReef(true);
  }

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

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.notification,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <Text style={styles.notificationText}>Last action has been undone</Text>
      </Animated.View>

      <Text style={styles.title}>Autonomous</Text>
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity 
          style={styles.undoButton} 
          onPress={handleUndo}
        >
          <Text style={styles.undoButtonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.proceedButton} 
          onPress={() => navigation.navigate('Teleop')}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
      <View 
        style={styles.imageContainer}
        onLayout={handleImageLayout}
      >
        <Image
          source={alliance_color === "Blue" ? 
            require('../assets/BlueReefVUSE.png') : 
            require('../assets/RedReefVUSE.png')
          }
          style={styles.image}
          resizeMode="contain"
        />
        
        <TapGestureHandler onHandlerStateChange={handleTap}>
          <Svg style={[StyleSheet.absoluteFill, {transform: [{rotate: '30deg'}]}]}>
            {selectedSection && (
              <Path
                d={getSectionPath(selectedSection)}
                fill={alliance_color === "Blue" ? "rgba(0, 0, 255, 0.3)" : "rgba(255, 0, 0, 0.3)"}  // Semi-transparent highlight
                stroke={alliance_color === "Blue" ? "blue" : "red"}
                strokeWidth="2"
              />
            )}
          </Svg>
        </TapGestureHandler>
      </View>
      <TouchableOpacity 
        style={styles.processorButton}
        onPress={() => navigation.navigate('AutoP1')}
      >
        <Text style={styles.processorButtonText}>Processor</Text>
      </TouchableOpacity>
      
      <View style={styles.countersContainer}>
        <View style={styles.counterButtonGroup}>
          <TouchableOpacity style={styles.incrementButton} onPress={() => setGroundCount(groundCount + 1)}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.groundButton}>
            <Text style={styles.groundButtonText}>Ground: {groundCount}</Text>
          </View>
          <TouchableOpacity style={styles.decrementButton} onPress={() => groundCount > 0 && setGroundCount(groundCount - 1)}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.counterButtonGroup, { marginTop: 10 }]}>
          <TouchableOpacity style={styles.incrementButton} onPress={() => setStationCount(stationCount + 1)}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.stationButton}>
            <Text style={styles.stationButtonText}>Station: {stationCount}</Text>
          </View>
          <TouchableOpacity style={styles.decrementButton} onPress={() => stationCount > 0 && setStationCount(stationCount - 1)}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
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
    backgroundColor: '#FF0000',
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
    backgroundColor: '#FF0000',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF0000',
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
    backgroundColor: '#FF0000', // Red color
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
    backgroundColor: '#FF0000',
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
    backgroundColor: '#FF0000',
    width: 30,
    height: 30,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  decrementButton: {
    backgroundColor: '#FF0000',
    width: 30,
    height: 30,
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
    backgroundColor: '#FF3B30',
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
    backgroundColor: '#FF0000',
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
});

export default Auto;