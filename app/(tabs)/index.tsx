import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const appState = useRef(AppState.currentState);
  const [lockDuration, setLockDuration] = useState<number | null>(null);

  // useEffect(() => {
  //   const subscription = AppState.addEventListener("change", (nextAppState) => {
  //     if (
  //       appState.current === "active" &&
  //       nextAppState.match(/inactive|background/)
  //     ) {
  //       // App going to background
  //       const currentTime = Date.now().toString();
  //       AsyncStorage.setItem("lastInactiveTime", currentTime);
  //     }

  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       nextAppState === "active"
  //     ) {
  //       // App coming back to foreground
  //       AsyncStorage.getItem("lastInactiveTime").then((storedTime) => {
  //         if (storedTime) {
  //           const diff = Date.now() - parseInt(storedTime, 10);
  //           const seconds = Math.floor(diff / 1000);
  //           setLockDuration(seconds);
  //           Alert.alert(
  //             "Welcome Back!",
  //             `Phone was unused for ${seconds} seconds.`
  //           );
  //         }
  //       });
  //     }

  //     appState.current = nextAppState;
  //   });

  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);

  useEffect(() => {
    // Check if it's the first time the app is launched
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");

      if (!hasLaunched) {
        // First-time launch
        Alert.alert(
          "First Time Setup",
          "Please lock your phone now to start tracking usage."
        );
        await AsyncStorage.setItem("hasLaunched", "true");
      }
    };

    checkFirstLaunch();

    // AppState listener for background/foreground tracking
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        const currentTime = Date.now().toString();
        AsyncStorage.setItem("lastInactiveTime", currentTime);
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        AsyncStorage.getItem("lastInactiveTime").then((storedTime) => {
          if (storedTime) {
            const diff = Date.now() - parseInt(storedTime, 10);
            const seconds = Math.floor(diff / 1000);
            setLockDuration(seconds);
            Alert.alert(
              "Welcome Back!",
              `Phone was unused for ${seconds} seconds.`
            );
          }
        });
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Screen Usage Tracker</Text>
      {lockDuration !== null && (
        <Text style={styles.duration}>
          Last Idle Time: {lockDuration} seconds
        </Text>
      )}
      <Text style={styles.instructions}>
        Minimize or lock your screen, then return to this app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "white" },
  duration: { fontSize: 18, color: "green", marginBottom: 20 },
  instructions: { fontSize: 16, color: "#555", textAlign: "center" },
});
