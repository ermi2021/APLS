import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
function DrawerHeader() {
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    height: 170,
    borderBottomWidth: 1,
    borderColor: "#65216E",
    backgroundColor: "grey",
    marginBottom: 20,
  },
});

export default DrawerHeader;
