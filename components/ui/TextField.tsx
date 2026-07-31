import { Text, TextInput, View, type TextInputProps } from "react-native";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...props }: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-slateink-700 dark:text-slateink-200">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        className={`min-h-12 rounded-2xl border px-4 text-base text-slateink-900 dark:text-slateink-50 ${
          error
            ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/40"
            : "border-slateink-200 bg-white dark:border-slateink-700 dark:bg-slateink-900"
        }`}
        {...props}
      />
      {error ? (
        <Text className="text-sm text-red-500 dark:text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
