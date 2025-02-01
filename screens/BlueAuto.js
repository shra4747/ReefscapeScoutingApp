// screens/BlankScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';

const BlueAuto = () => {
  const [dots, setDots] = useState([]);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [imageBounds, setImageBounds] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [stationCount, setStationCount] = useState(0);
  const [groundCount, setGroundCount] = useState(0);

  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Calculate the actual image boundaries within the container
    const imageAspectRatio = 1440 / 789; // Replace with your actual image dimensions
    const containerAspectRatio = imageLayout.width / imageLayout.height;
    
    let actualWidth, actualHeight, offsetX, offsetY;
    
    if (containerAspectRatio > imageAspectRatio) {
      // Image is height-constrained
      actualHeight = imageLayout.height;
      actualWidth = imageLayout.height * imageAspectRatio;
      offsetX = (imageLayout.width - actualWidth) / 2;
      offsetY = 0;
    } else {
      // Image is width-constrained
      actualWidth = imageLayout.width;
      actualHeight = imageLayout.width / imageAspectRatio;
      offsetX = 0;
      offsetY = (imageLayout.height - actualHeight) / 2;
    }

    // Check if touch is within actual image bounds
    const isWithinBounds = 
      locationX >= offsetX && 
      locationX <= offsetX + actualWidth &&
      locationY >= offsetY && 
      locationY <= offsetY + actualHeight;

    if (isWithinBounds) {
      setDots([...dots, { x: locationX, y: locationY }]);
    }
  };

  const handleImageLayout = (event) => {
    setImageLayout(event.nativeEvent.layout);
  };

  const handleUndo = () => {
    setDots(dots.slice(0, -1)); // Remove the last dot
  };

  const handleStationIncrement = () => {
    setStationCount(stationCount + 1);
  };

  const handleStationDecrement = () => {
    if (stationCount > 0) {
      setStationCount(stationCount - 1);
    }
  };

  const handleGroundIncrement = () => {
    setGroundCount(groundCount + 1);
  };

  const handleGroundDecrement = () => {
    if (groundCount > 0) {
      setGroundCount(groundCount - 1);
    }
  };

  return (
    <View style={styles.container}>
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
          onPress={() => {}}  // Add your proceed handler here
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
      <TouchableWithoutFeedback onPress={handlePress}>
        <Image 
          source={require('../assets/BlueReef.png')}
          style={styles.fieldImage}
          onLayout={handleImageLayout}
        />
      </TouchableWithoutFeedback>
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { left: dot.x - 5, top: dot.y - 5 }
          ]}
        />
      ))}
      <TouchableOpacity style={styles.processorButton}>
        <Text style={styles.processorButtonText}>Processor</Text>
      </TouchableOpacity>
      
      <View style={styles.countersContainer}>
        <View style={styles.counterButtonGroup}>
          <TouchableOpacity style={styles.incrementButton} onPress={handleGroundIncrement}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.groundButton}>
            <Text style={styles.groundButtonText}>Ground: {groundCount}</Text>
          </View>
          <TouchableOpacity style={styles.decrementButton} onPress={handleGroundDecrement}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.counterButtonGroup, { marginTop: 10 }]}>
          <TouchableOpacity style={styles.incrementButton} onPress={handleStationIncrement}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.stationButton}>
            <Text style={styles.stationButtonText}>Station: {stationCount}</Text>
          </View>
          <TouchableOpacity style={styles.decrementButton} onPress={handleStationDecrement}>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  undoButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#8B4513', // Brown color
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
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  stationButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  incrementButton: {
    backgroundColor: '#4CAF50',
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
});

export default BlueAuto;