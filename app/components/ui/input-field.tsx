import { Image } from "expo-image";
import { StyleSheet, TextInput, View, Pressable, Text } from "react-native";
import theme from "../../styles/theme";
import ICONS from "../../constants/icons";

export interface InputFieldProps {
  icon: keyof typeof ICONS;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  error?: string;
}

export default function InputField({
  icon,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  onPress,
  value,
  onChangeText,
  autoCapitalize = "none",
  autoCorrect = false,
  error,
}: InputFieldProps) {
  const inputProps = {
    style: [styles.input, error && styles.inputError],
    placeholder,
    placeholderTextColor: theme.colors.secondary,
    secureTextEntry,
    keyboardType,
    value,
    onChangeText,
    autoCapitalize,
    autoCorrect,
  };

  const Container = onPress ? Pressable : View;

  return (
    <View style={styles.container}>
      <Container
        style={[styles.inputContainer, error && styles.containerError]}
        {...(onPress && { onPress })}
      >
        <Image
          source={ICONS[icon]}
          style={styles.inputIcon}
          contentFit="contain"
          tintColor="white"
        />
        <TextInput {...inputProps} editable={!onPress} />
      </Container>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  containerError: {
    borderColor: theme.colors.error,
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 6,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  inputError: {
    color: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});
