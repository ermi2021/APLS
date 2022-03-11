import React, { useRef, useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import * as Location from "expo-location";
import Communcications from "react-native-communications";
import uuid from "react-native-uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import firebase from "firebase";
import { BottomSheet, ListItem } from "react-native-elements";
import { userContext } from "../userContext";
import Moment from "react-moment";
import "moment-timezone";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import {
  Avatar,
  Badge,
  Icon,
  withBadge,
  Button,
  Overlay,
} from "react-native-elements";
import { LogBox } from "react-native";

//Ignore log notification by message
LogBox.ignoreLogs(["Warning: ..."]);

//Ignore all log notifications
LogBox.ignoreAllLogs();
const { width, height } = Dimensions.get("window");
function index({ navigation, route }) {
  const { PhoneNumber, Latitude, Longtitude, Token, Time, Type, id } =
    route.params;
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setBottomVisible] = useState(false);
  const { worker, setWorker } = useContext(userContext);
  const [workerId, setWorkerId] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const map = useRef(null);
  const [region, setRegion] = useState({
    latitude: Latitude,
    longitude: Longtitude,
    latitudeDelta: 0.07,
    longitudeDelta: 0.07,
  });

  async function getLocation() {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: false,
    });
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.056,
      longitudeDelta: 0.056,
    });
    setLoading(false);
  }
  const getWorker = async () => {
    let id = await AsyncStorage.getItem("id");

    if (id != null) {
      setWorkerId(id);

      // setLoading(false);
    } else {
      setWorker(false);
      // setLoading(false);
    }
  };

  useEffect(() => {
    getWorker();
  }, []);
  const submitApprove = async () => {
    let workerid = await AsyncStorage.getItem("id");
    setLoading(true);
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    firebase
      .firestore()
      .collection("ActiveAccidents")
      .add({
        id: uuid.v4(),
        ReportedAt: Time,
        ReportedBy: PhoneNumber,
        ApprovedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ApprovedBy: workerid,
        Latitude: location.coords.latitude,
        Longtitude: location.coords.longitude,
        Type: Type,
        status: "hard",
      })
      .then(
        firebase
          .firestore()
          .collection("HelpRequests")
          .where("id", "==", id)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              firebase
                .firestore()
                .collection("HelpRequests")
                .doc(doc.id)
                .delete()
                .then(() => {
                  sendPushNotification(Token);
                  setBottomVisible(true);
                  setLoading(false);
                })
                .catch(setLoading(false));
            });
          })
          .catch((err) => {
            console.log(err);
          })
      )

      .catch((err) => {
        console.warn(err);
      });
  };

  async function sendPushNotification(token) {
    const message = {
      to: token,
      sound: "default",
      title: "Your Request is approved!!!!",
      body: "Firefighters appreoved your request you can view while they are approacing on your map",
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }

  const submitApproveAlert = async () => {
    Alert.alert("Are You Sure?", "you are about to approve this request", [
      {
        text: "Continue",
        onPress: () => {
          submitApprove();
        },
        style: "default",
      },
      { text: "Cancel", onPress: () => console.log("OK Pressed") },
    ]);
  };
  const DrawPolyLine = () => {
    return (
      <Polyline
        coordinates={[
          {
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
          { latitude: Latitude, longitude: Longtitude },
        ]}
        strokeColor="green" // fallback for when `strokeColors` is not supported by the map-provider
        strokeColors={[
          "#7F0000",
          "#00000000", // no color, creates a "long" gradient between the previous and next coordinate
          "#B24112",
          "#E5845C",
          "#238C23",
          "#7F0000",
        ]}
        strokeWidth={3}
      />
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

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
      <BottomSheet
        isVisible={isVisible}
        containerStyle={{
          backgroundColor: "rgba(0.5, 0.25, 0, 0.2)",
          height: height * 0.4,
        }}
      >
        <ListItem>
          <Text style={{ fontWeight: "700", fontSize: 22, color: "green" }}>
            Approved!!!
          </Text>
        </ListItem>

        <ListItem>
          <Text
            style={{ textAlign: "justify", fontWeight: "700", fontSize: 12 }}
          >
            You have successfully approved this accident,Click below to go
            active accidents for managing the situation!!
          </Text>
        </ListItem>
        <ListItem>
          <Button
            containerStyle={{ width: "100%", elevation: 5 }}
            buttonStyle={{ width: "100%", backgroundColor: "green" }}
            title="Active Accidents"
            onPress={() => {
              navigation.navigate("ActiveAccidents");
            }}
          />
        </ListItem>
      </BottomSheet>
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
          Help Request on a map
        </Text>
      </View>
      <ScrollView>
        <View
          style={{
            height: height * 0.7,
            backgroundColor: "red",
            marginHorizontal: 10,
            marginTop: 10,
            marginBottom: 5,
            elevation: 3,
            backgroundColor: "#f6f6f6",
          }}
        >
          <MapView
            ref={map}
            showsUserLocation={true}
            showsMyLocationButton={true}
            initialRegion={region}
            showCompass={true}
            rotateEnabled={true}
            style={{
              alignSelf: "center",
              backgroundColor: "white",
              width: width * 0.95,
              height: height * 0.7,
              marginVertical: 15,
              elevation: 5,
            }}
          >
            <Marker
              // title={ff.FirstName + " " + ff.MiddleName}
              coordinate={{
                latitude: Latitude,
                longitude: Longtitude,
              }}
            >
              <Image
                source={require("../../assets/fire_gif.gif")}
                style={{ height: 50, width: 50 }}
              />
            </Marker>
            <DrawPolyLine />
          </MapView>
        </View>
        <View
          style={{
            height: height * 0.2,
            elevation: 3,
            marginHorizontal: 10,
            marginBottom: 10,

            display: "flex",

            flexDirection: "column",

            paddingHorizontal: 10,
          }}
        >
          <Button
            title={"Call " + PhoneNumber}
            onPress={() => {
              Communcications.phonecall(PhoneNumber, false);
            }}
            containerStyle={{ backgroundColor: "green", marginTop: 20 }}
            raised
          ></Button>

          <Button
            title="Approve Accident"
            buttonStyle={{ backgroundColor: "green" }}
            containerStyle={{ backgroundColor: "green", marginTop: 20 }}
            raised
            onPress={() => {
              submitApproveAlert();
            }}
          ></Button>
        </View>
      </ScrollView>
    </View>
  );
}

export default index;
