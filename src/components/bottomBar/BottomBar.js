/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Image,
} from "react-native";
import React from "react";

export default function BottomBar() {
  return (
      <TouchableHighlight
        underlayColor="rgba(151,151,151,0.29)"
        style={styles.boxTittle}
      >
        <View style={styles.centerSearch}>
          <Image
            source={require("../../assets/icons/way.png")}
            style={styles.way}
          />
          <Text style={styles.tittle}>¿Dónde quieres ir?</Text>
        </View>
      </TouchableHighlight>
    
  );
}
const styles = StyleSheet.create({
 
  boxTittle: {
    borderWidth: 1,
    backgroundColor:'white',
    borderColor: "rgba(151,151,151,0.29)",
    width: "100%",
    height: 55,
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "center",
    borderRadius: 10,
    
  },
  centerSearch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
  },
  way: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  tittle: {
    color: "#242A38",
    fontSize: 18,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 21,
    letterSpacing: 0,
    textAlign: "left",
    marginLeft: "5%",
    fontFamily: "Avenir-Medium",
  },
});
