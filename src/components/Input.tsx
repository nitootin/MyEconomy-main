import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { secureTextEntry, ...textInputProps } = props;
  const isPassword = Boolean(secureTextEntry);

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      <View
        className={`h-12 flex-row items-center rounded-lg border bg-white ${
          error ? "border-red-500" : "border-slate-300"
        }`}
      >
        <TextInput
          key={passwordVisible ? "visible" : "protected"}
          className="h-full flex-1 px-4 text-base text-slate-900"
          placeholderTextColor="#94a3b8"
          {...textInputProps}
          secureTextEntry={isPassword && !passwordVisible}
        />
        {isPassword ? (
          <TouchableOpacity
            accessibilityLabel={
              passwordVisible ? "Ocultar senha" : "Mostrar senha"
            }
            className="h-full items-center justify-center px-4"
            onPress={() => setPasswordVisible((visible) => !visible)}
          >
            <Ionicons
              color="#64748b"
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
