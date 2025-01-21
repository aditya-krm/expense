import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GlobalProvider } from "./context/GlobalProvider";
import { TransactionProvider } from "./context/TransactionContext";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <TransactionProvider>
        <SafeAreaProvider>
          <StatusBar
            backgroundColor={"#062a2421"}
            translucent
            barStyle={"light-content"}
          />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </TransactionProvider>
    </GlobalProvider>
  );
}
