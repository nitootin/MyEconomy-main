import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="items-center rounded-lg border border-dashed border-slate-300 bg-white px-5 py-8">
      <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <Ionicons name="receipt-outline" size={24} color="#059669" />
      </View>
      <Text className="text-center text-base font-semibold text-slate-950">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
        {description}
      </Text>
    </View>
  );
}
