import React, { useState } from "react";
import { View, Text, Image, Dimensions, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-elements";
import { userContext } from "../userContext";
import firebase from "../../firebase";
const { height, width } = Dimensions.get("window");
function DrawerContent() {
  const navigation = useNavigation();

  const clearAsync = async () => {
    await AsyncStorage.clear(), navigation.navigate("workerLogin");
  };
  const logoutWorker = async () => {
    let id = await AsyncStorage.getItem("id");
    console.warn(id);
    firebase
      .firestore()
      .collection("Employees")
      .where("id", "==", id)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            try {
              firebase
                .firestore()
                .collection("Employees")
                .doc(doc.id)
                .set(
                  {
                    active: false,
                  },
                  { merge: true }
                )
                .then(clearAsync())
                .catch((err) => {
                  console.log(err);
                });
            } catch (e) {
              console.log(e);
              setLoading(false);
            }
          });
        }
      });
  };

  const logoutAlertWorker = async () => {
    Alert.alert("Are You Sure?", "you are about to logout!!", [
      {
        text: "Continue",
        onPress: () => {
          logoutWorker();
        },
        style: "default",
      },
      { text: "Cancel", onPress: () => console.log("OK Pressed") },
    ]);
  };
  return (
    <View>
      <View
        style={{
          height: height,
          borderBottomWidth: 1,
          borderColor: "#65216E",
          backgroundColor: "#f6f6f6",
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Image
          style={{
            height: 90,
            width: 90,
            // backgroundColor: "yellow",
            borderRadius: 100,
            marginTop: 20,
            marginHorizontal: 10,
          }}
        />
        <Button
          title="Update Profile"
          type="outline"
          onPress={() => {
            navigation.navigate("workerupdate");
          }}
        />
        <Button
          title="Log Out"
          type="outline"
          onPress={() => {
            logoutAlertWorker();
          }}
          containerStyle={{
            marginVertical: 15,
          }}
        />
      </View>
      <View>
        <View></View>
      </View>
    </View>
  );
}

export default DrawerContent;
