// screens/AdminConsole.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// ... existing imports ...
// import AlliancePicklistScreen from './screens/AlliancePicklistScreen';

const AdminCons = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>This is a blank page.</Text>
      
      {/* Add new button at bottom */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('AlliancePicklistScreen')}
      >
        <Text style={styles.navButtonText}>Go to Alliance & Picklist</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminCons;