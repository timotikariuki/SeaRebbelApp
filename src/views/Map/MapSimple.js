/* eslint-disable quotes */
/* eslint-disable prettier/prettier */

import React, { useState } from "react";
import {
  StyleSheet,
  NativeModules,
  View,
  Image,
  Text,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  TouchableHighlight,
  TextInput
} from "react-native";
import { Layout } from "@ui-kitten/components";
import MapboxGL from "@rnmapbox/maps";
import BottomSheetPanel from "../../components/botomSheet/BottomSheet"; // <- añadir este import da el error de Invariant Violation
import pinIcon from "../../assets/icons/gps.png";
import boatIcon from "../../assets/icons/boat.png";
import wayPoint from "../../assets/icons/WayPoint.png";
import { point } from "@turf/helpers";
import PulseCircle from "../../components/pulseCircle/PulseCircleLayer";

import NumericInput from 'react-native-numeric-input'

MapboxGL.setAccessToken(
  "sk.eyJ1IjoibW9iaWxpdHktZGVpbW9zIiwiYSI6ImNsNHdicndiMjFlaGMzZG1sc2NwdXRzaWYifQ.XWCvqAStolfTrPIFrS8jjQ"
);

const { CoreNativePlugin } = NativeModules;
const { RNEventEmitter } = NativeModules;

const stylesLayer = {
  origin: {
    circleRadius: 6,
    circleColor: "#565656",
  },
  iconLayer: {
    iconImage: ["get", "icon"],
    iconSize: ["match", ["get", "icon"], "destination", 0.2, 0.8],
  },
  lineLayer: {
    lineColor: "#565656",
    lineCap: "butt",
    lineJoin: "bevel",
    lineDasharray: [5, 5, 5, 5],
    lineWidth: 2,
  },

  progress: {
    lineColor: "#314ccd",
    lineWidth: 3,
  },
};
export default class MapScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      KPvalue: 25.0,
      KIvalue: 1.0,
      OfstCompGainvalue: 1.0,
      selectedFeature: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
      verticalLineFeature: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
      wayPointsFeature: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPoint",
          coordinates: [],
        },
      },
      progressFeature: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
      drivingMode: false,
      reDraw: false,
      drawing: false,
      setRouteMode: false,
      defineMode: false,
      orientationNorth: true,
      compass: 0,
      finishDrawing: false,
      origin: undefined,
      destination: undefined,
      barPosition: false,
      images: {
        destination: pinIcon,
        boat: boatIcon,
      },
      mapCenter: false,
      center: [],
      speed: 0,
      heading: 0,
      boatOrientation: 0,
      headingError: 0,
      lateralError: 0,
      arrivalTime: 0,
      arrivalDistance: 0,
      locationCamera: [39.439, 3.058],
      userLocation: undefined,
      panelProps: {
        active: true,
        fullWidth: true,
        openLarge: false,
        onClose: () => this.closePanel(),
        onPressCloseButton: () => this.closePanel(),
      }
    };
    this.eventEmitter = new NativeEventEmitter(RNEventEmitter);
  }

  //Native methods
  getCorrectedPath() {
    this.eventEmitter.addListener("correctedPathEvent", (geoJson) => {
      let path = JSON.parse(geoJson);
      if (path.geometry.coordinates.length > 0) {
        this.setState({
          selectedFeature: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: path.geometry.coordinates,
            },
          },
        });
      }
    });
  }
  async getGPSlocation() {
    this.eventEmitter.addListener("gpsLocationEvent", (location) => {
      let user = JSON.parse(location);
      this.setState({ userLocation: [user.longitude, user.latitude] });
      if (this.state.drivingMode) {
        this.onUserLocationUpdate([user.longitude, user.latitude]);
      }
    });
  }

  getNavigationInfo() {
    this.eventEmitter.addListener("navigationStatusEvent", (status) => {
      let info = JSON.parse(status);
      this.setSpeed(info.speedLongitudinalKnots);
      this.setOrientation(info.headingEstRad);
      this.setArribalInfo(info.estTimeArrivalMin, info.estDistanceArrivalM);
      this.setHeadingError(info.headingErrorRad);
      this.setLateralError(info.lateralErrorM);
    });
  }

  setHeadingError(headErr) {
    if (this.state.headingError && this.state.headingError === (headErr * (180 / Math.PI)).toFixed(1)) {
      return;
    }
    this.setState({ headingError: (headErr * (180 / Math.PI)).toFixed(1) });
  }

  setLateralError(latErr) {
    if (this.state.lateralError && this.state.lateralError === latErr.toFixed(1)) {
      return;
    }
    this.setState({ lateralError: latErr.toFixed(1) });
  }

  setSpeed(knots) {
    if (this.state.speed && this.state.speed === knots.toFixed(1)) {
      return;
    }
    this.setState({ speed: knots.toFixed(1) });
  }
  
  setOrientation(rads) {
    if (
      this.state.heading &&
      this.state.heading === Number((rads * (180 / Math.PI)).toFixed(2))
    ) {
      return;
    } else {
      let orientaton = (rads * (180 / Math.PI)).toFixed(1);
      this.setState({ heading: Number(orientaton) });
      if ( this.state.boatOrientation !== Number(orientaton)) {
        this.setState({ boatOrientation: Number(orientaton) });
      }
    }
    //console.log("[HMI-ATTITUDE] rads:", Number((rads * (180 / Math.PI)).toFixed(1)))
    //console.log("[HMI-ATTITUDE] knots:",  this.state.speed)
  }
  setArribalInfo(time, distance) {
    if (
      !this.state.arrivalDistance ||
      this.state.arrivalDistance !== distance
    ) {
      this.setState({ arrivalDistance: distance });
    }
    if (!this.state.arrivalTime || this.state.arrivalTime !== time) {
      this.setState({ arrivalTime: time });
    }
  }

  //Life cycle
  componentDidMount() {
    MapboxGL.locationManager.start();
    if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((result_) => {
            if (result_) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }
    this.getGPSlocation();
    setTimeout(() => {
      this.getUserLocation();
    }, 700);
    this.setState({ boatOrientation: this.state.heading });
    this.getNavigationInfo();
  }
  componentWillUnmount() {
    MapboxGL.locationManager.stop();
  }
  //Press events
  onPressEvent = async (e) => {
    if (this.state.drawing && !this.state.defineMode) {
      const line = this.state.selectedFeature.geometry.coordinates;
      line.push(e.geometry.coordinates);
      this.setState({
        selectedFeature: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: line,
          },
        },
      });
    }
  };
  onLongPressEvent = async (e) => {
    console.log("longPress");
    if (!this.state.drawing && !this.state.setRouteMode) {
      this.onEdit(false);
    }
    if (this.state.drawing) {
      const line = this.state.selectedFeature.geometry.coordinates;
      line.push(e.geometry.coordinates);
      this.setState({
        selectedFeature: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: line,
          },
        },
      });
      if (this.state.defineMode) {
        const wayPointsCoordinates =
          this.state.selectedFeature.geometry.coordinates;
        this.setState({
          wayPointsFeature: {
            type: "Feature",
            geometry: {
              type: "MultiPoint",
              coordinates: wayPointsCoordinates,
            },
          },
        });
      }
    }
  };
  onTouchEvent = async (name, ev) => {
    if (this.state.drawing && !this.state.defineMode) {
      const coordinate = await this._map.getCoordinateFromView([
        ev.nativeEvent.locationX,
        ev.nativeEvent.locationY,
      ]);
      if (coordinate) {
        if (this.state.drawing) {
          const line = this.state.selectedFeature.geometry.coordinates;
          line.push(coordinate);
          this.setState({
            selectedFeature: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: line,
              },
            },
          });
        }
      }
    }
    const center = await this._map.getCenter();
    if (center) {
      this.checkUserCenter(center);
    }
  };

  //Re draw
  reDrawPath = async () => {
    this.setState({ finishDrawing: false });
    this.setState({ drivingMode: false });
    this.deleteLineDraw();
    if (!this.state.setRouteMode) {
      this.setState({ reDraw: true });
      this.onEdit(this.state.defineMode);
    } else {
      this.onSetRoute();
    }
  };
  //Delete Draw
  deleteLineDraw = () => {
    const lineArray = this.state.selectedFeature;
    lineArray.geometry.coordinates = [];
    this.setState({
      selectedFeature: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
    });
    this.setState({
      wayPointsFeature: {
        type: "Feature",
        geometry: {
          type: "MultiPoint",
          coordinates: [],
        },
      },
    });
    this.setState({ setRouteMode: false });
    this.setState({ origin: undefined });
    this.setState({ destination: undefined });
    this.setState({ drawing: false });
    this.setState({ defineMode: false });
  };
  //Finish drawing
  finishDrawing = async () => {
    if (this.state.drawing && !this.state.defineMode) {
      if (this.state.userLocation) {
        let coordinates = this.state.selectedFeature.geometry.coordinates;
        coordinates.unshift(this.state.userLocation);
        this.setState({
          selectedFeature: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
          },
        });
      }

      if (
        this.state.selectedFeature.geometry.coordinates[
          this.state.selectedFeature.geometry.coordinates.length - 1
        ]
      ) {
        this.setState({
          destination:
            this.state.selectedFeature.geometry.coordinates[
              this.state.selectedFeature.geometry.coordinates.length - 1
            ],
        });
      }
      if (this.state.drawing) {
        console.log("finish");
        this.setState({ drawing: false });
        this.setState({ finishDrawing: true });
      }
    }
  };
  //finish drawing by way points
  finishDefining = async () => {
    if (
      (this.state.drawing && this.state.defineMode) ||
      this.state.setRouteMode
    ) {
      if (
        this.state.selectedFeature.geometry.coordinates[
          this.state.selectedFeature.geometry.coordinates.length - 1
        ]
      ) {
        this.setState({
          destination:
            this.state.selectedFeature.geometry.coordinates[
              this.state.selectedFeature.geometry.coordinates.length - 1
            ],
        });
      }
      if (this.state.drawing) {
        this.setState({ drawing: false });
        this.setState({ finishDrawing: true });
      }
      if (this.state.setRouteMode) {
        this.setState({ defineMode: false });
        this.setState({ finishDrawing: true });
      }
      this.setState({
        wayPointsFeature: {
          type: "Feature",
          geometry: {
            type: "MultiPoint",
            coordinates: this.state.wayPointsFeature.geometry.coordinates.slice(
              0,
              -1
            ),
          },
        },
      });
    }
  };
  //Pause - Delete path
  pauseFinishTrack = (pause) => {
    CoreNativePlugin.stop();
    this.setState({ drivingMode: false });
    this.setState({ compass: 0 });
    this.setState({ boatOrientation: this.state.heading });
    this.setState({ orientationNorth: true });
    this.camera.setCamera({
      centerCoordinate: this.state.userLocation,
      zoomLevel: 10,
      animationDuration: 1000,
      animationMode: "flyTo",
      heading: 0,
      padding: {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 380,
      },
    });
    if (!pause) {
      this.eventEmitter.removeAllListeners("correctedPathEvent");
      this.deleteLineDraw();
      this.setState({ destination: undefined });
    }
  };

onSetControlParameters = () => {
  CoreNativePlugin.sendControlParameters(this.state.KPvalue, this.state.KIvalue, this.state.OfstCompGainvalue);
}

  //Set path
  onConfirmPath = () => {
    let path = {};
    if (this.state.selectedFeature.geometry.coordinates.length > 0) {
      path = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: this.state.selectedFeature.geometry.coordinates,
        },
      };
    } else {
      path = {
        type: "FeatureCollection",
        features: [],
      };
    }

    path = JSON.stringify(path);
    CoreNativePlugin.sendPath(path);
    this.getCorrectedPath();
    this.setState({
      progressFeature: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
    });
    this.setState({ finishDrawing: false });
    this.setState({ defineMode: false });
    this.setState({ reDraw: false });
    this.setState({ drivingMode: true });
    this.setState({ compass: this.state.heading });
    //this.setState({ boatOrientation: 0 });
    this.setState({ orientationNorth: false });
    this.camera.setCamera({
      centerCoordinate: this.state.userLocation,
      zoomLevel: 10,
      animationDuration: 1000,
      heading: this.state.heading,
      animationMode: "flyTo",
      padding: {
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 380,
      },
    });
  };
  //Edit Path
  onEdit = (define) => {
    console.log("edit");
    this.setState({ drawing: true });
    this.setState({ drivingMode: false });
    if (define) {
      this.setState({ defineMode: true });
    } else {
      this.setState({ defineMode: false });
    }
    if (this.state.userLocation) {
      let coordinates = this.state.selectedFeature.geometry.coordinates;
      coordinates.unshift(this.state.userLocation);
      this.setState({
        selectedFeature: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });
    }
    // const center = await this._map.getCenter();
    // if (center) {
    //this.setState({ center: center });
    // this.setState({ locationCamera: center });
    // }
  };
  onSetRoute = () => {
    this.setState({ setRouteMode: true });
    this.setState({ drivingMode: false });
  };
  //layers
  renderDestination(point_) {
    const styles = {
      icon: {
        iconImage: pinIcon,
        iconSize: 0.5,
        iconAllowOverlap: true,
      },
    };

    if (point_) {
      return (
        <>
          <MapboxGL.ShapeSource
            id="destinationShource"
            shape={point([point_[0], point_[1]])}
          >
            <MapboxGL.SymbolLayer
              id="iconLayer"
              minZoomLevel={1}
              belowLayerID="boatIcon"
              style={styles.icon}
            />
          </MapboxGL.ShapeSource>
        </>
      );
    }
  }
  renderProgress() {
    if (
      this.state.drivingMode &&
      this.state.progressFeature.geometry.coordinates.length > 0
    ) {
      return (
        <MapboxGL.ShapeSource
          lineMetrics={true}
          id="progressSource"
          shape={this.state.progressFeature}
        >
          <MapboxGL.LineLayer id="progressFill" style={stylesLayer.progress} />
        </MapboxGL.ShapeSource>
      );
    }
  }
  getBoatOrientation() {
    if (this.drivingMode) return 0;
    else return this.state.heading;
  }

  renderBoat() {
    if (this.state.userLocation) {
      return (
        <PulseCircle
          orientation={this.state.boatOrientation}
          drivingMode={this.state.drivingMode}
          north={this.state.orientationNorth}
          shape={point([
            this.state.userLocation[0],
            this.state.userLocation[1],
          ])}
        />
      );
    }
  }
  changeOrientationView() {
    if (this.state.orientationNorth) {
      this.setState({ orientationNorth: false });
      this.setState({ compass: this.state.heading });
      this.setState({ boatOrientation: 0 });
      this.camera.setCamera({
        animationDuration: 1000,
        heading: this.state.heading,
      });
    } else {
      this.setState({ orientationNorth: true });
      this.setState({ compass: 0 });
      this.setState({ boatOrientation: this.state.heading });

      this.setState({ headingError: this.state.heading });

      this.camera.setCamera({
        animationDuration: 1000,
        heading: 0,
      });
    }
  }
  renderLine() {
    return (
      <>
        <MapboxGL.ShapeSource
          id="verticalLineSource"
          shape={this.state.verticalLineFeature}
        >
          <MapboxGL.LineLayer id="verticalLine" style={stylesLayer.lineLayer} />
        </MapboxGL.ShapeSource>
      </>
    );
  }
  renderWayPoints() {
    const styles = {
      icon: {
        iconImage: wayPoint,
        iconSize: 0.3,
        iconAllowOverlap: true,
      },
    };

    return (
      <>
        <MapboxGL.ShapeSource
          id="wayPointsShource"
          shape={this.state.wayPointsFeature}
        >
          <MapboxGL.SymbolLayer
            minZoomLevel={1}
            id="wayPointsIcon"
            belowLayerID="boatIcon"
            style={styles.icon}
          />
        </MapboxGL.ShapeSource>
      </>
    );
  }
  // Draw User way
  onUserLocationUpdate(location) {
    let lineProgres = this.state.progressFeature.geometry.coordinates;
    lineProgres.push(location);
    this.setState({
      progressFeature: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: lineProgres,
        },
      },
    });
  }
  // Center Camera
  getUserLocation() {
    let centerHeading = 0;
    if (this.state.drivingMode) {
      this.setState({ compass: this.state.heading });
      centerHeading = this.state.heading;
    } else if (this.state.orientationNorth) {
      this.setState({ compass: 0 });
      centerHeading = 0;
    } else if (!this.state.orientationNorth) {
      this.setState({ compass: this.state.heading });
      centerHeading = this.state.heading;
    }
    if (this.state.userLocation && this.state.heading) {
      this.camera.setCamera({
        centerCoordinate: this.state.userLocation,
        zoomLevel: 10,
        animationDuration: 1000,
        heading: centerHeading,
        animationMode: "flyTo",
        padding: {
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 380,
        },
      });

      this.setState({ mapCenter: true });
    }
  }
  //Check if user is center
  checkUserCenter(userPosition) {
    if (
      userPosition[0].toFixed(5) === this.state.userLocation[0].toFixed(5) &&
      userPosition[1].toFixed(5) === this.state.userLocation[1].toFixed(5)
    ) {
      this.setState({ mapCenter: true });
    } else {
      this.setState({ mapCenter: false });
    }
  }

  expandBottomSheet() {
    if (
      !this.state.defineMode &&
      !this.state.drawing &&
      !this.state.drivingMode
    ) {
      this.setState({ barPosition: !this.state.barPosition });
    }
  }
  barMode() {
    if (
      !this.state.defineMode &&
      !this.state.drawing &&
      !this.state.drivingMode &&
      !this.state.setRouteMode
    ) {
      return (
        <>
          <Image
            source={require("../../assets/icons/way.png")}
            style={styles.way}
          />
          <Text style={styles.tittle}>¿Dónde quieres ir?</Text>
        </>
      );
    } else if (
      !this.state.defineMode &&
      this.state.drawing &&
      !this.state.drivingMode
    ) {
      return (
        <>
          <View>
            <Image
              source={require("../../assets/icons/draw.png")}
              style={styles.way}
            />
          </View>
          <View>
            <Text style={styles.tittle}>Trazando ruta...</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "50%",
              alignItems: "flex-end",
              alignContent: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <TouchableHighlight
              style={{ padding: 5, marginRight: 10 }}
              underlayColor="rgba(151,151,151,0.49)"
              onPress={() => {
                this.deleteLineDraw();
              }}
            >
              <Image
                source={require("../../assets/icons/cancel.png")}
                style={styles.play}
              />
            </TouchableHighlight>
            <TouchableHighlight
              style={{ padding: 5 }}
              underlayColor="rgba(151,151,151,0.49)"
              onPress={() => {
                this.finishDrawing();
              }}
            >
              <Image
                source={require("../../assets/icons/play.png")}
                style={styles.play}
              />
            </TouchableHighlight>
          </View>
        </>
      );
    } else if (
      this.state.defineMode &&
      this.state.drawing &&
      !this.state.drivingMode
    ) {
      return (
        <>
          <Image
            source={require("../../assets/icons/gps.png")}
            style={styles.way}
          />
          <Text style={styles.tittle}>Fijando waypoint</Text>
          <View
            style={{
              flexDirection: "row",
              width: "45%",
              alignItems: "flex-end",
              alignContent: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <TouchableHighlight
              style={{ padding: 5 }}
              underlayColor="rgba(151,151,151,0.49)"
              onPress={() => {
                this.deleteLineDraw();
              }}
            >
              <Image
                source={require("../../assets/icons/cancel.png")}
                style={styles.play}
              />
            </TouchableHighlight>
            <TouchableHighlight
              style={{ padding: 5 }}
              underlayColor="rgba(151,151,151,0.49)"
              onPress={() => {
                this.finishDefining();
              }}
            >
              <Image
                source={require("../../assets/icons/play.png")}
                style={styles.play}
              />
            </TouchableHighlight>
          </View>
        </>
      );
    } else if (this.state.setRouteMode) {
      return (
        <>
          <Image
            source={require("../../assets/icons/position.png")}
            style={styles.way}
          />
          <Text style={styles.tittle}>Fijando rumbo</Text>
          <View
            style={{
              flexDirection: "row",
              width: "45%",
              alignItems: "flex-end",
              alignContent: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <TouchableHighlight
              style={{ padding: 5 }}
              underlayColor="rgba(151,151,151,0.49)"
              onPress={() => {
                this.deleteLineDraw();
              }}
            >
              <Image
                source={require("../../assets/icons/cancel.png")}
                style={styles.play}
              />
            </TouchableHighlight>
            <TouchableHighlight
              style={{ padding: 5 }}
              underlayColor="rgba(151,151,151,0.49)"
              onPress={() => {
                this.finishDefining();
              }}
            >
              <Image
                source={require("../../assets/icons/play.png")}
                style={styles.play}
              />
            </TouchableHighlight>
          </View>
        </>
      );
    }
  }
  render() {
    return (
      <Layout style={styles.layout}>
        <View style={styles.container}>
          <MapboxGL.MapView
            style={styles.map}
            styleURL={
              "mapbox://styles/mobility-deimos/cl4fk8o7f001114li45uw3peh"
            }
            onStartShouldSetResponder={(ev) => true}
            onResponderGrant={this.onTouchEvent.bind(this, "onResponderGrant")}
            onResponderMove={this.onTouchEvent.bind(this, "onResponderMove")}
            onPress={this.onPressEvent}
            onLongPress={this.onLongPressEvent}
            compassEnabled={false}
            zoomEnabled={!this.state.drawing || this.state.defineMode}
            logoEnabled={false}
            attributionPosition={{ bottom: 12, left: 20 }}
            contentInset={[380, 0, 0, 0]}
            scrollEnabled={!this.state.drawing || this.state.defineMode}
            pitchEnabled={!this.state.drawing || this.state.defineMode}
            ref={(c) => (this._map = c)}
          >
            <MapboxGL.Camera
              ref={(c) => (this.camera = c)}
              zoomLevel={12}
              heading={0}
              centerCoordinate={this.state.locationCamera}
            />

            {this.renderBoat()}

            {this.renderWayPoints()}
            {this.state.destination &&
              this.renderDestination(this.state.destination)}
            {this.state.drivingMode && this.renderProgress()}
            {this.state.selectedFeature.geometry.coordinates.length > 0 && (
              <MapboxGL.ShapeSource
                id="wayDrawSource"
                lineMetrics={true}
                shape={this.state.selectedFeature}
              >
                <MapboxGL.LineLayer
                  id="wayDraw"
                  belowLayerID="boatIcon"
                  style={stylesLayer.lineLayer}
                />
              </MapboxGL.ShapeSource>
            )}
            {this.state.verticalLineFeature.geometry.coordinates.length > 0 &&
              this.renderLine()}
          </MapboxGL.MapView>
          {!this.state.mapCenter && (
            <View style={styles.centerButtonContainer}>
              <TouchableHighlight
                onPress={() => {
                  this.getUserLocation();
                }}
                underlayColor="rgba(151,151,151,1)"
                style={styles.CenterButton}
              >
                <Image
                  source={require("../../assets/icons/center.png")}
                  style={styles.center}
                />
              </TouchableHighlight>
            </View>
          )}

          <View style={styles.speedButtonContainer}>
            <View style={styles.speedButton}>
              <Text style={styles.speedNumber}>{this.state.speed} </Text>
              <Text style={styles.speedText}>knots</Text>
            </View>
          </View>
          
          <View style={styles.headingButtonContainer}>
            <View style={styles.headingButton}>
              <Text style={styles.headingNumber}>{this.state.boatOrientation} </Text>
              <Text style={styles.headingText}>Heading</Text>
            </View>
          </View>

          <View style={styles.ErrHeadingButtonContainer}>
            <View style={styles.ErrHeadingButton}>
              <Text style={styles.ErrHeadingNumber}>{this.state.headingError } </Text>
              <Text style={styles.ErrHeadingText}>ErrHead</Text>
            </View>
          </View>

          <View style={styles.ErrLateralButtonContainer}>
            <View style={styles.ErrLateralButton}>
              <Text style={styles.ErrLateralNumber}>{this.state.lateralError} </Text>
              <Text style={styles.ErrLateralText}>ErrLat</Text>
            </View>
          </View>
          

          
          <View style={styles.KPvalueContainer}>
            <NumericInput
              KPvalue={this.state.KPvalue}
              initValue = {this.state.KPvalue}
              //totalWidth={240} 
              //totalHeight={50} 
              step={1.0}
              valueType="real"
              onChange={
                KPvalue => {this.setState({KPvalue}); this.onSetControlParameters()}
                }
              />
          </View>

          <View style={styles.KIvalueContainer}>
          <NumericInput
            KIvalue={this.state.KIvalue}
            initValue = {this.state.KIvalue}
            //TotalWidth={240} 
            //totalHeight={50} 
            step={0.1}
            valueType="real"
            onChange={
              KIvalue => {this.setState({KIvalue}); this.onSetControlParameters()}
              }
            />
          </View>
          
          <View style={styles.OfstCompGainvalueContainer}>
          <NumericInput
            OfstCompGainvalue={this.state.OfstCompGainvalue}
            initValue = {this.state.OfstCompGainvalue}
            //TotalWidth={240} 
            //totalHeight={50} 
            step={0.1}
            valueType="real"
            onChange={
              OfstCompGainvalue => {this.setState({OfstCompGainvalue}); this.onSetControlParameters()}
              }
            />
          </View>


          <View style={styles.compassButtonContainer}>
            <TouchableHighlight
              onPress={() => {
                this.changeOrientationView();
              }}
              style={styles.compassButton}
            >
              <Image
                source={require("../../assets/icons/compass.png")}
                style={[
                  styles.center,
                  { transform: [{ rotate: `-${this.state.compass}deg` }] },
                ]}
              />
            </TouchableHighlight>
          </View>

          <View style={styles.BottomBarContainer}>
            <TouchableHighlight
              underlayColor="#dedede"
              style={styles.boxTittle}
              onPress={() => {
                this.expandBottomSheet();
              }}
            >
              <View style={styles.centerSearch}>{this.barMode()}</View>
            </TouchableHighlight>
          </View>

          <BottomSheetPanel
            onFinishDrawing={this.state.finishDrawing}
            onEdit={this.onEdit}
            onSetRoute={this.onSetRoute}
            reDrawPath={this.reDrawPath}
            reDraw={this.state.reDraw}
            onConfirmPath={this.onConfirmPath}
            pauseFinishTrack={this.pauseFinishTrack}
            arrivalDistance={this.state.arrivalDistance}
            arrivalTime={this.state.arrivalTime}
            defineMode={this.state.defineMode}
            setRouteMode={this.state.setRouteMode}
            barPosition={this.state.barPosition}
            onSetControlParameters={this.onSetControlParameters}
          />
        </View>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  BottomBarContainer: {
    bottom: "5%",
    backgroundColor: "transparent",
    position: "absolute",
    width: "100%",
    height: 55,
  },
  boxTittle: {
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "rgba(151,151,151,0.29)",
    width: "90%",
    height: 55,
    justifyContent: "center",

    alignSelf: "center",
    borderRadius: 10,
  },
  centerSearch: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  way: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  play: {
    width: 35,
    height: 35,
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
  layout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    height: "100%",
    width: "100%",
  },
  map: {
    flex: 1,
  },
  button: {
    margin: 3,
  },
  center: {
    width: 30,
    height: 30,
    alignSelf: "center",
  },
  centerButtonContainer: {
    alignSelf: "flex-end",
    bottom: "22.5%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  compassButtonContainer: {
    alignSelf: "flex-start",
    bottom: "14.5%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  compassButton: {
    width: 65,
    height: 65,
    backgroundColor: "white",
    alignSelf: "flex-end",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 65,
    marginLeft: 10,
  },
  CenterButton: {
    width: 65,
    height: 65,
    backgroundColor: "black",
    alignSelf: "flex-end",
    alignContent: "center",
    justifyContent: "center",
    marginRight: 10,
    borderRadius: 65,
  },
  speedButtonContainer: {
    alignSelf: "flex-end",
    bottom: "14.5%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  speedButton: {
    width: 65,
    height: 65,
    backgroundColor: "white",
    alignSelf: "flex-end",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 65,
    marginRight: 10,
  },
  speedText: {
    fontSize: 8,
    alignSelf: "center",
  },
  speedNumber: {
    fontSize: 20,
    fontFamily: "Helvetica Bold",
    alignSelf: "center",
  },
  headingButtonContainer: {
    alignSelf: "flex-end",
    bottom: "14.5%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  headingButton: {
    width: 65,
    height: 65,
    backgroundColor: "white",
    alignSelf: "flex-end",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 65,
    marginRight: 80,
  },
  headingText: {
    fontSize: 8,
    alignSelf: "center",
  },
  headingNumber: {
    fontSize: 20,
    fontFamily: "Helvetica Bold",
    alignSelf: "center",
  },

   ErrHeadingButtonContainer: {
    alignSelf: "flex-end",
    bottom: "14.5%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  ErrHeadingButton: {
    width: 65,
    height: 65,
    backgroundColor: "white",
    alignSelf: "flex-end",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 65,
    marginRight: 150,
  },
  ErrHeadingText: {
    fontSize: 8,
    alignSelf: "center",
  },
  ErrHeadingNumber: {
    fontSize: 20,
    fontFamily: "Helvetica Bold",
    alignSelf: "center",
  },
 ErrLateralButtonContainer: {
    alignSelf: "flex-end",
    bottom: "14.5%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  ErrLateralButton: {
    width: 65,
    height: 65,
    backgroundColor: "white",
    alignSelf: "flex-end",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 65,
    marginRight: 220,
  },
  ErrLateralText: {
    fontSize: 8,
    alignSelf: "center",
  },
  ErrLateralNumber: {
    fontSize: 20,
    fontFamily: "Helvetica Bold",
    alignSelf: "center",
  },

  KPvalueContainer: {
    alignSelf: "flex-end",
    bottom: "90%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  KIvalueContainer: {
    alignSelf: "flex-end",
    bottom: "80%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  },
  OfstCompGainvalueContainer: {
    alignSelf: "flex-end",
    bottom: "70%",
    backgroundColor: "transparent",
    position: "absolute",
    borderRadius: 65,
  }
});
