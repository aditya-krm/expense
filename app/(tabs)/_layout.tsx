import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

interface TabIconProps {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}
const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    <View className="items-center justify-center">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text style={{ fontWeight: focused ? "800" : "400", color: color }}>
        {name}
      </Text>
    </View>
  );
};

const MainLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ headerShown: false }} />
      <Tabs.Screen name="budget" options={{ headerShown: false }} />
      <Tabs.Screen name="transactions" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
    </Tabs>
  );
};

export default MainLayout;
