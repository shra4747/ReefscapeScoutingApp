import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import BlankScreen from './screens/BlankScreen';
import PostGame from './screens/PostGame';
import Profile from './screens/Profile';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Page 1" 
          component={BlankScreen} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Post Game" 
          component={PostGame} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Page 3" 
          component={BlankScreen} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Profile" 
          component={Profile} 
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
      <StatusBar style="hidden"/>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
