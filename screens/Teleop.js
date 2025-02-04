// screens/BlankScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Teleop = () => {
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [stationCount, setStationCount] = useState(0);
  const [groundCount, setGroundCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const navigation = useNavigation();

  const alliance_color = "Blue";

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

  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Calculate the actual image boundaries within the container
    const imageAspectRatio = 1440 / 789;
    const containerAspectRatio = imageLayout.width / imageLayout.height;
    
    let actualWidth, actualHeight, offsetX, offsetY;
    
    if (containerAspectRatio > imageAspectRatio) {
      actualHeight = imageLayout.height;
      actualWidth = imageLayout.height * imageAspectRatio;
      offsetX = (imageLayout.width - actualWidth) / 2;
      offsetY = 0;
    } else {
      actualWidth = imageLayout.width;
      actualHeight = imageLayout.width / imageAspectRatio;
      offsetX = 0;
      offsetY = (imageLayout.height - actualHeight) / 2;
    }

    const isWithinBounds = 
      locationX >= offsetX && 
      locationX <= offsetX + actualWidth &&
      locationY >= offsetY && 
      locationY <= offsetY + actualHeight;

    if (isWithinBounds) {
      navigation.navigate('AutoP2');
    }
  };

  const handleImageLayout = (event) => {
    setImageLayout(event.nativeEvent.layout);
  };

  const handleUndo = () => {
    setShowNotification(true);
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

      <Text style={styles.title}>Teleop</Text>
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity 
          style={styles.undoButton} 
          onPress={handleUndo}
        >
          <Text style={styles.undoButtonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.proceedButton} 
          onPress={() => navigation.navigate('EndGame')}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
      <TouchableWithoutFeedback onPress={handlePress}>
        <Image 
          source={require(`../assets/${alliance_color}ReefVUSE.png`)}
          style={styles.fieldImage}
          onLayout={handleImageLayout}
        />
      </TouchableWithoutFeedback>
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
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
    color: 'white',
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
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
  fieldImage: {
    // width: '70%',
    // height: '70%',
    // position: 'justify',
    // resizeMode: 'contain',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'gold',
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
    backgroundColor: '#FF0000', // red color
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
});

export default Teleop;