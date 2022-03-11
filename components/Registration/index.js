import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FirebaseRecaptchaVerifierModal,
  FirebaseRecaptchaBanner,
} from "expo-firebase-recaptcha";

import firebase from "../../firebase";
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Clipboard,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";

import colors from "../../common/colors";
import OtpInputs from "react-native-otp-inputs";
import PhoneInput from "react-native-phone-number-input";
import TimerText from "./TimerText";
const { width, height } = Dimensions.get("window");
const RESEND_OTP_TIME_LIMIT = 60; // 60 secs
const AUTO_SUBMIT_OTP_TIME_LIMIT = 4; // 4 secs
let resendOtpTimerInterval;
function index({ navigation }, props) {
  const recaptchaVerifier = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [worButVisible, showWorkerLogBut] = useState(true);
  const [verificationId, setVerificationId] = useState(null);
  const [submitVisble, setSubmitVisible] = useState(true);
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const [verificationSent, setVerificationSent] = useState(false);
  const attemptInvisibleVerification = false;
  const phoneInput = useRef();
  const [formattedPhoneNumber, setFormattedValue] = useState("");

  //Otp States
  const [resendButtonDisabledTime, setResendButtonDisabledTime] = useState(
    RESEND_OTP_TIME_LIMIT
  );
  //OTP UseEffects & Functions
  useEffect(() => {
    if (verificationSent) {
      startResendOtpTimer();

      return () => {
        if (resendOtpTimerInterval) {
          clearInterval(resendOtpTimerInterval);
        }
      };
    }
  }, [verificationSent, resendButtonDisabledTime]);

  const startResendOtpTimer = () => {
    if (resendOtpTimerInterval) {
      clearInterval(resendOtpTimerInterval);
    }
    resendOtpTimerInterval = setInterval(() => {
      if (resendButtonDisabledTime <= 0) {
        clearInterval(resendOtpTimerInterval);
      } else {
        setResendButtonDisabledTime(resendButtonDisabledTime - 1);
      }
    }, 1000);
  };
  const onSubmitButtonPress = () => {
    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      code
    );
    firebase
      .auth()
      .signInWithCredential(credential)
      .then((result) => {
        // Do something with the results here
        console.warn(result);
        navigation.navigate("userHome");
      });
  };

  const sendVerification = () => {
    try {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      phoneProvider
        .verifyPhoneNumber(formattedPhoneNumber, recaptchaVerifier.current)
        .then(setVerificationId, setVerificationSent(true));
    } catch (err) {
      console.error(err);
      setVerificationSent(false);
    }
  };

  return (
    <View>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebase.app().options}
        attemptInvisibleVerification={attemptInvisibleVerification}
      />

      {!verificationSent && (
        <View style={{ marginHorizontal: 10, marginTop: width * 0.3 }}>
          <Text
            style={{
              marginTop: 20,
              fontWeight: "700",
              textAlign: "left",
              fontSize: 16,
            }}
          >
            Enter your phone number
          </Text>

          <PhoneInput
            ref={phoneInput}
            defaultValue={phoneNumber}
            defaultCode="ET"
            layout="first"
            placeholder="_ _ _ _ _ _ _ _ _"
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (phoneNumber.length == 8) {
                showWorkerLogBut(false);
                console.log(formattedPhoneNumber);
              }
            }}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            containerStyle={{
              width: width * 0.93,
              marginVertical: 15,
            }}
            withDarkTheme
            autoFocus
            textInputProps={{
              maxLength: 9,
            }}
          />

          <Button
            title="Next"
            disabled={worButVisible}
            onPress={sendVerification}
          />
          <View style={{ marginTop: width * 0.1, marginHorizontal: 10 }}>
            <Button
              title="Sign in as worker"
              type="outline"
              onPress={() => {
                navigation.navigate("workerLogin");
              }}
            />
          </View>
        </View>
      )}

      {verificationSent && (
        <View style={{ height: height, paddingVertical: height * 0.1 }}>
          <Image
            source={require("../../assets/otp_image.png")}
            style={{
              width: width * 0.5,
              height: height * 0.23,
              alignSelf: "center",
              borderRadius: 20,
            }}
          />
          <Text
            style={{
              textAlign: "center",
              marginVertical: 20,
              fontWeight: "700",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            Enter the code that sent to your Phone Number!
          </Text>

          <OtpInputs
            style={{
              height: 50,
              width: width,
              display: "flex",
              justifyContent: "space-around",
              flexDirection: "row",
              paddingHorizontal: 20,
            }}
            inputContainerStyles={{
              width: 50,
              height: 60,
            }}
            inputStyles={{
              padding: 15,
              backgroundColor: "#f6f6f6",
              borderRadius: 10,
              borderWidth: 1,
              fontSize: 16,
              fontWeight: "700",
              borderColor: "grey",
              textAlign: "center",
            }}
            handleChange={(code) => {
              setCode(code);
              if (code.length === 6) {
                setSubmitVisible(false);
              } else {
                setSubmitVisible(true);
              }
            }}
            numberOfInputs={6}
          />
          {resendButtonDisabledTime > 0 ? (
            <TimerText text={"Resend OTP in"} time={resendButtonDisabledTime} />
          ) : (
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
              <Text
                style={{
                  fontWeight: "700",
                  color: "blue",
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                Resend Otp
              </Text>
            </View>
          )}
          <View style={{ marginHorizontal: 20 }}>
            <Button
              title="submit"
              disabled={submitVisble}
              onPress={onSubmitButtonPress}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  borderStyleBase: {
    width: 30,
    height: 45,
  },

  borderStyleHighLighted: {
    borderColor: "#03DAC6",
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
  },

  underlineStyleHighLighted: {
    borderColor: "#03DAC6",
  },
  container: {
    padding: 16,
    marginVertical: height * 0.2,
    flex: 1,
  },
  submitButtonText: {
    color: colors.WHITE,
  },
  otpResendButton: {
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  otpResendButtonText: {
    color: "blue",
    textTransform: "none",
    textDecorationLine: "underline",
    marginVertical: 10,
  },
  otpText: {
    fontWeight: "bold",
    color: colors.BLUE,
    fontSize: 18,
    width: "100%",
  },
});

export default index;
