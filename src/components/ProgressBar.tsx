import { View } from "react-native";

type ProgressBarProps = {
  progress: number;
  status?: "saved" | "over-limit" | "without-limit";
};

export default function ProgressBar({
  progress,
  status = "saved",
}: ProgressBarProps) {
  const normalizedProgress = Math.max(0, Math.min(progress, 1));
  const barColor =
    status === "over-limit"
      ? "bg-red-500"
      : status === "without-limit"
      ? "bg-slate-400"
      : "bg-brand-600";

  return (
    <View className="h-3 overflow-hidden rounded-full bg-slate-200">
      <View
        className={`h-full rounded-full ${barColor}`}
        style={{ width: `${normalizedProgress * 100}%` }}
      />
    </View>
  );
}
