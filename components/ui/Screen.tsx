import { type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
};

export function Screen({
  children,
  scroll = true,
  className = "",
  contentClassName = "",
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={`grow px-5 pb-8 pt-2 ${contentClassName}`}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-5 pb-4 pt-2 ${contentClassName}`}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className={`flex-1 bg-slateink-50 dark:bg-slateink-950 ${className}`}
    >
      {body}
    </SafeAreaView>
  );
}
