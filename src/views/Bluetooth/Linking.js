/* eslint-disable quotes */
/* eslint-disable prettier/prettier */

import React, { useEffect, useState, useRef } from "react";
import {
  NativeModules,
  NativeEventEmitter,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Animated,
} from "react-native";
import Toast from 'react-native-toast-message';
import { Layout, Input } from "@ui-kitten/components";

const Linking = ({ navigation, route }) => {
  const { CoreNativePlugin } = NativeModules;
  const { RNEventEmitter } = NativeModules;
  const connectedState = useRef();
  const deviceNameState = useRef();
  const errorState = useRef();
  const [uidBltModel, setuidBltModel] = React.useState("");
  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));

  const handleAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };
  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const animatedStyle = {
    transform: [
      {
        rotate: interpolateRotating,
      },
    ],
  };

  const sdkStart = () => {
    this.eventEmitter = new NativeEventEmitter(RNEventEmitter);
    // CoreNativePlugin.start();
    this.eventEmitter.addListener("startEvent", (success) => {});
    this.eventEmitter.addListener("autopilotStatusEvent", (data) => {
      let status = JSON.parse(data);
      if (
        connectedState.current !== "connected" &&
        status.connection === "connected"
      ) {
        connectedState.current = status.connection;
        deviceNameState.current = status.connectedName;
        navigation.navigate("Connected", { device: deviceNameState.current });
      }
      if (status.error && status.error === "deviceNotFoundTimeout" && errorState.current !== "deviceNotFoundTimeout"){
        errorState.current = status.error;
        Toast.show({
          type: 'error',
          text1: 'Not found device named SeaRebbelMobilePilot',
          text2: 'Vuelve a intentarlo',
        });
      }
    });
  };

  useEffect(() => {
    handleAnimation();
    sdkStart();
  }, []);

  return (
    <Layout style={styles.layout}>
      <ImageBackground
        source={require("../../assets/background/background.png")}
        resizeMode="cover"
        style={styles.image}
      >
        <View style={styles.imageContainerI}>
          <View style={styles.imageContainerII}>
            <Animated.View style={[styles.box, animatedStyle]}>
              <View style={styles.backGroundCircle} />
            </Animated.View>
          </View>
        </View>
  
        <View style={styles.inputAlignment}>
            <Input
              style={{alignSelf:'center', marginBottom:20, width:'90%'}}
              placeholder="Introduce el UUID del módulo Bluetooth"
              value={uidBltModel}
              onChangeText={(nextValue) => setuidBltModel(nextValue)}
            />
            <TouchableHighlight
              onPress={() => {
                CoreNativePlugin.connectAutopilot(uidBltModel);
                errorState.current=""
              }}
              underlayColor="rgba(151,151,151,0.4)"
              style={styles.bluetoothButton}
            >
              <Image
                source={require("../../assets/icons/bluetooth.png")}
                style={styles.arrow}
              />
            </TouchableHighlight>
          </View>
        <View style={styles.textContainer}>
          <View style={styles.textAlignment}>
            <Text style={styles.textTittle}>Vinculando...</Text>
            <Text style={styles.seconText}>Buscando dispositivo...</Text>
          </View>
          <TouchableHighlight
              onPress={() => {
                navigation.navigate("Connected", { device: "" });
               
              }}
              underlayColor="rgba(151,151,151,0.4)"
              style={styles.animationWheel}
            >
              <Image
                source={require("../../assets/icons/arrow-left.png")}
                style={styles.arrow}
              />
            </TouchableHighlight>
        </View>
        <Toast 
        topOffset={50}
         />
         
      </ImageBackground>
    </Layout>
  );
};
const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainerI: {
    width: "100%",
    height: "55%",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainerII: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: "80%",
  },
  backGroundCircle: {
    backgroundColor: "#51DCF9",
    alignContent: "center",
    width: 225,
    height: 225,
    borderRadius: 225,
    borderWidth: 4,
    borderColor: "transparent",
    opacity: 0.2,
  },
  textContainer: {
    width: "90%",
    height: "25%",
    justifyContent: "flex-start",
  },
  textAlignment: {
    width: "90%",
    alignSelf: "center",
  },
  inputAlignment: {
    width: "90%",
    height:"20%",
    alignSelf: "center",
    justifyContent: "flex-start",
    alignContent: "center",
  },
  textTittle: {
    fontFamily: "Avenir Black",
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
  },
  seconText: {
    fontFamily: "Avenir Black",
    fontSize: 17,
    marginTop: 5,
    color: "white",
  },
  bottomStyle: {
    width: "100%",
    height: "14.25%",
    justifyContent: "flex-end",
    alignContent: "flex-end",
   backgroundColor: 'white',
  },
  annimatedConatiner: {
    width: "90%",
    justifyContent: "flex-end",
    alignSelf: "center",
  },
  reconnectContainer: {
    width: "100%",
    height: "4%",
    justifyContent: "center",
    alignContent: "center",
  },
  animationWheel: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    alignSelf: "flex-end",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 25,
    marginBottom: 40,
  },
  bluetoothButton: {
    width: 50,
    height: 50,
    backgroundColor: "black",
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 25,
    marginBottom: 40,
  },
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  arrow: {
    width: 25,
    height: 20,
    alignSelf: "center",
  },
  box: {
    width: 225,
    height: 225,
    borderRadius: 225,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderStyle: "dashed",
    borderWidth: 4,
  },
});

export default Linking;
