/* eslint-disable prettier/prettier */
import React from "react";
import PropTypes from "prop-types";
import { Animated } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import boatIcon from "../../assets/icons/boat.png";
import redLine from "../../assets/icons/redLine.png";

class PulseCircleLayer extends React.Component {
  static propTypes = {
    radius: PropTypes.number,
    pulseRadius: PropTypes.number,
    duration: PropTypes.number,
    innerCircleStyle: PropTypes.any,
    outerCircleStyle: PropTypes.any,
    shape: PropTypes.any,
    aboveLayerID: PropTypes.string,
  };

  static defaultProps = {
    radius: 20,
    pulseRadius: 40,
    duration: 1000,
  };
  styles = {
    innerCircle: {
      circleColor: "white",
      circleStrokeWidth: 1,
      circleStrokeColor: "#c6d2e1",
    },
    innerCirclePulse: {
      circleColor: "#4264fb",
      circleStrokeColor: "#c6d2e1",
      circleOpacity: 0.4,
      circleStrokeWidth: 1,
    },
    outerCircle: {
      circleOpacity: 0.4,
      circleColor: "#c6d2e1",
    },
    boatIcon: {
      iconImage: boatIcon,
      iconSize: 0.14,
      iconAllowOverlap: true,
    },
    redLineIcon: {
      iconImage: redLine,
      iconSize: 1,
      iconRotate: this.props.orientation,
      iconAllowOverlap: true,
      iconOffset: [0, -440],
    },
  };
  constructor(props) {
    super(props);

    this.state = {
      innerRadius: new Animated.Value(props.radius * 0.5),
      pulseOpacity: new Animated.Value(1),
      pulseRadius: new Animated.Value(props.radius),
      heading: this.props.orientation,
      drivingMode: this.props.drivingMode,
    };

    this._loopAnim = null;
  }

  componentDidMount() {
    const expandOutAnim = Animated.parallel([
      Animated.timing(this.state.pulseOpacity, {
        toValue: 0,
        duration: this.props.duration,
        useNativeDriver: false,
      }),
      Animated.timing(this.state.pulseRadius, {
        toValue: this.props.pulseRadius,
        duration: this.props.duration,
        useNativeDriver: false,
      }),
      Animated.timing(this.state.innerRadius, {
        toValue: this.props.radius * 0.7,
        duration: this.props.duration / 2,
        useNativeDriver: false,
      }),
    ]);

    const shrinkInAnim = Animated.parallel([
      Animated.timing(this.state.pulseRadius, {
        toValue: this.props.radius,
        duration: this.props.duration / 2,
        useNativeDriver: false,
      }),
      Animated.timing(this.state.innerRadius, {
        toValue: this.props.radius * 0.5,
        duration: this.props.duration / 2,
        useNativeDriver: false,
      }),
    ]);

    this._loopAnim = Animated.loop(
      Animated.sequence([expandOutAnim, shrinkInAnim])
    );

    this._loopAnim.start(this.setState({}));
  }

  componentWillUnmount() {
    this._loopAnim.stop();
  }

  componentDidUpdate() {
    //console.log(this.props.orientation);
  }

  render() {
    if (!this.props.shape) {
      return null;
    }

    const innerCircleStyle = [
      this.styles.innerCircle,
      this.props.innerCircleStyle,
      { circleRadius: this.props.radius },
    ];

    const innerCirclePulseStyle = [
      this.styles.innerCirclePulse,
      { circleRadius: this.state.innerRadius },
    ];

    const outerCircleStyle = [
      this.styles.outerCircle,
      this.props.outerCircleStyle,
      {
        circleRadius: this.state.pulseRadius,
        circleOpacity: this.state.pulseOpacity,
      },
    ];

    return (
      <MapboxGL.Animated.ShapeSource
        id="pulseCircleSource"
        shape={this.props.shape}
      >
        <MapboxGL.SymbolLayer
          id="boatIcon"
          minZoomLevel={1}
          style={{...this.styles.boatIcon, iconRotate: 270 + this.props.orientation}}
        />

        <MapboxGL.SymbolLayer
          id="redLine"
          belowLayerID="boatIcon"
          minZoomLevel={1}
          style={{...this.styles.redLineIcon, iconRotate:  this.props.orientation}}
        />

        <MapboxGL.Animated.CircleLayer
          id="pulseOuterCircle"
          style={outerCircleStyle}
          belowLayerID={"boatIcon"}
        />
      </MapboxGL.Animated.ShapeSource>
    );
  }
}

export default Animated.createAnimatedComponent(PulseCircleLayer);
