import { View } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet } from "react-native";
import theme from "../styles/theme";
import { TransactionTypes } from "../types/transaction";

interface OverviewCardProps {
  type: typeof TransactionTypes[keyof typeof TransactionTypes];
  amount: number;
  delay?: number;
}

const OverviewCard = ({ type, amount, delay = 0 }: OverviewCardProps) => {
  const gradientColors = [
    `${type.color}10`,
    `${type.color}05`,
    'transparent'
  ] as const;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay)}
      style={styles.overviewCard}>
      <LinearGradient colors={gradientColors} style={styles.cardGradient}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons
            name={type.icon}
            size={20}
            color={type.color}
            style={styles.icon}
          />
          <Text
            variant="titleMedium"
            style={[styles.cardTitle, { color: theme.colors.primary}]}
          >
            {type.label}
          </Text>
        </View>
        <Text variant="headlineMedium" style={styles.cardAmount}>
          ₹{amount?.toLocaleString() ?? '0.00'}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

export default OverviewCard;

const styles = StyleSheet.create({
  overviewCard: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    elevation: 1,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    minWidth: "47%",
  },
  headerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "500",
  },
  cardAmount: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
