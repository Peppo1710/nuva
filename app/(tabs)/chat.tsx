import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useCallback } from "react";
import { useColorScheme } from "nativewind";
import * as ImagePicker from "expo-image-picker";
import api from "@/lib/api";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUri?: string;
  loading?: boolean;
}

interface PendingImage {
  base64: string;
  uri: string;
}

const QUICK_PROMPTS = [
  { icon: "📷", text: "What is this medicine for?" },
  { icon: "💊", text: "Can I take Drug A with Drug B?" },
  { icon: "🤕", text: "I have a headache, what should I do?" },
  { icon: "📋", text: "Tell me about my medications" },
];

export default function ChatScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const listRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const sendMessage = useCallback(
    async (text: string, imageBase64?: string, imageUri?: string) => {
      if (!text.trim() && !imageBase64) return;
      if (isSending) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim() || "[Image sent]",
        imageUri,
      };

      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        loading: true,
      };

      setMessages((prev) => [...prev, userMessage, loadingMessage]);
      setInputText("");
      setPendingImage(null);
      setIsSending(true);

      setTimeout(scrollToBottom, 100);

      try {
        const history = messages
          .filter((m) => !m.loading)
          .map((m) => ({ role: m.role, content: m.content }));

        const { data } = await api.post("/ai/chat", {
          message: text.trim() || "Please analyze this image.",
          image_base64: imageBase64 || null,
          history,
        });

        const assistantMessage: Message = {
          id: loadingMessage.id,
          role: "assistant",
          content: data.reply,
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === loadingMessage.id ? assistantMessage : m))
        );
      } catch (err: any) {
        const errorMessage: Message = {
          id: loadingMessage.id,
          role: "assistant",
          content:
            err?.response?.data?.error ||
            "Sorry, I couldn't get a response. Please check your internet connection and try again.",
        };
        setMessages((prev) =>
          prev.map((m) => (m.id === loadingMessage.id ? errorMessage : m))
        );
      } finally {
        setIsSending(false);
        setTimeout(scrollToBottom, 200);
      }
    },
    [messages, isSending, scrollToBottom]
  );

  const handleSend = useCallback(() => {
    sendMessage(inputText, pendingImage?.base64, pendingImage?.uri);
  }, [inputText, pendingImage, sendMessage]);

  const handleQuickPrompt = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const openGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.6,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64 = `data:image/jpeg;base64,${asset.base64}`;
        setPendingImage({ base64, uri: asset.uri });
      }
    } catch {
      Alert.alert("Error", "Could not open the photo library.");
    }
  }, []);

  const openCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow access to your camera."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.6,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64 = `data:image/jpeg;base64,${asset.base64}`;
        setPendingImage({ base64, uri: asset.uri });
      }
    } catch {
      Alert.alert("Error", "Could not open the camera.");
    }
  }, []);

  const handleAttachImage = useCallback(() => {
    Alert.alert(
      "Attach Image",
      "Choose a source",
      [
        { text: "Gallery", onPress: openGallery },
        { text: "Camera", onPress: openCamera },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  }, [openGallery, openCamera]);

  const handleNewChat = useCallback(async () => {
    try {
      await api.delete("/ai/history");
    } catch {
      // Reset local state regardless
    }
    setMessages([]);
    setInputText("");
    setPendingImage(null);
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.role === "user";

      return (
        <View
          style={{
            flexDirection: "row",
            marginBottom: 16,
            paddingHorizontal: S.base,
            justifyContent: isUser ? "flex-end" : "flex-start",
          }}
        >
          {!isUser && (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: c.navy,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                marginTop: 4,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: Typography.xs, fontWeight: "700" }}>AI</Text>
            </View>
          )}
          <View
            style={{
              maxWidth: "78%",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: R.lg,
              backgroundColor: isUser ? c.navy : c.surface,
              borderWidth: isUser ? 0 : 0.5,
              borderColor: isUser ? undefined : c.border,
              borderTopRightRadius: isUser ? 4 : R.lg,
              borderTopLeftRadius: isUser ? R.lg : 4,
            }}
          >
            {item.imageUri && (
              <Image
                source={{ uri: item.imageUri }}
                style={{ width: 200, height: 150, borderRadius: R.md, marginBottom: 8 }}
                resizeMode="cover"
              />
            )}
            {item.loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator size="small" color={c.navy} />
                <Text style={{ fontSize: Typography.sm, color: c.textMuted }}>Thinking...</Text>
              </View>
            ) : (
              <Text
                style={{
                  fontSize: Typography.base,
                  lineHeight: 24,
                  color: isUser ? c.textOnNavy : c.textPrimary,
                }}
              >
                {item.content}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [c]
  );

  const canSend = (inputText.trim().length > 0 || pendingImage !== null) && !isSending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: S.xl,
            paddingTop: 8,
            paddingBottom: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: c.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: Typography.lg, fontWeight: "700", color: c.textPrimary }}>
              AI Chat
            </Text>
            <Text style={{ fontSize: Typography.sm, color: c.textSecondary }}>
              Your personal health companion
            </Text>
          </View>

          <Pressable
            onPress={handleNewChat}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: isDark ? "rgba(58,81,160,0.15)" : "rgba(26,39,68,0.06)",
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={8}
          >
            <Ionicons name="add" size={24} color={c.navy} />
          </Pressable>
        </View>

        {/* Messages or Quick Prompts */}
        {messages.length === 0 ? (
          <View style={{ flex: 1, paddingHorizontal: S.base, paddingTop: S.base }}>
            <Text
              style={{
                fontSize: Typography.sm,
                fontWeight: "600",
                color: c.textSecondary,
                marginBottom: 12,
                paddingHorizontal: 8,
              }}
            >
              Quick questions to get started:
            </Text>
            <View style={{ gap: 12 }}>
              {QUICK_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt.text}
                  onPress={() => handleQuickPrompt(prompt.text)}
                  style={{
                    padding: S.base,
                    borderRadius: R.lg,
                    borderWidth: 0.5,
                    borderColor: c.border,
                    backgroundColor: c.surface,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: Typography.md, marginRight: 12 }}>{prompt.icon}</Text>
                  <Text style={{ fontSize: Typography.base, color: c.textPrimary, fontWeight: "500", flex: 1 }}>
                    {prompt.text}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
            onContentSizeChange={scrollToBottom}
          />
        )}

        {/* Input Bar */}
        <View
          style={{
            paddingHorizontal: S.base,
            paddingVertical: 12,
            borderTopWidth: 0.5,
            borderTopColor: c.border,
            backgroundColor: c.bg,
          }}
        >
          {pendingImage && (
            <View style={{ marginBottom: 8, alignSelf: "flex-start", position: "relative" }}>
              <Image
                source={{ uri: pendingImage.uri }}
                style={{ width: 80, height: 80, borderRadius: R.md }}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setPendingImage(null)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: c.danger,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={6}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: c.surface,
              borderRadius: 24,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 0.5,
              borderColor: c.border,
            }}
          >
            <Pressable
              onPress={handleAttachImage}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                backgroundColor: isDark ? "rgba(58,81,160,0.15)" : "rgba(26,39,68,0.06)",
                marginBottom: 2,
              }}
              hitSlop={8}
            >
              <Ionicons name="camera" size={20} color={c.navy} />
            </Pressable>

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={pendingImage ? "Add a prompt for this image..." : "Type your message..."}
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1,
                fontSize: Typography.base,
                color: c.textPrimary,
                paddingHorizontal: 12,
                maxHeight: 100,
                minHeight: 36,
              }}
              multiline
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />

            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                backgroundColor: canSend ? c.navy : c.border,
                marginBottom: 2,
              }}
              hitSlop={8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="send"
                  size={16}
                  color={canSend ? "#FFFFFF" : c.textMuted}
                  style={{ marginLeft: 2 }}
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
