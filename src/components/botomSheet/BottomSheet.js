/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */

import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, Divider } from "@ui-kitten/components";
import BottomSheet from "@gorhom/bottom-sheet";

const BottomSheetPanel = ({
  onEdit,
  onSetRoute,
  onFinishDrawing,
  onConfirmPath,
  reDrawPath,
  reDraw,
  pauseFinishTrack,
  arrivalDistance,
  arrivalTime,
  barPosition,
  defineMode,
  setRouteMode,
  onSetControlParameters,
}) => {
  // variables
  const snapPoints = useMemo(() => ["35%"], []);
  const snapPointsDraw = useMemo(() => ["65%"], []);
  const snapPointsDefine = useMemo(() => ["30%"], []);
  const snapPointsRoute = useMemo(() => ["30%"], []);
  const snapPointsSetPath = useMemo(() => ["22%"], []);
  const snapPointsNavigation = useMemo(() => ["14%"], []);

  const bottomSheetRef = useRef(null);
  const bottomSheetDrawRef = useRef(null);
  const bottomSetPathSheet = useRef(null);
  const bottomNavigation = useRef(null);
  const bottomSheetDefineRef = useRef(null);
  const bottomSheetRouteRef = useRef(null);

  useEffect(() => {
    bottomSheetRef.current.snapToIndex(0);
  }, []);
  useEffect(() => {
    if (onFinishDrawing) {
      bottomSheetDrawRef.current.close();
      bottomSheetRef.current.close();
      bottomSetPathSheet.current.snapToPosition("22%");
    }
  }, [onFinishDrawing, reDraw]);

  useEffect(() => {
    bottomSheetRef.current.expand();
  }, [barPosition]);
  // callbacks

  const pressDrawCard = () => {
    bottomSheetDrawRef.current.snapToPosition("65%");
    bottomSheetRef.current.close();
  };
  const pressDefineCard = () => {
    bottomSheetDefineRef.current.snapToPosition("30%");
    bottomSheetRef.current.close();
  };
  const pressRouteCard = () => {
    bottomSheetRouteRef.current.snapToPosition("30%");
    bottomSheetRef.current.close();
  };
  const openCloseSheet = () => {
    bottomSheetRef.current.close();
  };
  const pressCancel = () => {
    bottomSheetDrawRef.current.close();
    bottomSheetRef.current.expand();
  };

  const pressCancelDefine = () => {
    bottomSheetDefineRef.current.close();
    bottomSheetRef.current.expand();
  };
  const pressCancelRoute = () => {
    bottomSheetRouteRef.current.close();
    bottomSheetRef.current.expand();
  };

  const pressStart = () => {
    bottomSheetDrawRef.current.close();
    onEdit(false);
  };
  const pressStartDefine = () => {
    bottomSheetDefineRef.current.close();
    onEdit(true);
  };
  const pressStartRoute = () => {
    onSetRoute();
    bottomSheetRouteRef.current.close();
  };

  const pauseRoute = () => {
    bottomNavigation.current.close();
    bottomSheetRef.current.close();
    pauseFinishTrack(false);
  };

  const goToRoute = () => {
    bottomSetPathSheet.current.close();
    bottomSheetRouteRef.current.close();
    bottomSheetDrawRef.current.close();
    bottomSheetRef.current.close();
    bottomNavigation.current.expand();
    onConfirmPath();
  };
  const drawAgain = () => {
    reDrawPath();
    bottomSetPathSheet.current.close();
    bottomSheetDrawRef.current.close();
    bottomSheetRef.current.close();
  };
  // renders
  return (
    <>
      <BottomSheet
        style={styles.bottomSheet}
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
      >
        <TouchableHighlight
          onPress={() => {
            openCloseSheet();
          }}
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
        <View style={styles.cardContainer}>
          <TouchableHighlight
            style={styles.card}
            underlayColor="rgba(151,151,151,0.29)"
            onPress={() => {
              pressDrawCard();
            }}
          >
            <View style={styles.buttonAble}>
              <Image
                source={require("../../assets/icons/draw.png")}
                style={styles.way}
              />
              <Text style={styles.cardTittle}>Dibuja</Text>
              <Text style={styles.cardSubTittle}>tu ruta</Text>
            </View>
          </TouchableHighlight>
          <TouchableOpacity
            style={styles.card}
            underlayColor="rgba(151,151,151,0.29)"
            onPress={() => {
              pressDefineCard();
            }}
          >
            <View style={styles.buttonAble}>
              <Image
                source={require("../../assets/icons/gps.png")}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTittle}>Define</Text>
              <Text style={styles.cardSubTittle}>un destino</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            underlayColor="rgba(151,151,151,0.29)"
            onPress={() => {
              pressRouteCard();
            }}
          >
            <View style={styles.buttonAble}>
              <Image
                source={require("../../assets/icons/position.png")}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTittle}>Fija</Text>
              <Text style={styles.cardSubTittle}>una dirección</Text>
            </View>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <BottomSheet
        style={styles.bottomSheet}
        index={-1}
        ref={bottomSheetDrawRef}
        snapPoints={snapPointsDraw}
        detached={false}
      >
        <View style={styles.drawContainer}>
          <View style={styles.drawRow}>
            <View style={styles.drawIcon}>
              <Image
                source={require("../../assets/icons/way-white.png")}
                style={styles.way2}
              />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.drawTittle}>Dibuja</Text>
              <Text style={styles.drawSubTittle}>tu ruta en el mapa</Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Para definir tu ruta, traza con el dedo en el mapa el recorrido
              que quieres navegar.
            </Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/icons/gestureExplanation.png")}
            style={styles.explanationImage}
          />
        </View>
        <Divider />
        <View style={styles.buttonContainer}>
          <TouchableHighlight
            style={styles.touchableButton}
            underlayColor="rgba(151,151,151,0.29)"
            onPress={() => pressCancel()}
          >
            <View style={styles.buttonEnd}>
              <Text style={styles.textButtonEnd}>Cancelar</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            style={styles.touchableButton}
            underlayColor="rgba(95,95,95,0.29)"
            onPress={() => pressStart()}
          >
            <View style={styles.buttonStart}>
              <Text style={styles.textButtonStart}>Empezar</Text>
            </View>
          </TouchableHighlight>
        </View>
      </BottomSheet>

      <BottomSheet
        style={styles.bottomSheet}
        index={-1}
        ref={bottomSheetDefineRef}
        snapPoints={snapPointsDefine}
        detached={false}
      >
        <View style={styles.drawContainer}>
          <View style={styles.drawRow}>
            <View style={styles.drawIcon}>
              <Image
                source={require("../../assets/icons/define.png")}
                style={styles.way2}
              />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.drawTittle}>Define</Text>
              <Text style={styles.drawSubTittle}>tu ruta en el mapa</Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Para definir tu ruta, mantén pulsado en el mapa los puntos que
              formen tu ruta.
            </Text>
          </View>
        </View>
        <Divider />
        <View style={styles.buttonContainerDefine}>
          <TouchableHighlight
            style={styles.touchableButton}
            underlayColor="rgba(151,151,151,0.29)"
            onPress={() => pressCancelDefine()}
          >
            <View style={styles.buttonEnd}>
              <Text style={styles.textButtonEnd}>Cancelar</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            style={styles.touchableButton}
            underlayColor="rgba(95,95,95,0.29)"
            onPress={() => pressStartDefine()}
          >
            <View style={styles.buttonStart}>
              <Text style={styles.textButtonStart}>Empezar</Text>
            </View>
          </TouchableHighlight>
        </View>
      </BottomSheet>

      <BottomSheet
        style={styles.bottomSheet}
        index={-1}
        ref={bottomSheetRouteRef}
        snapPoints={snapPointsRoute}
        detached={false}
      >
        <View style={styles.drawContainer}>
          <View style={styles.drawRow}>
            <View style={styles.drawIcon}>
              <Image
                source={require("../../assets/icons/positionWhite.png")}
                style={styles.way2}
              />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.drawTittle}>Fija</Text>
              <Text style={styles.drawSubTittle}>una dirección en el mapa</Text>
            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Pulsea en 'Empezar' para comenzar la ruta
            </Text>
          </View>
        </View>
        <Divider />
        <View style={styles.buttonContainerDefine}>
          <TouchableHighlight
            style={styles.touchableButton}
            underlayColor="rgba(151,151,151,0.29)"
            onPress={() => pressCancelRoute()}
          >
            <View style={styles.buttonEnd}>
              <Text style={styles.textButtonEnd}>Cancelar</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            style={styles.touchableButton}
            underlayColor="rgba(95,95,95,0.29)"
            onPress={() => goToRoute()}
          >
            <View style={styles.buttonStart}>
              <Text style={styles.textButtonStart}>Empezar</Text>
            </View>
          </TouchableHighlight>
        </View>
      </BottomSheet>

      <BottomSheet
        style={styles.bottomSheet}
        index={-1}
        ref={bottomSetPathSheet}
        snapPoints={snapPointsSetPath}
        detached={false}
      >
        <View style={styles.dialogConfirmContainer}>
          {defineMode ? (
            <View style={styles.dialogConfirmContainerII}>
              <View style={styles.confirmImage}>
                <Image
                  source={require("../../assets/icons/define.png")}
                  style={styles.way}
                />
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.confirmTittle}>Define</Text>
                <Text style={styles.confirmSubtittle}>tu ruta en el mapa</Text>
              </View>
            </View>
          ) : setRouteMode ? (
            <View style={styles.dialogConfirmContainerII}>
              <View style={styles.confirmImage}>
                <Image
                  source={require("../../assets/icons/positionWhite.png")}
                  style={styles.way}
                />
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.confirmTittle}>Fija</Text>
                <Text style={styles.confirmSubtittle}>
                  una dirección en el mapa
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.dialogConfirmContainerII}>
              <View style={styles.confirmImage}>
                <Image
                  source={require("../../assets/icons/way-white.png")}
                  style={styles.way}
                />
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.confirmTittle}>Dibuja</Text>
                <Text style={styles.confirmSubtittle}>tu ruta en el mapa</Text>
              </View>
            </View>
          )}
          <View style={styles.confirmButtonContainer}>
            <TouchableHighlight
              style={styles.touchableButton}
              underlayColor="rgba(151,151,151,0.29)"
              onPress={() => drawAgain()}
            >
              <View style={styles.buttonEnd}>
                <Text style={styles.textButtonEnd}>Rehacer</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight
              style={styles.touchableButton}
              underlayColor="rgba(95,95,95,0.29)"
              onPress={() => goToRoute()}
            >
              <View style={styles.buttonStart}>
                <Text style={styles.textButtonStart}>Ir ahora</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        style={styles.bottomSheet}
        index={-1}
        ref={bottomNavigation}
        snapPoints={snapPointsNavigation}
        detached={false}
      >
        <View style={styles.drivingModeContainerI}>
          <View style={styles.drivingModeContainerII}></View>
          <View style={{ width: "60%", alignSelf: "center" }}>
            <Text style={styles.arrivalText}>{arrivalTime}</Text>
            <Text style={styles.arrivalDistance}>{arrivalDistance} km</Text>
          </View>
          <View style={styles.pauseContainer}>
            <TouchableHighlight
              style={styles.pauseButton}
              underlayColor="rgba(151,151,151,0.29)"
              onPress={() => {
                pauseRoute();
              }}
            >
              <View style={styles.pauseIcon}>
                <Image
                  source={require("../../assets/icons/pause.png")}
                  style={styles.pause}
                />
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },
  pauseIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 4,
    backgroundColor: "#fff",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 15,
  },
  drivingModeContainerI: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    alignContent: "center",
    alignSelf: "center",
  },
  drivingModeContainerII: {
    width: "20%",
    alignContent: "center",
    justifyContent: "center",
  },
  explanationImage: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  pauseButton: {
    alignSelf: "center",
    width: 42,
    height: 42,
    borderRadius: 4,
  },
  drawTittle: {
    fontSize: 20,
    fontFamily: "Avenir Heavy",
    fontWeight: "bold",
    color: "#303542",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  disabled: {
    backgroundColor: "#fff",
  },
  cardContainer: {
    flex: 1,
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    justifyContent: "space-between",
    marginTop: 35,
  },
  pauseContainer: {
    width: "20%",
    alignContent: "center",
    justifyContent: "center",
  },
  buttonAble: {
    borderRadius: 6,
    width: "100%",
    height: 125,
    backgroundColor: "#fff",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  drawSubTittle: {
    fontSize: 13,
    fontFamily: "Avenir Book",
    color: "#474747",
  },
  drawIcon: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#00D0A5",
    justifyContent: "center",
  },
  card: {
    width: "30%",
    height: 125,
    backgroundColor: "#fff",
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  cardDisabled: {
    width: "30%",
    height: 125,
    backgroundColor: "#fff",
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    opacity: 0.5,
  },
  arrivalDistance: {
    fontFamily: "Avenir Book",
    fontSize: 16,
    color: "#242E42",
    alignSelf: "center",
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
  way2: {
    width: 38,
    height: 38,
    alignSelf: "center",
  },
  pause: {
    width: 25,
    height: 25,
    alignSelf: "center",
  },
  cardIcon: {
    width: 30,
    height: 30,
  },
  arrivalText: {
    fontFamily: "Avenir Heavy",
    fontSize: 26,
    color: "#00C3DA",
    fontWeight: "bold",
    alignSelf: "center",
  },
  cardIconGps: {
    width: 30,
    height: 30,
  },
  cardTittle: {
    fontSize: 16,
    fontFamily: "Avenir-Book",
    color: "#242E42",
  },
  cardSubTittle: {
    fontSize: 13,
    color: "#474747",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    alignContent: "center",
    justifyContent: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    zIndex: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dialogConfirmContainer: {
    flex: 1,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
    marginTop: 10,
  },
  dialogConfirmContainerII: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  confirmImage: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#00D0A5",
    justifyContent: "center",
  },
  confirmTittle: {
    fontSize: 20,
    fontFamily: "Avenir Heavy",
    fontWeight: "bold",
    color: "#303542",
  },
  confirmSubtittle: {
    fontSize: 13,
    fontFamily: "Avenir Book",
    color: "#474747",
  },
  confirmButtonContainer: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
  },
  drawContainer: {
    width: "85%",
    alignSelf: "center",
    backgroundColor: "#fff",
    marginTop: 5,
  },
  descriptionContainer: {
    alignContent: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: "Avenir Book",
    color: "#242A37",
  },
  drawRow: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  boxTittle: {
    borderWidth: 1,
    borderColor: "rgba(151,151,151,0.29)",
    width: "90%",
    height: 55,
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "center",
    borderRadius: 10,
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
  buttonStart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 15,
    backgroundColor: "black",
    width: "100%",
  },
  buttonEnd: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 22,
    backgroundColor: "#fff",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 15,
    borderRadius: 8,
    width: "100%",
  },
  touchableButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    width: "40%",
    marginTop: 20,
    borderRadius: 10,
  },
  textButtonStart: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  textButtonEnd: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "95%",
    height: "25%",
    alignSelf: "center",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },
  buttonContainerDefine: {
    flexDirection: "row",
    width: "95%",
    alignSelf: "center",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },
  imageContainer: {
    flex: 1,
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BottomSheetPanel;
