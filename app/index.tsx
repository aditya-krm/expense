// Onboarding Screen

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";
import theme from "./styles/theme";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useEffect } from "react";

// SVG Icons as data URLs
const ICONS = {
  finance:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgOFYxMk0xMiAxMlYxNk0xMiAxMkg4TTEyIDEySDE2IiBzdHJva2U9IiMwMEM5QTciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iIzAwQzlBNyIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+",
  income:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgNUwxMiAxOSIgc3Ryb2tlPSIjMDBDOUE3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik01IDEyTDEyIDVMMTkgMTIiIHN0cm9rZT0iIzAwQzlBNyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=",
  expense:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTlMMTIgNSIgc3Ryb2tlPSIjMDBDOUE3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik01IDEyTDEyIDE5TDE5IDEyIiBzdHJva2U9IiMwMEM5QTciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
  credit:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIzIiB5PSI2IiB3aWR0aD0iMTgiIGhlaWdodD0iMTIiIHJ4PSIyIiBzdHJva2U9IiMwMEM5QTciIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zIDEwSDE4IiBzdHJva2U9IiMwMEM5QTciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+",
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.featureItem}>
      <Image
        source={{ uri: icon }}
        style={styles.featureIcon}
        contentFit="contain"
      />
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, "#0F0F1E"]}
        style={styles.gradient}
      >
        <Animated.View entering={FadeIn} style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Track Your Finances,{"\n"}
              <Text style={styles.titleHighlight}>Stress-Free</Text>
            </Text>
            <Text style={styles.subtitle}>
              Easily manage your Income, Expenses, and Credits in one place
            </Text>
          </View>

          <Image
            source={{ uri: ICONS.finance }}
            style={[styles.illustration, { width: width * 0.5 }]}
            contentFit="contain"
          />

          <View style={styles.features}>
            <FeatureItem
              icon={ICONS.income}
              title="Track Income"
              description="Monitor your monthly earnings with ease"
            />
            <FeatureItem
              icon={ICONS.expense}
              title="Manage Expenses"
              description="Categorize and track your spending habits"
            />
            <FeatureItem
              icon={ICONS.credit}
              title="Credit Overview"
              description="How much credit you gave and received"
            />
          </View>

          <Pressable
            style={styles.button}
            onPress={() => router.push("/signup")}
          >
            <LinearGradient
              colors={["#00C9A7", "#007AFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.large,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: theme.spacing.xlarge,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
  },
  titleHighlight: {
    color: theme.colors.highlight,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: "center",
    maxWidth: "80%",
  },
  illustration: {
    height: 200,
    marginVertical: theme.spacing.xlarge,
  },
  features: {
    width: "100%",
    marginBottom: theme.spacing.xlarge,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  featureIcon: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.medium,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
    marginTop: "auto",
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
  },
});
