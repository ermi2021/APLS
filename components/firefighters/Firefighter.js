import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Callout } from "react-native-maps";
import Animated from "react-native-reanimated";
const { width, height } = Dimensions.get("window");
function Firefighter(props) {
  const firefight = props.firefighter
    ? props.firefighter
    : {
        uid: "noFireFighterAround",
        location: { latitude: 0, longitude: 0 },
      };

  const coord = {
    latitude: firefight.location.latitude,
    longitude: firefight.location.longitude,
  };

  const [firefighter, setFirefighter] = useState(firefight);
  const [coordinate, setCoordinate] = useState(coord);

  return (
    <MapView.Marker.Animated
      coordinate={coordinate}
      anchor={{ x: 0.35, y: 0.32 }}
      ref={(marker) => {
        marker = marker;
      }}
      // style={{ width: 50, height: 50 }}
    >
      <Image
        source={{
          uri: props.profilepic,
        }}
        style={{
          width: 50,
          height: 50,
        }}
      />
      <Callout>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: width * 0.7,
            backgroundColor: "white",
            height: 200,
            justifyContent: "center",
            alignItems: "center",
            //  padding: 20,
            borderRadius: 10,
            elevation: 4,
          }}
        >
          <Text>{firefight.pn}</Text>
          <Text>{firefight.pn}</Text>
          <Text>{firefight.pn}</Text>
          <Text>{firefight.pn}</Text>
        </View>
      </Callout>
    </MapView.Marker.Animated>
  );
}

export default Firefighter;
