import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export const styles = StyleSheet.create({
  container: {
    zIndex: 9,
    position: "relative",
    flexDirection: "row",
    width: width * 0.9,
    //marginHorizontal: 10,
    height: 50,
    top: height * 0.02,
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

