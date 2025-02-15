import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StartPage from './screens/StartPage';
import Auto from './screens/Auto';
import AutoP1 from './screens/AutoP1';
import AutoP2 from './screens/AutoP2';
import Teleop from './screens/Teleop';
import EndGame from './screens/EndGame';
import PostGame from './screens/PostGame';
import Confirmation from './screens/Confirmation';
import Profile from './screens/Profile';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="StartPage">
          <Stack.Screen 
            name="StartPage" 
            component={StartPage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Auto" 
            component={Auto} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Teleop" 
            component={Teleop} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EndGame" 
            component={EndGame} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PostGame" 
            component={PostGame} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Confirmation" 
            component={Confirmation} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={Profile} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AutoP1" 
            component={AutoP1} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AutoP2" 
            component={AutoP2} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 0,
    margin: 0,
  },
});