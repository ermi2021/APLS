import React, { useRef, useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Button,
  Picker,
} from "react-native";
import uuid from "react-native-uuid";
import * as Location from "expo-location";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import firebase from "firebase";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import { Avatar, Badge, Icon, withBadge, Overlay } from "react-native-elements";
import NumericInput from "react-native-numeric-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LogBox } from "react-native";
import { FirebaseRecaptchaBanner } from "expo-firebase-recaptcha";
import AsyncStorage from "@react-native-async-storage/async-storage";
// // Ignore log notification by message
// LogBox.ignoreLogs(["Warning: ..."]);

// //Ignore all log notifications
// LogBox.ignoreAllLogs();
const { width, height } = Dimensions.get("window");

function index({ navigation, route }) {
  const {
    ApprovedBy,
    ApprovedAt,
    Latitude,
    Longtitude,
    ReportedAt,
    ReportedBy,
    Status,
    id,
  } = route.params;
  const map = useRef(null);
  const [workerlocation, setLocation] = useState(null);
  const [updateVisible, setVisible] = useState(false);
  const [confirmResourcesVisible, setConfirmVisible] = useState(false);
  const [requestVisible, setreqVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestSubmitted, setSubmmited] = useState(false);
  const [resourceRequest, setResourceRequest] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedRequest, setRequestID] = useState("");
  //const [selectedResources, setSelectedResources] = useState([]);
  let selectedResources = [];
  const [value, setValue] = useState();
  const activeAccidents = firebase.firestore().collection("ActiveAccidents");
  const [selectedValue, setSelectedValue] = useState("red");
  const [requestContent, setRequestContent] = useState("");
  const [approvedRequests, setApprovedResources] = useState([]);
  let workerId = "";
  const [region, setRegion] = useState({
    latitude: Latitude,
    longitude: Longtitude,
    latitudeDelta: 0.07,
    longitudeDelta: 0.07,
  });
  const toggleOverlay = () => {
    setVisible(!updateVisible);
  };

  const toggleRequestOverlay = () => {
    setreqVisible(!requestVisible);
  };
  const toggleConfirmOverlay = () => {
    setConfirmVisible(!confirmResourcesVisible);
  };
  const submitUpdate = async () => {
    setLoading(true);
    firebase
      .firestore()
      .collection("ActiveAccidents")
      .where("id", "==", id)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            //   console.warn(doc.id);

            activeAccidents
              .doc(doc.id)
              .set(
                {
                  status: selectedValue,
                },
                { merge: true }
              )
              .then(() => {
                navigation.navigate("ActiveAccidents");
                setLoading(false);
              })
              .catch((err) => {
                console.log(err);
                setLoading(false);
              });
          });
        }
      });
  };

  async function getApprovedResources() {
    let workerId = await AsyncStorage.getItem("id");
    firebase
      .firestore()
      .collection("ResourceRequests")
      .where("requestedBy", "==", workerId)
      .where("accidentId", "==", id)
      .where("status", "==", "approved")
      .get()
      .then((item) => {
        const items = item.docs.map((doc) => doc.data());
        setApprovedResources(items);
      });
  }
  useEffect(() => {
    firebase
      .firestore()
      .collection("Resources")
      .get()
      .then((item) => {
        const items = item.docs.map((doc) => doc.data());
        setResources(items);
      });
  }, [resources]);

  useEffect(() => {
    setResourceRequest([]);
  }, []);

  useEffect(() => {
    getApprovedResources();
  }, [approvedRequests]);

  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
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
    });
  }

  useEffect(() => {
    getLocation();
  }, [workerlocation]);

  const onRequestValueChange = (name, value) => {
    var exist = false;
    //let exists = resourceRequest.includes(name);

    for (var i = 0; i < resourceRequest.length; i++) {
      var resource = resourceRequest[i].resource;
      if (resource == name) {
        exist = true;
        break;
      }
    }

    if (exist) {
      console.log("exisits");
      let requestIndex = resourceRequest.findIndex(
        (obj) => obj.resource == name
      );
      resourceRequest[requestIndex].quantity = value;
    } else {
      console.log("new resource");
      setResourceRequest([
        ...resourceRequest,
        {
          resource: name,
          quantity: value,
        },
      ]);
    }
    console.log(resourceRequest);
  };
  const submitStatusAlert = async () => {
    Alert.alert(
      "Are You Sure?",
      "you are about to update the status of this accident!!",
      [
        {
          text: "Continue",
          onPress: () => {
            submitUpdate();
          },
          style: "default",
        },
        { text: "Cancel", onPress: () => console.log("OK Pressed") },
      ]
    );
  };

  const closeCase = async () => {
    setLoading(true);
    firebase
      .firestore()
      .collection("ClosedCases")
      .add({
        accidentId: id,
        closedBy: ApprovedBy,
        closedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(
        firebase
          .firestore()
          .collection("ActiveAccidents")

          .where("id", "==", id)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              firebase
                .firestore()
                .collection("ActiveAccidents")
                .doc(doc.id)
                .delete()
                .then(() => {
                  navigation.navigate("Home");
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
        console.log(err);
      });
  };

  const closeCaseAlert = async () => {
    Alert.alert(
      "Are You Sure?",
      "you are about to close this case meaning the accident will be removed from active accidents & will be reported as controlled.",
      [
        {
          text: "Continue",
          onPress: () => {
            closeCase();
          },
          style: "default",
        },
        { text: "Cancel", onPress: () => console.log("OK Pressed") },
      ]
    );
  };

  const submitRequest = async () => {
    setLoading(true);
    let workerId = await AsyncStorage.getItem("id");
    firebase
      .firestore()
      .collection("ResourceRequests")
      .add({
        requestId: uuid.v4(),
        accidentId: id,
        requestedBy: workerId,
        requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
        requests: resourceRequest,
        requestLocation: workerlocation,
        status: "pending",
      })
      .then(() => {
        setLoading(false),
          setValue(0),
          setreqVisible(false),
          setConfirmVisible(false),
          setSubmmited(true);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setValue(0);
        setConfirmVisible(false);
      });
  };

  const renderResourceRequestItem = ({ item }) => {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: "600", textAlign: "center" }}>
          {item.quantity} X {item.resource}
        </Text>
      </View>
    );
  };
  const renderResourseItem = ({ item }) => {
    return (
      <View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 10,
            marginVertical: 10,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 14 }}>{item.name}</Text>
          <Text style={{ fontWeight: "700", fontSize: 10 }}>X</Text>
          <NumericInput
            value={value}
            minValue={0}
            maxValue={10}
            onChange={(value) => {
              console.log(value);
              setValue({ value });
              onRequestValueChange(item.name, value);
            }}
            onLimitReached={(isMax, msg) => console.log(isMax, msg)}
            totalWidth={120}
            totalHeight={43}
            iconSize={25}
            step={1}
            valueType="real"
            textColor="black"
            editable={false}
            iconStyle={{ color: "black", fontWeight: "700" }}
            rightButtonBackgroundColor="#f6f6f6"
            leftButtonBackgroundColor="#f6f6f6"
          />
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
        isVisible={confirmResourcesVisible}
        fullScreen
        overlayStyle={{
          height: height * 0.2,
          width: width * 0.8,
          elevation: 5,
        }}
        backdropStyle={{ backgroundColor: "grey", opacity: 0.9 }}
        onBackdropPress={toggleConfirmOverlay}
      >
        <View>
          <Text
            style={{ textAlign: "center", fontWeight: "700", fontSize: 12 }}
          >
            Are you sure you are about to request the following resources?
          </Text>
          <FlatList
            data={resourceRequest}
            renderItem={renderResourceRequestItem}
            keyExtractor={(item) => item.id}
          />
          <Button
            title="Submit"
            containerStyle={{
              marginTop: 130,
              elevation: 5,
              width: width * 0.7,
              backgroundColor: "green",
            }}
            buttonStyle={{
              marginTop: 130,
              backgroundColor: "green",
              fontSize: 15,
              fontWeight: "700",
              marginHorizontal: 10,
            }}
            style={{
              backgroundColor: "green",
            }}
            raised
            onPress={() => {
              submitRequest();
            }}
          ></Button>
        </View>
      </Overlay>

      <Overlay
        isVisible={updateVisible}
        fullScreen
        overlayStyle={{
          height: height * 0.36,
          width: width * 0.8,
          elevation: 5,
        }}
        backdropStyle={{ backgroundColor: "grey", opacity: 0.9 }}
        onBackdropPress={toggleOverlay}
      >
        <View>
          <Text style={{ textAlign: "left", fontWeight: "700", fontSize: 18 }}>
            Update Status
          </Text>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                textAlign: "left",
                fontWeight: "600",
                marginVertical: 25,
                fontSize: 16,
              }}
            >
              Current Status : {Status}
            </Text>
          </View>
          <Text
            style={{
              textAlign: "left",
              fontWeight: "700",

              fontSize: 16,
            }}
          >
            Update To:
          </Text>
          <Picker
            selectedValue={selectedValue}
            mode="dropdown"
            style={{
              height: 50,
              width: width * 0.8,
              marginVertical: 10,
            }}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedValue(itemValue)
            }
          >
            <Picker.Item label="Hard" value="hard" />
            <Picker.Item label="Being Controlled" value="Being Controlled" />
            <Picker.Item label="Controlled" value="Controlled" />
          </Picker>
        </View>
        <Button
          title="Submit"
          containerStyle={{
            marginTop: 130,
            elevation: 5,
            width: width * 0.7,

            backgroundColor: "green",
          }}
          buttonStyle={{
            marginTop: 200,
            backgroundColor: "green",
            fontSize: 15,
            fontWeight: "700",
            marginHorizontal: 10,
          }}
          style={{
            backgroundColor: "green",
          }}
          raised
          onPress={() => {
            submitStatusAlert();
          }}
        ></Button>
      </Overlay>

      <Overlay
        isVisible={requestVisible}
        fullScreen
        overlayStyle={{
          height: height * 0.8,
          width: width * 0.9,
          elevation: 5,
        }}
        backdropStyle={{ backgroundColor: "grey", opacity: 0.9 }}
        onBackdropPress={toggleRequestOverlay}
      >
        <View>
          <Text
            style={{
              textDecorationLine: "underline",
              fontWeight: "700",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Resource Request Form
          </Text>
          <FlatList
            data={resources}
            style={{ height: height * 0.7 }}
            renderItem={renderResourseItem}
            keyExtractor={(item) => item.id}
          />
          <Button
            title="Submit"
            containerStyle={{
              elevation: 5,
              width: width * 0.7,
              backgroundColor: "green",
            }}
            buttonStyle={{
              backgroundColor: "green",
              fontSize: 15,
              fontWeight: "700",
              marginHorizontal: 10,
            }}
            style={{
              backgroundColor: "green",
            }}
            raised
            onPress={() => {
              setConfirmVisible(true);
              setreqVisible(false);
              setVisible(false);
            }}
          ></Button>
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
          paddingHorizontal: 20,
          alignItems: "center",
          zIndex: 10,
          position: "relative",
        }}
      >
        <Ionicons
          name="arrow-back"
          size={30}
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Text style={{ fontWeight: "600", fontSize: 16, marginHorizontal: 10 }}>
          Accident Details
        </Text>
      </View>

      <View style={{ height: 50, backgroundColor: "#f6f6f6" }}>
        <Text
          style={{
            fontWeight: "700",
            textAlign: "right",
            marginTop: 20,
            marginRight: 30,
            color: "red",
          }}
        >
          Resources Approved {approvedRequests.length}
        </Text>
      </View>

      <MapView
        ref={map}
        initialRegion={region}
        showCompass={true}
        rotateEnabled={true}
        style={{
          alignSelf: "center",
          backgroundColor: "white",
          width: width,
          height: height * 0.35,
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
      </MapView>
      <View
        style={{
          width: width * 0.9,
          height: height * 0.15,
          elevation: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          //   alignContent: "center",
          //   alignItems: "center",
          backgroundColor: "#f6f6f6",
          alignSelf: "center",
          marginVertical: 10,
        }}
      >
        <Text
          style={{
            fontWeight: "700",
            marginVertical: 10,
            elevation: 10,
            textAlign: "center",
          }}
        >
          Status:{Status}
        </Text>
        <Button
          title="Change Status"
          containerStyle={{
            marginTop: 10,
            elevation: 5,
            width: width * 0.7,
            backgroundColor: "green",
          }}
          buttonStyle={{
            backgroundColor: "green",
            fontSize: 15,
            fontWeight: "700",
            marginHorizontal: 10,
          }}
          raised
          onPress={() => {
            // navigation.navigate("AccidentDetails", {
            //   ApprovedBy: item.ApprovedBy,
            //   ApprovedAt: item.ApprovedAt,
            //   Latitude: item.Latitude,
            //   Longtitude: item.Longtitude,
            //   ReportedBy: item.ReportedBy,
            //   ReportedAt: item.ReportedAt,
            //   Status: item.Status,
            // })
            toggleOverlay();
          }}
        ></Button>
      </View>

      <View
        style={{
          width: width * 0.9,
          height: height * 0.15,
          elevation: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          //   alignContent: "center",
          //   alignItems: "center",
          backgroundColor: "#f6f6f6",
          alignSelf: "center",
          marginVertical: 10,
        }}
      >
        <Text
          style={{
            fontWeight: "700",
            marginVertical: 10,
            elevation: 10,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          Need More Prevention Tools/Equipments?
        </Text>
        <Button
          title="Request Resources"
          containerStyle={{
            marginTop: 10,
            elevation: 5,
            width: width * 0.7,
            backgroundColor: "green",
          }}
          buttonStyle={{
            backgroundColor: "green",
            fontSize: 15,
            fontWeight: "700",
            marginHorizontal: 10,
          }}
          raised
          onPress={() => {
            toggleRequestOverlay();
          }}
        ></Button>
      </View>
      <View
        style={{
          width: width * 0.9,
          height: height * 0.15,
          elevation: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          //   alignContent: "center",
          //   alignItems: "center",
          backgroundColor: "#f6f6f6",
          alignSelf: "center",
          marginVertical: 10,
        }}
      >
        <Button
          title="Close Case"
          containerStyle={{
            marginTop: 10,
            elevation: 5,
            width: width * 0.7,
            backgroundColor: "red",
          }}
          buttonStyle={{
            backgroundColor: "red",
            fontSize: 15,
            fontWeight: "700",
            marginHorizontal: 10,
          }}
          raised
          onPress={() => {
            closeCaseAlert();
          }}
        ></Button>
      </View>
    </View>
  );
}

export default index;
