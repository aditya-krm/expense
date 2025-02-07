import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../styles/theme";

const budget = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🚧 Under Development 🚧</Text>
        <Text style={styles.message}>We're working hard to bring you an amazing budgeting experience!</Text>
        <Text style={styles.message}>Stay tuned for a banger release soon! 🎉</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.primary,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: theme.colors.primary,
  },
});

export default budget;
