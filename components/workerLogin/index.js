import React, { useState, useContext, useRef } from "react";
import { View, Text } from "react-native";
import { Input } from "react-native-elements";
import firebase from "firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import styles from "./styles";

import PhoneInput from "react-native-phone-number-input";
const { width, height } = Dimensions.get("window");
function index({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const phoneInput = useRef();
  const [formattedPhoneNumber, setFormattedValue] = useState("");
  const [username, setUsername] = useState("");
  const [isValid, setValid] = useState(true);
  const [password, setPassword] = useState("");
  const [resApproved,setResApproved] = useState([]);
  const [loading, setLoading] = useState(false);
  const employees = firebase.firestore().collection("Employees");
  const login = async () => {
    setLoading(true);
    firebase
      .firestore()
      .collection("Employees")
      .where("UserName", "==", username)
      .where("Password", "==", password)
      .where("Role", "==", "FireFighter")
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            try {
              employees
                .doc(doc.id)
                .set(
                  {
                    active: true,
                  },
                  { merge: true }
                )
                .then(() => {
                  AsyncStorage.multiSet([
                    ["id", doc.data().id],
                    ["username", username],
                    ["password", password],
                    ["firstname", doc.data().FirstName],
                    ["middlename", doc.data().MiddleName],
                    ["lastname", doc.data().LastName],
                    ["profilepicture", doc.data().Profile_picture.imgUrl],
                  ]);
                  navigation.navigate("W_HOME");
                  setLoading(false);
                })
                .catch((err) => {
                  console.log(err);
                });
            } catch (e) {
              console.log(e);
              setLoading(false);
            }
          });
        } else {
          setValid(false);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.warn("Error getting documents: ", error);
      });
  };



  if (loading) {
    return (
      <View
        style={{
          height: height * 0.9,
          width: width,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="small" color="orange" />
        <Text style={{ textAlign: "center", fontWeight: "700" }}>
          Please Wait ..
        </Text>
      </View>
    );
  }
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        marginVertical: 50,
        height: height * 0.8,
        width: width,
        paddingHorizontal: 20,
        //  alignItems: "center",
      }}
    >
      <View>
        {/* <Image
          source={require("../../assets/login.png")}
          style={{
            height: 120,
            width: width * 0.8,
            alignSelf: "center",
            resizeMode: "contain",
          }}
        /> */}
      </View>
      <Text
        style={{
          textAlign: "center",
          fontWeight: "700",
          marginVertical: 20,
          fontSize: 18,
          marginLeft: 10,
        }}
      >
        Login
      </Text>
      {isValid == false ? (
        <Text
          style={{
            fontWeight: "700",
            textAlign: "center",
            color: "red",
            fontSize: 14,
            marginVertical: 10,
          }}
        >
          Incorrect Username or Password,try again!!!
        </Text>
      ) : (
        <View></View>
      )}
      <Input
        placeholder="username"
        onChangeText={(text) => setUsername(text)}
        value={username}
        style={{ fontSize: 16, color: "black" }}
      />

      <Input
        placeholder="password"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
        value={password}
        style={{ fontSize: 16, color: "black", marginVertical: -10 }}
      />

      <Button
        title="submit"
        style={{ marginVertical: 20, marginHorizontal: 20 }}
        onPress={() => {
          login();
        }}
      />
      <Text
        style={{
          textAlign: "right",
          color: "blue",
          marginTop: 20,
          fontWeight: "700",
        }}
      >
        Forgot Password ?
      </Text>
    </View>
  );
}

export default index;
