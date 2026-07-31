import { ActivityIndicator, Pressable, Text } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  const base =
    "min-h-12 items-center justify-center rounded-2xl px-5 active:opacity-90";
  const variants = {
    primary: "bg-brand-500",
    secondary:
      "border border-slateink-200 bg-white dark:border-slateink-700 dark:bg-slateink-900",
    ghost: "bg-transparent",
  } as const;
  const textVariants = {
    primary: "text-white",
    secondary: "text-slateink-900 dark:text-slateink-50",
    ghost: "text-brand-600 dark:text-brand-400",
  } as const;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`${base} ${variants[variant]} ${disabled || loading ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#14b8a6"} />
      ) : (
        <Text className={`text-base font-semibold ${textVariants[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
