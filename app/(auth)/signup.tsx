import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import theme from "../styles/theme";
import { Link } from "expo-router";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { z } from "zod";

import InputField from "../components/ui/input-field";
import useAuth from "../context/GlobalProvider";
import ICONS from "../constants/icons";

const PROFESSIONS = {
  salary: "salary",
  business: "business",
  student: "student",
  freelancer: "freelancer",
  other: "other",
} as const;

type ProfessionType = keyof typeof PROFESSIONS;

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

const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  profession: z.string().min(1, { message: "Profession is required" }),
});

export default function SignupScreen() {
  const [selectedProfession, setSelectedProfession] =
    useState<ProfessionType>("salary");
  const [showProfessionModal, setShowProfessionModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profession: PROFESSIONS.salary,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { signup, isLoading } = useAuth();

  async function handleSignup(formData: typeof form) {
    try {
      const validatedData = signupSchema.parse(formData);

      if (validatedData.password !== validatedData.confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      await signup(validatedData);
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
        console.error("Signup error:", error);
        setError("An error occurred during signup");
      }
    }
  }

  function ProfessionModal() {
    return (
      <Modal
        visible={showProfessionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfessionModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowProfessionModal(false)}
        >
          <View style={styles.modalContent}>
            <BlurView intensity={100} tint="dark" style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Profession</Text>
              <FlatList
                data={Object.entries(PROFESSIONS)}
                keyExtractor={([key]) => key}
                renderItem={({ item: [key, value] }) => (
                  <Pressable
                    style={[
                      styles.professionItem,
                      key === selectedProfession && styles.selectedProfession,
                    ]}
                    onPress={() => {
                      setSelectedProfession(key as ProfessionType);
                      setForm((prevForm: any) => ({
                        ...prevForm,
                        profession: value,
                      }));
                      setShowProfessionModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.professionText,
                        key === selectedProfession &&
                          styles.selectedProfessionText,
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                )}
              />
            </BlurView>
          </View>
        </Pressable>
      </Modal>
    );
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Join us to start managing your finances
                </Text>
              </View>

              <InputField
                icon="profile"
                placeholder="Full Name"
                value={form.name}
                onChangeText={(name) => {
                  setForm({ ...form, name });
                  setErrors({ ...errors, name: "" });
                }}
                error={errors.name}
              />
              <InputField
                icon="mail"
                placeholder="Email"
                value={form.email}
                onChangeText={(email) => {
                  setForm({ ...form, email });
                  setErrors({ ...errors, email: "" });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <InputField
                icon="phone"
                placeholder="Phone"
                value={form.phone}
                onChangeText={(phone) => {
                  setForm({ ...form, phone });
                  setErrors({ ...errors, phone: "" });
                }}
                keyboardType="phone-pad"
                error={errors.phone}
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
              <InputField
                icon="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChangeText={(confirmPassword) => {
                  setForm({ ...form, confirmPassword });
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                secureTextEntry
                error={errors.confirmPassword}
              />
              <InputField
                icon="profession"
                placeholder="Profession"
                value={PROFESSIONS[selectedProfession]}
                onPress={() => setShowProfessionModal(true)}
                error={errors.profession}
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <Pressable
                style={styles.button}
                onPress={() => handleSignup(form)}
              >
                <LinearGradient
                  colors={["#00C9A7", "#007AFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Signing up..." : "Sign Up"}
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
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/login" asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Log In</Text>
                  </Pressable>
                </Link>
              </View>

              <Text style={styles.terms}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </BlurView>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
      <ProfessionModal />
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
    marginBottom: theme.spacing.medium,
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
  terms: {
    color: theme.colors.secondary,
    fontSize: 12,
    textAlign: "center",
  },
  termsLink: {
    color: theme.colors.highlight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalCard: {
    backgroundColor: "#1f174f",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  professionItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedProfession: {
    backgroundColor: theme.colors.primary,
  },
  professionText: {
    fontSize: 16,
    color: theme.colors.primary,
    textTransform: "capitalize",
  },
  selectedProfessionText: {
    color: "#000",
    fontWeight: "600",
  },
  error: {
    color: theme.colors.error,
    marginBottom: 10,
    alignSelf: "center",
  },
});
