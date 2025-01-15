import { Image } from "expo-image";
import { StyleSheet, TextInput, View, Pressable } from "react-native";
import theme from "../../styles/theme";

export interface InputFieldProps {
  icon: string;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
}

export function InputField({
  icon,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  onPress,
  value,
  onChangeText,
  autoCapitalize = "none",
  autoCorrect = false,
}: InputFieldProps) {
  const inputProps = {
    style: styles.input,
    placeholder,
    placeholderTextColor: theme.colors.secondary,
    secureTextEntry,
    keyboardType,
    value,
    onChangeText,
    autoCapitalize,
    autoCorrect,
  };

  if (onPress) {
    return (
      <Pressable style={styles.inputContainer} onPress={onPress}>
        <Image
          source={{ uri: icon }}
          style={styles.inputIcon}
          contentFit="contain"
        />
        <TextInput {...inputProps} editable={false} />
      </Pressable>
    );
  }

  return (
    <View style={styles.inputContainer}>
      <Image
        source={{ uri: icon }}
        style={styles.inputIcon}
        contentFit="contain"
      />
      <TextInput {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
