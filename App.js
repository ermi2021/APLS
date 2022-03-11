import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Button,
  Alert,
  Switch,
  ActivityIndicator,
  Linking,
} from "react-native";
import Registration from "./components/Registration";

import workerLogin from "./components/workerLogin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firefighters from "./components/firefighters";
import WorkerHome from "./components/WorkerHome";
import ShowOnMap from "./components/ShowOnMap";
import ActiveAccidents from "./components/ActiveAccidents";
import AccidentDetails from "./components/AccidentDetails";
import WorkerUpdate from "./components/WorkerUpdate";
import DrawerContent from "./components/WorkerHome/DrawerContent";
import { NavigationHelpersContext } from "@react-navigation/native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DrawerHeader from "./components/DrawerHeader";
import { useNavigation } from "@react-navigation/native";

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

import {
  MaterialIcons,
  Fontisto,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const { height, width } = Dimensions.get("window");
import firebase from "./firebase";
import { backgroundColor } from "styled-system";
import { TouchableOpacity } from "react-native";
export default function App() {
  const [isAuthenticated, setAuthenticated] = useState();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [worker, setWorker] = useState(false);
  const [fname, setFname] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const logout = () => {
    firebase.auth().signOut();
  };

  const logoutWorker = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log("error while logging out");
    }
  };

  const getWorker = async () => {
    setLoading(true);
    let value = await AsyncStorage.getItem("username");
    let fname = await AsyncStorage.getItem("firstname");
    if (value != null) {
      setWorker(true);
      setFname(fname);
      setLoading(false);
    } else {
      setWorker(false);
      setLoading(false);
    }
  };
  useEffect(() => {
    getWorker();
  }, [worker]);

  useEffect(() => {
    setLoading(true);

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, []);

  const updateWorker = (workerr) => {
    setWorker(workerr);
  };

  function TabRoutes() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Fire Fighters"
          component={firefighters}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <MaterialIcons
                name="local-fire-department"
                size={18}
                color={focused ? "red" : "black"}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }
  const logoutAlert = async () => {
    Alert.alert("Are You Sure?", "you are about to logout!!", [
      {
        text: "Continue",
        onPress: () => {
          logout();
        },
        style: "default",
      },
      { text: "Cancel", onPress: () => console.log("OK Pressed") },
    ]);
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

  function UserDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <View>
          <View style={{ height: height * 0.9 }}>
            <View
              style={{ height: height * 0.2, backgroundColor: "#f6f6f6" }}
            ></View>
            <View
              style={{
                marginHorizontal: 15,
                marginVertical: height * 0.1,
              }}
            >
              <Button
                title="Log Out"
                onPress={() => {
                  logoutAlert();
                }}
              />
            </View>
            {/* <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={() => {
                setIsEnabled(!isEnabled);
              }}
              value={isEnabled}
            /> */}
          </View>
        </View>
      </DrawerContentScrollView>
    );
  }

  function WorkerDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <View>
          <View style={{ height: height * 0.9 }}>
            <View
              style={{ height: height * 0.2, backgroundColor: "#f6f6f6" }}
            ></View>
            <DrawerContent />
          </View>
        </View>
      </DrawerContentScrollView>
    );
  }

  function drawerRoutes() {
    return (
      <Drawer.Navigator
        drawerType="front"
        initialRouteName="Home"
        drawerContent={(props) => <UserDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="Home"
          component={TabRoutes}
          options={{
            headerTitle: <Header title="Home" />,
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    );
  }

  function workerRoutes() {
    return (
      <Drawer.Navigator
        drawerType="front"
        initialRouteName="WorkerHome"
        drawerContent={(props) => <WorkerDrawerContent {...props} />}
      >
        <Drawer.Screen name="Home" component={WorkerHome} />
        <Drawer.Screen name="workerupdate" component={WorkerUpdate} />
        <Drawer.Screen name="ShowOnMap" component={ShowOnMap} />
        <Drawer.Screen name="ActiveAccidents" component={ActiveAccidents} />
        <Drawer.Screen name="AccidentDetails" component={AccidentDetails} />
      </Drawer.Navigator>
    );
  }

  function Header(props) {
    const head_title = props.title;
    return (
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Entypo name="menu" size={30} />
        <Text style={{ marginHorizontal: 10, fontWeight: "700", fontSize: 16 }}>
          {head_title}
        </Text>
      </View>
    );
  }

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
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="W_HOME"
            component={workerRoutes}
            options={{
              headerTitle: <Header title="Home" />,
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="worker_update"
            component={WorkerUpdate}
            options={{
              headerTitle: <Header title="Profle" />,
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user == null ? (
          <>
            <Stack.Screen
              name="registration"
              component={Registration}
              options={{
                title: "welcome",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="workerLogin"
              component={workerLogin}
              options={{ title: "Login" }}
            />
            <Stack.Screen
              name="W_HOME"
              component={workerRoutes}
              options={{
                headerTitle: <Header title="Home" />,
                headerShown: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={drawerRoutes}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
