import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import BlankScreen from './screens/BlankScreen';
import EndGame from './screens/EndGame';
import PostGame from './screens/PostGame';
import Auto from './screens/Auto';
import Teleop from './screens/Teleop';
import AutoP1 from './screens/AutoP1';
import AutoP2 from './screens/AutoP2';
import AutoP21 from './screens/AutoP21';
import StartPage from './screens/StartPage';
import Profile from './screens/Profile';
import Confirmation from './screens/Confirmation';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="StartPage"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="StartPage" component={StartPage} />
        <Stack.Screen name="Auto" component={Auto} />
        <Stack.Screen name="Teleop" component={Teleop} />
        <Stack.Screen name="AutoP1" component={AutoP1} />
        <Stack.Screen name="AutoP2" component={AutoP2} />
        <Stack.Screen name="AutoP21" component={AutoP21} />
        <Stack.Screen name="EndGame" component={EndGame} />
        <Stack.Screen name="PostGame" component={PostGame} />
        <Stack.Screen name="Confirmation" component={Confirmation} />
      </Stack.Navigator>
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
