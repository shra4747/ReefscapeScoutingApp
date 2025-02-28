import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import AllianceSelection from './AllianceSelection';
import PickList from './PickList';

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
        options={{ title: 'Alliance' }} 
      />
      <Tab.Screen 
        name="PickList" 
        component={PickList}
        options={{ title: 'Pick List' }} 
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