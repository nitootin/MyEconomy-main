import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
};

const variantStyles = {
  primary: "bg-brand-600",
  secondary: "bg-slate-200",
  danger: "bg-red-600",
};

const textStyles = {
  primary: "text-white",
  secondary: "text-slate-900",
  danger: "text-white",
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`h-12 items-center justify-center rounded-lg px-4 ${variantStyles[variant]} ${
        isDisabled ? "opacity-60" : ""
      }`}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#0f172a" : "#ffffff"} />
      ) : (
        <Text className={`text-base font-semibold ${textStyles[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
