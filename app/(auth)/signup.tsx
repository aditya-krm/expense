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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import theme from "../styles/theme";
import { Link } from "expo-router";
import { BlurView } from "expo-blur";
import { useState } from "react";

import { InputField } from "../components/ui/input-field";
import useAuth from "../context/GlobalProvider";

const ICONS = {
  user: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJDMiAxNy41MiA2LjQ4IDIyIDEyIDIyQzE3LjUyIDIyIDIyIDIyIDIyIDEyQzIyIDYuNDggMTcuNTIgMiAxMiAyWk0xMiA1QzEzLjY2IDUgMTUgNi4zNCAxNSA4QzE1IDkuNjYgMTMuNjYgMTEgMTIgMTFDMTAuMzQgMTEgOSA5LjY2IDkgOEM5IDYuMzQgMTAuMzQgNSAxMiA1Wk0xMiAxOUM5LjMzIDE5IDYuOTggMTcuNiA1LjU4IDE1LjU0QzUuNTQgMTQuNzcgNS41IDEzLjUgNy4zMyAxMi41QzkuMTYgMTEuNSAxMiAxMSAxMiAxMUMxMiAxMSAxNC44NCAxMS41IDE2LjY3IDEyLjVDMTguNSAxMy41IDE4LjQ2IDE0Ljc3IDE4LjQyIDE1LjU0QzE3LjAyIDE3LjYgMTQuNjcgMTkgMTIgMTlaIiBmaWxsPSIjMDBDOUE3Ii8+PC9zdmc+",
  email:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNEg0QzIuOSA0IDIgNC45IDIgNlYxOEMyIDE5LjEgMi45IDIwIDQgMjBIMjBDMjEuMSAyMCAyMiAxOS4xIDIyIDE4VjZDMjIgNC45IDIxLjEgNCAyMCA0Wk0yMCA4LjdMMTIgMTMuNEw0IDguN1V2LjNMMTIgMTFMMjAgNi4zVjguN1oiIGZpbGw9IiMwMEM5QTciLz48L3N2Zz4=",
  phone:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNkg0QzIuOSA2IDIgNi45IDIgOFYxOEMyIDE5LjEgMi45IDIwIDQgMjBIMjBDMjEuMSAyMCAyMiAxOS4xIDIyIDE4VjhDMjIgNi45IDIxLjEgNiAyMCA2Wk0yMCAxOEg0VjhIMjBWMThaTTQgM0gyMFY1SDRWNFpNMTYgMTNIMThWMTVIMTZWMTNaTTEyIDEzSDE0VjE1SDEyVjEzWk04IDEzSDEwVjE1SDhWMTNaIiBmaWxsPSIjMDBDOUE3Ii8+PC9zdmc+",
  password:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTdDMTMuMSAxNyAxNCAxNi4xIDE0IDE1QzE0IDEzLjkgMTMuMSAxMyAxMiAxM0MxMC45IDEzIDEwIDEzLjkgMTAgMTVDMTAgMTYuMSAxMC45IDE3IDEyIDE3Wk0xOCA4SDE3VjZDMTcgMy4yIDE0LjggMSAxMiAxQzkuMiAxIDcgMy4yIDcgNlY4SDZDNCAxMCA0IDEwIDQgMTJWMjBDNCAxMiA0IDIyIDYgMjJIMThDMjAgMjIgMjAgMjAgMjAgMThWMTJDMjAgMTAgMjAgMTAgMTggOFpNOC45IDZDOC45IDQuMzQgMTAuMzQgMi45IDEyIDIuOUMxMy42NiAyLjkgMTUuMSA0LjM0IDE1LjEgNlY4SDguOVY2WiIgZmlsbD0iIzAwQzlBNyIvPjwvc3ZnPg==",
  profession:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNkg0QzIuOSA2IDIgNi45IDIgOFYxOEMyIDE5LjEgMi45IDIwIDQgMjBIMjBDMjEuMSAyMCAyMiAxOS4xIDIyIDE4VjhDMjIgNi45IDIxLjEgNiAyMCA2Wk0yMCAxOEg0VjhIMjBWMThaTTQgM0gyMFY1SDRWNFpNMTYgMTNIMThWMTVIMTZWMTNaTTEyIDEzSDE0VjE1SDEyVjEzWk04IDEzSDEwVjE1SDhWMTNaIiBmaWxsPSIjMDBDOUE3Ii8+PC9zdmc+",
  google:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjEuODU2MSAxMC4yMDAxQzIxLjkzNjEgMTAuODAwMSAyMS45OTYxIDExLjQwMDEgMjEuOTk2MSAxMi4wMDAxQzIxLjk5NjEgMTUuMTAwMSAyMC44NTYxIDE3LjYwMDEgMTguOTU2MSAxOS4zMDAxTDE4Ljk1NjEgMTkuMzAwMUMxNy4zNTYxIDIwLjcwMDEgMTUuMjU2MSAyMS41MDAxIDEyLjY1NjEgMjEuNTAwMUM4LjE1NjEyIDIxLjUwMDEgNC4zNTYxMiAxOC45MDAxIDIuNjU2MTIgMTUuMTAwMUMyLjE1NjEyIDEzLjkwMDEgMS44NTYxMiAxMi41MDAxIDEuODU2MTIgMTEuMDAwMUMxLjg1NjEyIDkuNTAwMDkgMi4xNTYxMiA4LjEwMDA5IDIuNjU2MTIgNi45MDAwOUM0LjM1NjEyIDMuMTAwMDkgOC4xNTYxMiAwLjUwMDA4OCAxMi42NTYxIDAuNTAwMDg4QzE1LjQ1NjEgMC41MDAwODggMTcuOTU2MSAxLjcwMDA5IDE5Ljg1NjEgMy42MDAwOUwyMC4xNTYxIDMuOTAwMDlMMTYuNzU2MSA3LjMwMDA5TDE2LjQ1NjEgNy4xMDAwOUMxNS4yNTYxIDYuMTAwMDkgMTMuOTU2MSA1LjYwMDA5IDEyLjY1NjEgNS42MDAwOUMxMC4xNTYxIDUuNjAwMDkgNy45NTYxMiA3LjMwMDA5IDcuMDU2MTIgOS43MDAwOUM2LjY1NjEyIDEwLjcwMDEgNi41NTYxMiAxMS44MDAxIDYuNTU2MTIgMTIuOTAwMUM2LjU1NjEyIDE0LjAwMDEgNi43NTYxMiAxNS4xMDAxIDcuMDU2MTIgMTYuMTAwMUM3Ljk1NjEyIDE4LjUwMDEgMTAuMTU2MSAyMC4yMDAxIDEyLjY1NjEgMjAuMjAwMUMxMy45NTYxIDIwLjIwMDEgMTUuMTU2MSAxOS44MDAxIDE2LjE1NjEgMTkuMTAwMUMxNy40NTYxIDE4LjIwMDEgMTguMjU2MSAxNi43MDAxIDE4LjM1NjEgMTQuOTAwMUgxMi42NTYxVjEwLjIwMDFIMjEuODU2MVoiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=",
  facebook:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjIgMTJDMjIgNi40NzcgMTcuNTIzIDIgMTIgMkM2LjQ3NyAyIDIgNi40NzcgMiAxMkMyIDE2Ljk5MSA5LjY1NyAyMS4wNDMgMTAuNDM4IDIxLjg3OFYxNC44NDNINS43OTdWMTJIOS40MzhWOS43OTdDOS40MzggNy4yOTEgMTEuMDYxIDUuOTA3IDEzLjM0NSA1LjkwN0MxNC40NzUgNS45MDcgMTUuNjA1IDYuMTAyIDE1LjYwNSA2LjEwMlY5LjU2MkgxNC4yODVDMTIuOTY1IDkuNTYyIDEyLjU2MiAxMC4zMzMgMTIuNTYyIDExLjEyNFYxMkgxNS40NzVMMTQuOTU1IDE0Ljg0M0gxMi41NjJWMjEuODc4QzE3LjM0MyAyMS4wNDMgMjEgMTYuOTkxIDIyIDEyWiIgZmlsbD0iI0ZGRkZGRiIvPjwvc3ZnPg==",
};

const PROFESSIONS = {
  salary: "salary",
  business: "business",
  student: "student",
  freelancer: "freelancer",
  other: "other",
} as const;

type ProfessionType = keyof typeof PROFESSIONS;

function SocialButton({ icon }: { icon: string }) {
  return (
    <Pressable style={styles.socialButton}>
      <Image
        source={{ uri: icon }}
        style={styles.socialIcon}
        contentFit="contain"
      />
    </Pressable>
  );
}

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
  const [error, setError] = useState<string | null>(null);

  const { signup, isLoading } = useAuth();

  async function handleSignup(form: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    profession: string;
  }) {
    console.log("Attempting signup with:", form);
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword ||
      !form.profession
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup(form);
    } catch (error) {
      console.error("Signup error:", error);
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
                icon={ICONS.user}
                placeholder="Full Name"
                value={form.name}
                onChangeText={(name) => setForm({ ...form, name })}
              />
              <InputField
                icon={ICONS.email}
                placeholder="Email"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(email) => setForm({ ...form, email })}
              />
              <InputField
                icon={ICONS.phone}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(phone) => setForm({ ...form, phone })}
              />
              <InputField
                icon={ICONS.profession}
                placeholder="Profession"
                value={form.profession}
                onPress={() => setShowProfessionModal(true)}
              />
              <InputField
                icon={ICONS.password}
                placeholder="Password"
                secureTextEntry
                value={form.password}
                onChangeText={(password) => setForm({ ...form, password })}
              />
              <InputField
                icon={ICONS.password}
                placeholder="Confirm Password"
                secureTextEntry
                value={form.confirmPassword}
                onChangeText={(confirmPassword) =>
                  setForm({ ...form, confirmPassword })
                }
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
                <SocialButton icon={ICONS.google} />
                <SocialButton icon={ICONS.facebook} />
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
