/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the UI Kitten template
 * https://github.com/akveo/react-native-ui-kitten
 *
 * Documentation: https://akveo.github.io/react-native-ui-kitten/docs
 *
 * @format
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {View, Text} from 'react-native';
import {
  ApplicationProvider,
  Button,
  Icon,
  IconRegistry,
  Layout,
} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Linking from './src/views/Bluetooth/Linking';
import Connected from './src/views/Bluetooth/Connected';
import MapSimple from './src/views/Map/MapSimple';

/**
 * Use any valid `name` property from eva icons (e.g `github`, or `heart-outline`)
 * https://akveo.github.io/eva-icons
 */

const Stack = createNativeStackNavigator();
export default () => (
  <GestureHandlerRootView>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.light}>
      <NavigationContainer>
        <Stack.Navigator
          options={{headerShown: false}}
          screenOptions={{gestureEnabled: false}}
          initialRouteName="Linking">
          <Stack.Screen
            options={{headerShown: false}}
            name="Linking"
            component={Linking}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Connected"
            component={Connected}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="Map"
            component={MapSimple}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ApplicationProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  likeButton: {
    marginVertical: 16,
  },
});
