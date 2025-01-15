import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GlobalProvider } from "./context/GlobalProvider";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <SafeAreaProvider>
        <StatusBar backgroundColor={"#1A1A2E"} barStyle={"light-content"} />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GlobalProvider>
  );
}
