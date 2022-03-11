import React from "react";
import { StatusBar, SafeAreaView } from "react-native";

import { GenericStyles } from "../components/Registration/styles/GenericStyles";

const CustomScreenContainer = (props) => {
  const { children } = props;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={GenericStyles.whiteBackgroundContainer}>
        {children}
      </SafeAreaView>
    </>
  );
};

export default CustomScreenContainer;
