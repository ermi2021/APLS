import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Dimensions,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Input, Button } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { height, width } = Dimensions.get("window");
function index({ navigation, route }) {
  const [fname, setFname] = useState(null);
  const [mname, setMname] = useState(null);
  const [lname, setLname] = useState(null);
  const [profileUrl, setProfile] = useState(null);
  const [username, setUserName] = useState(null);
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const getWorker = async () => {
    setLoading(true);
    let workerId = await AsyncStorage.getItem("id");
    let value = await AsyncStorage.getItem("username");
    let fname = await AsyncStorage.getItem("firstname");
    let mname = await AsyncStorage.getItem("middlename");
    let lname = await AsyncStorage.getItem("lastname");
    let profilePicture = await AsyncStorage.getItem("profilepicture");
    let password = await AsyncStorage.getItem("password");

    if (value != null) {
      setUserName(value);
      setFname(fname);
      setMname(mname);
      setPassword(password);
      setLname(lname);
      setProfile(profilePicture);
      setLoading(false);
    } else {
      console.log("error");
      setLoading(false);
    }
  };

  const update = async () => {
    setLoading(true);
    firebase
      .firestore()
      .collection("Employees")
      .where("id", "==", workerId)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            //   console.warn(doc.id);
            firebase
              .firestore()
              .collection("Employees")
              .doc(doc.id)
              .set(
                {
                  FirstName: fname,
                  LastName: lname,
                  MiddleName: mname,
                  UserName: username,
                  Password: password,
                },
                { merge: true }
              )
              .then(() => {
                navigation.navigate("Home");
                setLoading(false);
              })
              .catch((err) => {
                console.log(err);
                setLoading(false);
              });
          });
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getWorker();
  }, []);

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
    <View>
      <View
        style={{
          height: height * 0.07,
          backgroundColor: "white",
          marginTop: StatusBar.currentHeight,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          paddingHorizontal: 10,
          alignItems: "center",
        }}
      >
        <Entypo
          name="menu"
          size={35}
          onPress={() => {
            navigation.openDrawer();
          }}
        />
        <Text style={{ fontWeight: "600", fontSize: 16, marginHorizontal: 10 }}>
          Profile
        </Text>
      </View>
      <View>
        <Image
          source={{ uri: profileUrl }}
          style={{ height: 120, width: width }}
        />
        <View style={{ marginHorizontal: 20 }}>
          <Input
            placeholder="First Name"
            onChangeText={(text) => setFname(text)}
            value={fname}
            style={{ fontSize: 16, color: "black" }}
          />
          <Input
            placeholder="Middle Name"
            onChangeText={(text) => setMname(text)}
            value={mname}
            style={{ fontSize: 16, color: "black" }}
          />
          <Input
            placeholder="Last Name"
            onChangeText={(text) => setLname(text)}
            value={lname}
            style={{ fontSize: 16, color: "black" }}
          />
          <Input
            placeholder="Middle Name"
            onChangeText={(text) => setMname(text)}
            value={mname}
            style={{ fontSize: 16, color: "black" }}
          />
          <Input
            placeholder="UserName"
            onChangeText={(text) => setUserName(text)}
            value={username}
            style={{ fontSize: 16, color: "black" }}
          />
          <Input
            placeholder="password"
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            value={password}
            style={{ fontSize: 16, color: "black", marginVertical: -10 }}
          />
          <Button
            title="Update"
            style={{ marginVertical: 20, marginHorizontal: 20 }}
            buttonStyle={{ backgroundColor: "green" }}
            onPress={() => {
              update();
            }}
          />
        </View>
        {/* 
      <Input
        placeholder="password"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
        value={password}
        style={{ fontSize: 16, color: "black", marginVertical: -10 }}
      /> */}
      </View>
    </View>
  );
}

export default index;
