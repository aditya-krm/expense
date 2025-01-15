import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../context/GlobalProvider";

const Home = () => {
  const { logout } = useAuth();
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View>
        <Pressable onPress={logout}>
          <Text style={{ fontSize: 20, color: "black" }}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});
