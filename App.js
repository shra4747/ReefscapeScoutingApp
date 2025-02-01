import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import BlankScreen from './screens/BlankScreen';
import EndGame from './screens/EndGame';
import PostGame from './screens/PostGame';
import Auto from './screens/Auto';
import Teleop from './screens/Teleop';
import BlueAuto from './screens/BlueAuto';
import AutoP1 from './screens/AutoP1';
import AutoP2 from './screens/AutoP2';
import AutoP21 from './screens/AutoP21';
import StartPage from './screens/StartPage';
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
          name="Start" 
          component={StartPage} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Auto" 
          component={Auto} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Teleop" 
          component={Teleop} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="BlueAuto" 
          component={BlueAuto} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="AutoP1" 
          component={AutoP1} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="AutoP2" 
          component={AutoP2} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="AutoP21" 
          component={AutoP21} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Post Game" 
          component={PostGame} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="EndGame" 
          component={EndGame} 
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
