import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

function HelpmeButton(props) {
  return (
    <TouchableOpacity onPress={() => {}} style={styles.container}>
      <Image
        source={require("../assets/help_but.jpg")}
        style={{
          width: 42,
          height: 42,
          marginLeft: 10,
        }}
      />
      <Text
        style={{
          fontWeight: "700",
          fontSize: 14,
          color: "black",
          textTransform: "uppercase",
        }}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 9,
    position: "relative",
    flexDirection: "row",
    width: WIDTH * 0.9,
    //marginHorizontal: 10,
    height: 50,
    top: HEIGHT * 0.02,
    left: 20,
    borderRadius: 2,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "#000000",
    elevation: 10,
    shadowRadius: 5,
    shadowOpacity: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "orange",
  },
});
export default HelpmeButton;
