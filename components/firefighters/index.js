import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CurrentLocationButton } from "../CurrentLocationButton";
import HelpmeButton from "../HelpmeButton";
import Firefighter from "./Firefighter";
import MapView, { Callout, Marker } from "react-native-maps";
import firebase from "../../firebase";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { styles } from "./styles";
import { DarkTheme, useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";
import TimerText from "../Registration/TimerText";
import { BottomSheet, ListItem, Button } from "react-native-elements";
//import styles from "./styles";
import { Entypo } from "@expo/vector-icons";

import Communcications from "react-native-communications";
const { width, height } = Dimensions.get("window");
const RESEND_OTP_TIME_LIMIT = 30; // 60 secs
// import { YellowBox } from "react-native";
// const ASPECT_RATIO = width / height;
let resendOtpTimerInterval;
function index() {
  const navigation = useNavigation();
  const map = useRef(null);
  const [worker, setWorker] = useState([]);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const [isBotVisible, setBottomVisble] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [visbleTimer, setTimerVisible] = useState(false);
  const list = [
    { title: "List Item 1" },
    { title: "List Item 2" },
    {
      title: "Cancel",
      containerStyle: { backgroundColor: "red" },
      titleStyle: { color: "white" },
      onPress: () => setIsVisible(false),
    },
  ];
  let user = firebase.auth().currentUser;
  let firefighters = [];

  const [resendButtonDisabledTime, setResendButtonDisabledTime] = useState(
    RESEND_OTP_TIME_LIMIT
  );

  const startResendOtpTimer = () => {
    if (resendOtpTimerInterval) {
      clearInterval(resendOtpTimerInterval);
    }
    resendOtpTimerInterval = setInterval(() => {
      if (resendButtonDisabledTime <= 0) {
        clearInterval(resendOtpTimerInterval);
        setTimerVisible(false);
      } else {
        setResendButtonDisabledTime(resendButtonDisabledTime - 1);
      }
    }, 1000);
  };

  async function sendPushNotification(token) {
    console.log(token);
    const message = {
      to: token,
      sound: "default",
      title: "Emergency Alert!!!",
      body: "You have recieved a help Request",
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

    Alert.alert(
      "Sent Successfully",
      "You will recieve feedback from the selected firefighter in 30 seconds else its recommend of switching to other firefighter!!!",
      [
        {
          text: "ok",
          style: "cancel",
          onPress: () => {
            setResendButtonDisabledTime(30);
            setTimerVisible(true);
            startResendOtpTimer();
          },
        },
      ]
    );
  }
  useEffect(() => {
    if (visbleTimer) {
      startResendOtpTimer();

      return () => {
        if (resendOtpTimerInterval) {
          clearInterval(resendOtpTimerInterval);
        }
      };
    }
  }, [resendButtonDisabledTime]);
  useEffect(() => {
    setLoading(true);
    firebase
      .firestore()
      .collection("Employees")
      .where("Role", "==", "FireFighter")
      .where("active", "==", true)
      .onSnapshot((querySnapShot) => {
        const data = [];
        querySnapShot.forEach((doc) => {
          data.push({
            ...doc.data(),
            key: doc.id,
          });
        });
        setWorker(data);
        setLoading(false);
      });
  }, []);

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
      console.warn(token);
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          enableHighAccuracy: true,
        });
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        });
        setLocation(location);
      } catch (error) {
        let status = Location.getProviderStatusAsync;
      }
    })();
  }, [region]);

  const submitHelp = async (token, id) => {
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    firebase
      .firestore()
      .collection("HelpRequests")
      .add({
        id: uuid.v4(),
        Time: firebase.firestore.FieldValue.serverTimestamp(),
        Latitude: location.coords.latitude,
        Longtitude: location.coords.longitude,
        AccidentType: "Fire",
        RequestedTo: id,
        PhoneNumber: user.phoneNumber,
      })
      .then(console.log("inserted successfully"), sendPushNotification(token))
      .catch((err) => {
        console.log(err);
      });
  };

  const call = (pn) => {
    Communcications.phonecall(pn, false);
  };
  const callandNotifyalert = (token, pn, id) =>
    Alert.alert("How to contact", "call or send notifcation?", [
      {
        text: "call",
        onPress: () => {
          call(pn);
        },
      },
      {
        text: "Send Notification",

        onPress: () => {
          submitHelp(token, id);
        },
      },
      {
        text: "cancel",
        style: "cancel",
      },
    ]);
  const centerMap = () => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    map.current.animateToRegion({
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    });
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
  if (worker) {
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
          <Text
            style={{ fontWeight: "700", fontSize: 16, marginHorizontal: 10 }}
          >
            Home
          </Text>
        </View>
        {visbleTimer && (
          <TimerText
            text={"Will Respond In : "}
            time={resendButtonDisabledTime}
          />
        )}

        <Text
          style={{
            fontWeight: "700",
            fontSize: 16,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Fire Fighters Around You!!
        </Text>
        <CurrentLocationButton
          cb={() => {
            centerMap();
          }}
          bottom="100"
        />

        <MapView
          ref={map}
          initialRegion={region}
          showCompass={true}
          showsUserLocation={true}
          rotateEnabled={true}
          style={{
            alignSelf: "center",
            backgroundColor: "white",
            width: width * 0.95,
            height: height * 0.76,
            marginVertical: 15,
            elevation: 5,
          }}
        >
          {worker.map((ff) => (
            <View>
              <Marker
                pinColor="red"
                // title={ff.FirstName + " " + ff.MiddleName}
                coordinate={{
                  latitude: ff.Location[0],
                  longitude: ff.Location[1],
                }}
              >
                <Callout
                  tooltip
                  onPress={() => {
                    callandNotifyalert(ff.TOKEN, ff.PhoneNumber, ff.id);
                  }}
                >
                  <View
                    style={{
                      width: 200,
                      borderRadius: 20,
                      elevation: 30,
                      display: "flex",
                      flexDirection: "column",
                      // alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "white",
                      marginBottom: 10,
                      paddingHorizontal: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ textAlign: "center", marginBottom: 10 }}>
                      <Image
                        source={require("../../assets/firefightericon.png")}
                        style={{
                          width: 50,
                          height: 78,
                          marginBottom: 15,
                          backgroundColor: "red",
                        }}
                        resizeMode="contain"
                      />
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "600",
                        marginVertical: 10,
                      }}
                    >
                      {ff.FirstName + " " + ff.MiddleName + " " + ff.LastName}
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "600",
                        marginVertical: 10,
                      }}
                    >
                      {ff.Role}
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "700",
                        marginVertical: 10,
                        marginVertical: 10,
                      }}
                    >
                      {ff.PhoneNumber}
                    </Text>
                    <Button
                      title="contact"
                      style={{ backgroundColor: "green", marginBottom: 20 }}
                      buttonStyle={{ backgroundColor: "green" }}
                      containerStyle={{ marginBottom: 20 }}
                    />
                  </View>
                </Callout>
              </Marker>
            </View>
          ))}
        </MapView>
      </View>
    );
  }
  if (!worker) {
    return (
      <View>
        <Text>Nothing</Text>
      </View>
    );
  }
}

export default index;
