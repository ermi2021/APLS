import React, { useContext, useEffect, useState, useRef } from "react";
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
import * as Location from "expo-location";
import firebase from "firebase";
import { userContext } from "../userContext";
import { set } from "react-native-reanimated";
import { Entypo } from "@expo/vector-icons";
import { YellowBox } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import {
  Avatar,
  Badge,
  Icon,
  withBadge,
  Button,
  Overlay,
} from "react-native-elements";
const { height, width } = Dimensions.get("window");

function index({ navigation, route }) {
  const [workerlocation, setLocation] = useState(null);
  const { worker, setWorker } = useContext(userContext);
  // const [permission, askForPermission] = usePermissions(Permissions.NOTIFICATIONS, { ask: true });
  const employees = firebase.firestore().collection("Employees");
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const [helpRequests, setHelps] = useState([]);
  const [activeAccidents, setActiveAccidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [workerId, setWorkerId] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  // async function sendPushNotification(token) {
  //   const message = {
  //     to: token,
  //     sound: "default",
  //     title: "Original Title",
  //     body: "And here is the body!",
  //     data: { someData: "goes here" },
  //   };

  //   await fetch("https://exp.host/--/api/v2/push/send", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Accept-encoding": "gzip, deflate",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(message),
  //   });
  // }

  async function updateLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    let username = await AsyncStorage.getItem("username");
    let password = await AsyncStorage.getItem("password");
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: false,
      accuracy: 3,
    });
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.056,
      longitudeDelta: 0.056,
    });

    firebase
      .firestore()
      .collection("Employees")
      .where("UserName", "==", username)
      .where("Password", "==", password)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            //   console.warn(doc.id);

            employees
              .doc(doc.id)
              .set(
                {
                  Location: [
                    location.coords.latitude,
                    location.coords.longitude,
                  ],
                },
                { merge: true }
              )
              .then(() => {
                console.table(location.coords);
              })
              .catch((err) => {
                console.log(err);
              });
          });
        } else {
          console.warn("incorrect username or password");
        }
      })
      .catch((error) => {
        console.warn(error);
      });
  }

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = status;

      //If no existing permission, ask user for permission
      if (status !== "granted") {
        console.warn("ask permission...");
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }

      //If no permission,exit the function...
      if (finalStatus !== "granted") {
        console.warn("no permisionn granted");
        return;
      }

      // Get push notification token....
      let token = await (await Notifications.getExpoPushTokenAsync()).data;

      setToken(token);

      //Add token to firebase
      firebase
        .firestore()
        .collection("Employees")
        // .where("PhoneNumber", "==", "+251993588972")
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              // doc.data() is never undefined for query doc snapshots
              employees.doc(doc.id).update({
                TOKEN: token,
              });
            });
          } else {
            console.warn("can't find document");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })();
  }, [token]);
  async function getHelpRequests() {
    let id = await AsyncStorage.getItem("id");
    firebase
      .firestore()
      .collection("HelpRequests")
      .where("RequestedTo", "==", id)
      .get()
      .then((item) => {
        const items = item.docs.map((doc) => doc.data());
        setHelps(items);
      });
  }

  function getActiveAccidents() {
    firebase
      .firestore()
      .collection("ActiveAccidents")
      //.where("ApprovedBy", "==", workerId)
      .get()
      .then((item) => {
        const items = item.docs.map((doc) => doc.data());
        setActiveAccidents(items);
      });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateLocation();
    }, 20000);
    return () => clearInterval(interval);
  }, [workerlocation]);

  useEffect(() => {
    setLoading(true);
    getHelpRequests();
    getActiveAccidents();
    setLoading(false);
  }, [helpRequests]);

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          marginTop: 20,
          marginHorizontal: 5,
          backgroundColor: "#f6f6f6",
          elevation: 5,
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 10,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              paddingVertical: 10,
              justifyContent: "space-around",
              alignContent: "center",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            <Image
              source={require("../../assets/fire_gif.gif")}
              style={{ height: 50, width: 50, elevation: 5 }}
            />
            <View style={{ display: "flex", flexDirection: "column" }}>
              <Text style={{ fontSize: 13, fontWeight: "700" }}>
                From : {item.PhoneNumber}
              </Text>
            </View>
          </View>
          <Button
            title="View On Map"
            containerStyle={{ marginVertical: 10, elevation: 5 }}
            buttonStyle={{
              backgroundColor: "green",
              fontSize: 15,
              fontWeight: "700",
            }}
            raised
            onPress={() =>
              navigation.navigate("ShowOnMap", {
                Type: item.AccidentType,
                Token: item.Token,
                Time: item.Time,
                PhoneNumber: item.PhoneNumber,
                Latitude: item.Latitude,
                Longtitude: item.Longtitude,
                id: item.id,
              })
            }
          ></Button>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          height: height,
          width: width,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="orange" />
        <Text style={{ textAlign: "center", fontWeight: "700" }}>
          Loading....
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Overlay
        isVisible={visible}
        fullScreen
        overlayStyle={{
          height: height * 0.8,
          width: width * 0.95,
          elevation: 5,
        }}
        backdropStyle={{ backgroundColor: "grey", opacity: 0.9 }}
        onBackdropPress={toggleOverlay}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontWeight: "700",
              fontSize: 18,
              textDecorationLine: "underline",
              textDecorationColor: "green",
            }}
          >
            Help Requests
          </Text>
          <FlatList
            data={helpRequests}
            style={{ height: height * 0.8 }}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Overlay>
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
          Home
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: height * 0.9,
          alignItems: "center",
          backgroundColor: "",
          alignContent: "center",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            display: "flex",
            flexDirection: "column",

            justifyContent: "center",
            alignContent: "center",
            height: height * 0.9,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              backgroundColor: "white",
              width: width * 0.9,
              paddingVertical: 10,
              elevation: 10,
              height: height * 0.3,
              paddingHorizontal: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                textAlign: "left",
                fontWeight: "700",
                fontSize: 20,
                marginLeft: 15,
              }}
            >
              Help Requests
            </Text>
            <Badge
              status="error"
              value={helpRequests.length}
              badgeStyle={{
                width: 50,
                height: 50,
                fontSize: 22,
                borderRadius: 100,
                elevation: 5,
              }}
              textStyle={{
                fontSize: 21,
                fontWeight: "700",
              }}
              containerStyle={{
                position: "absolute",
                top: -20,
                right: 15,

                fontSize: 22,
              }}
            />
            <Text
              style={{
                width: "90%",
                marginTop: 22,
                marginVertical: 15,
                marginHorizontal: 15,
              }}
            >
              There are {helpRequests.length} help requests still waiting to get
              approved!!
            </Text>
            <Button
              title="Show Details"
              containerStyle={{ marginTop: 20 }}
              raised
              onPress={() => toggleOverlay()}
            ></Button>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "white",
              width: width * 0.9,
              paddingVertical: 10,
              elevation: 5,
              height: height * 0.3,
              paddingHorizontal: 10,
              borderRadius: 10,
              marginTop: StatusBar.currentHeight,
            }}
          >
            <Text
              style={{
                textAlign: "left",
                fontWeight: "700",
                fontSize: 20,
                marginLeft: 15,
              }}
            >
              Active Accidents
            </Text>
            <Badge
              status="error"
              value={activeAccidents.length}
              badgeStyle={{
                width: 50,
                height: 50,
                fontSize: 22,
                borderRadius: 100,
                elevation: 5,
              }}
              textStyle={{
                fontSize: 21,
                fontWeight: "700",
              }}
              containerStyle={{
                position: "absolute",
                top: -20,
                right: 15,

                fontSize: 22,
              }}
            />
            <Text
              style={{
                width: "90%",
                marginTop: 22,
                marginVertical: 15,
                marginHorizontal: 15,
              }}
            >
              There are {activeAccidents.length} help requests still waiting to
              get approved!!
            </Text>
            <Button
              title="Show Details"
              raised
              containerStyle={{ marginTop: 20 }}
              onPress={() => {
                navigation.navigate("ActiveAccidents");
              }}
            ></Button>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

export default index;
