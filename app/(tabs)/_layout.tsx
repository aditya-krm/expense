import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import ICONS from "../constants/icons";
import theme from "../styles/theme";

interface TabIconProps {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}
const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        marginTop: 10,
      }}
    >
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        style={{
          width: 25,
          height: 25,
          tintColor: focused ? theme.colors.highlight : theme.colors.secondary,
        }}
      />
      <Text
        style={{
          color: focused ? theme.colors.highlight : theme.colors.secondary,
          fontSize: 12,
          alignSelf: "center",
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const MainLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1f1f2d",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: theme.colors.highlight,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={ICONS.home}
              color={focused ? theme.colors.highlight : theme.colors.secondary}
              focused={focused}
              name="home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={ICONS.budget}
              color={focused ? theme.colors.highlight : theme.colors.secondary}
              focused={focused}
              name="Budget"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={ICONS.list}
              color={focused ? theme.colors.highlight : theme.colors.secondary}
              focused={focused}
              name="Transactions"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={ICONS.profile}
              color={focused ? theme.colors.highlight : theme.colors.secondary}
              focused={focused}
              name="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default MainLayout;
