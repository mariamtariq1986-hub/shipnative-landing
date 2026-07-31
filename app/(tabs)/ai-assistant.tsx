import { Bot, SendHorizontal, Sparkles } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createMessageId,
  isGeminiConfigured,
  streamChatCompletion,
  type ChatMessage,
} from "@/lib/ai";

const SUGGESTIONS = [
  "Summarize my product idea in 3 bullets",
  "Write a launch tweet thread",
  "Draft an onboarding checklist",
];

export default function AiAssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi — I'm your AI playground. Ask anything, or tap a prompt suggestion to start.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    };
    const assistantId = createMessageId();
    const nextMessages = [...messages, userMessage];

    setMessages([
      ...nextMessages,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChatCompletion(
        nextMessages,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: chunk } : msg,
            ),
          );
        },
        controller.signal,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: message.includes("aborted") ? "Cancelled." : message }
            : msg,
        ),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-slateink-50 dark:bg-slateink-950"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <View className="border-b border-slateink-200 px-5 pb-4 pt-2 dark:border-slateink-800">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15">
              <Bot size={22} color="#14b8a6" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slateink-900 dark:text-white">
                AI Assistant
              </Text>
              <Text className="text-sm text-slateink-500 dark:text-slateink-400">
                {isGeminiConfigured()
                  ? "Connected to Google Gemini"
                  : "Demo streaming — add Gemini key for live replies"}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-5 py-4"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListHeaderComponent={
            messages.length <= 1 ? (
              <View className="mb-2 gap-2">
                <View className="mb-1 flex-row items-center gap-2">
                  <Sparkles size={16} color="#14b8a6" />
                  <Text className="text-sm font-medium text-slateink-500 dark:text-slateink-400">
                    Try a prompt
                  </Text>
                </View>
                {SUGGESTIONS.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => void sendMessage(suggestion)}
                    className="rounded-2xl border border-slateink-200 bg-white px-4 py-3 dark:border-slateink-800 dark:bg-slateink-900"
                  >
                    <Text className="text-sm text-slateink-700 dark:text-slateink-200">
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isUser = item.role === "user";
            return (
              <View
                className={`max-w-[88%] rounded-3xl px-4 py-3 ${
                  isUser
                    ? "self-end bg-brand-500"
                    : "self-start border border-slateink-200 bg-white dark:border-slateink-800 dark:bg-slateink-900"
                }`}
              >
                <Text
                  className={`text-[15px] leading-6 ${
                    isUser
                      ? "text-white"
                      : "text-slateink-800 dark:text-slateink-100"
                  }`}
                >
                  {item.content || (streaming ? "…" : "")}
                </Text>
              </View>
            );
          }}
        />

        <View className="border-t border-slateink-200 px-4 py-3 dark:border-slateink-800">
          <View className="flex-row items-end gap-2 rounded-3xl border border-slateink-200 bg-white px-3 py-2 dark:border-slateink-700 dark:bg-slateink-900">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything…"
              placeholderTextColor="#94a3b8"
              multiline
              className="max-h-28 flex-1 px-2 py-2 text-base text-slateink-900 dark:text-slateink-50"
              editable={!streaming}
              onSubmitEditing={() => void sendMessage(input)}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={streaming || !input.trim()}
              onPress={() => void sendMessage(input)}
              className={`mb-1 h-11 w-11 items-center justify-center rounded-2xl ${
                streaming || !input.trim() ? "bg-slateink-200 dark:bg-slateink-700" : "bg-brand-500"
              }`}
            >
              <SendHorizontal size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
