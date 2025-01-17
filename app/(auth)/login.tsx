import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import theme from "../styles/theme";
import { Link } from "expo-router";
import { BlurView } from "expo-blur";
import * as z from "zod";

import useAuth from "../context/GlobalProvider";
import { useState } from "react";
import InputField from "../components/ui/input-field";
import ICONS from "../constants/icons";

const loginSchema = z.object({
  key: z.string().min(1, { message: "Email or phone is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

function SocialButton({ icon }: { icon: keyof typeof ICONS }) {
  return (
    <Pressable
      style={styles.socialButton}
      onPress={() => {
        Alert.alert("Sorry, this feature is not available yet.");
      }}
    >
      <Image
        source={ICONS[icon]}
        style={styles.socialIcon}
        contentFit="contain"
      />
    </Pressable>
  );
}

export default function LoginScreen() {
  const [form, setForm] = useState({
    key: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();

  async function handleLogin(formData: typeof form) {
    try {
      const validatedData = loginSchema.parse(formData);
      await login(validatedData.key, validatedData.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setError("Invalid credentials");
        console.error("Login error:", error);
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, "#1A0B2E"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <Animated.View entering={FadeIn} style={styles.formContainer}>
            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
              <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue tracking your finances
                </Text>
              </View>

              <InputField
                icon="profile"
                placeholder="Email or Phone"
                value={form.key}
                onChangeText={(key) => {
                  setForm({ ...form, key });
                  setErrors({ ...errors, key: "" });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.key}
              />
              <InputField
                icon="password"
                placeholder="Password"
                value={form.password}
                onChangeText={(password) => {
                  setForm({ ...form, password });
                  setErrors({ ...errors, password: "" });
                }}
                secureTextEntry
                error={errors.password}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={() => {
                  handleLogin(form);
                }}
              >
                <LinearGradient
                  colors={["#00C9A7", "#007AFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Loading..." : "Log In"}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <SocialButton icon="google" />
                <SocialButton icon="facebook" />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/signup" asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </Pressable>
                </Link>
              </View>
            </BlurView>
          </Animated.View>
        </KeyboardAvoidingView>
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
    justifyContent: "center",
    padding: theme.spacing.large,
  },
  formContainer: {
    borderRadius: theme.borderRadius.large,
    overflow: "hidden",
  },
  glassCard: {
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xlarge,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginHorizontal: theme.spacing.medium,
  },
  input: {
    flex: 1,
    height: 50,
    color: theme.colors.primary,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.large,
  },
  forgotPasswordText: {
    color: theme.colors.highlight,
    fontSize: 14,
  },
  button: {
    height: 56,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
    marginBottom: theme.spacing.large,
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.large,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: theme.colors.secondary,
    marginHorizontal: theme.spacing.medium,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: theme.spacing.large,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.small,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: theme.colors.secondary,
    fontSize: 14,
  },
  footerLink: {
    color: theme.colors.highlight,
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
