// screens/BlankScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BlankScreen = () => {
  return (
    <View style={styles.container}>
      <Text>This is a blank page.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BlankScreen;