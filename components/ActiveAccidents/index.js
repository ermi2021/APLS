import React, { useState, useEffect, useContext } from "react";
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
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import firebase from "firebase";
import { Avatar, Badge, Icon, withBadge, Overlay } from "react-native-elements";
const { width, height } = Dimensions.get("window");

function index({ navigation, route }) {
  const [activeAccidents, setActiveAccidents] = useState([]);
  const [loading, setLoading] = useState(false);
  function getActiveAccidents() {
    firebase
      .firestore()
      .collection("ActiveAccidents")
      .get()
      .then((item) => {
        const items = item.docs.map((doc) => doc.data());
        setActiveAccidents(items);
      });
  }

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          marginTop: 20,
          marginHorizontal: 15,
          backgroundColor: "#f6f6f6",
          elevation: 5,
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 10,
          paddingVertical: 20,
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
              style={{ height: 50, width: 50 }}
            />
            <View style={{ display: "flex", flexDirection: "column" }}>
              <Text style={{ fontSize: 13, fontWeight: "600" }}>
                From : {item.ReportedBy}
              </Text>

              <Text
                style={{
                  fontWeight: "600",
                  marginVertical: 5,
                  elevation: 10,
                }}
              >
                status: <Text style={{ fontWeight: "700" }}>{item.status}</Text>
              </Text>
            </View>
          </View>
          <Button
            title="Manage Fire"
            containerStyle={{ marginVertical: 10, elevation: 5 }}
            buttonStyle={{
              backgroundColor: "green",
              fontSize: 15,
              fontWeight: "700",
            }}
            onPress={() =>
              navigation.navigate("AccidentDetails", {
                id: item.id,
                ApprovedBy: item.ApprovedBy,
                ApprovedAt: item.ApprovedAt,
                Latitude: item.Latitude,
                Longtitude: item.Longtitude,
                ReportedBy: item.ReportedBy,
                ReportedAt: item.ReportedAt,
                Status: item.status,
              })
            }
          ></Button>
        </View>
      </View>
    );
  };
  useEffect(() => {
    getActiveAccidents();
  }, [activeAccidents]);

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
        <Text style={{ fontWeight: "700", fontSize: 16, marginHorizontal: 10 }}>
          Active Accidents
        </Text>
      </View>
      <View style={{ display: "flex", flexDirection: "column" }}>
        <Text
          style={{
            fontWeight: "700",
            marginLeft: 20,
            fontSize: 18,
            marginTop: 15,
            textAlignVertical: "center",
            marginLeft: 60,
          }}
        >
          Accidents Approved
        </Text>
        <Badge
          status="success"
          value={activeAccidents.length}
          badgeStyle={{
            width: 30,
            height: 30,
            fontSize: 13,
            borderRadius: 100,
            elevation: 5,
          }}
          textStyle={{
            fontSize: 21,
            fontWeight: "700",
          }}
          containerStyle={{
            position: "absolute",
            top: 15,
            right: 50,

            fontSize: 15,
          }}
        />
        <FlatList
          data={activeAccidents}
          style={{ height: height * 0.8 }}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}

export default index;
