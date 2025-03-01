import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import AllianceSelection from './AllianceSelection';
import PickList from './PickList';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const AlliancePicklistScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ff3030',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { 
          backgroundColor: '#000',
          paddingTop: 5,
        },
        headerShown: false
      }}
    >
      <Tab.Screen 
        name="AllianceSelection" 
        component={AllianceSelection}
        options={{ 
          title: 'Live Rankings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          )
        }} 
      />
      <Tab.Screen 
        name="PickList" 
        component={PickList}
        options={{ 
          title: 'Pick List',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook" color={color} size={size} />
          )
        }} 
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 20,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlliancePicklistScreen;