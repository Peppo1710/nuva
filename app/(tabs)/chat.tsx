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
import * as ImagePicker from "expo-image-picker";
import api from "@/lib/api";

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
        // Build history from messages (exclude loading messages)
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

  // Opens gallery picker
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

  // Opens camera to take a photo
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

  // Shows an action sheet to choose gallery or camera
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

  // Clears current chat and deletes history from backend
  const handleNewChat = useCallback(async () => {
    try {
      await api.delete("/ai/history");
    } catch {
      // Even if backend fails, reset local state
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
          className={`flex-row mb-4 px-4 ${isUser ? "justify-end" : "justify-start"}`}
        >
          {!isUser && (
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2 mt-1">
              <Text className="text-white text-[12px] font-bold">AI</Text>
            </View>
          )}
          <View
            className={`max-w-[78%] px-4 py-3 rounded-2xl ${
              isUser
                ? "bg-primary rounded-tr-sm"
                : "bg-surface dark:bg-surface-dark rounded-tl-sm border-[1px] border-gray-200 dark:border-gray-700"
            }`}
          >
            {item.imageUri && (
              <Image
                source={{ uri: item.imageUri }}
                className="w-[200px] h-[150px] rounded-xl mb-2"
                resizeMode="cover"
              />
            )}
            {item.loading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-[14px] text-gray-500">Thinking...</Text>
              </View>
            ) : (
              <Text
                className={`text-[15px] leading-[22px] ${
                  isUser ? "text-white" : "text-navy dark:text-navy-dark"
                }`}
              >
                {item.content}
              </Text>
            )}
          </View>
        </View>
      );
    },
    []
  );

  const canSend = (inputText.trim().length > 0 || pendingImage !== null) && !isSending;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="px-6 pt-2 pb-3 border-b-[1px] border-gray-100 dark:border-gray-800 flex-row items-center justify-between">
          <View>
            <Text className="text-[24px] font-bold text-navy dark:text-navy-dark">
              Hii by AI 👋
            </Text>
            <Text className="text-[14px] text-gray-500 dark:text-gray-400">
              Your personal health companion
            </Text>
          </View>

          {/* New Chat Button */}
          <Pressable
            onPress={handleNewChat}
            className="w-[38px] h-[38px] rounded-full bg-primary/10 items-center justify-center"
            hitSlop={8}
          >
            <Ionicons name="add" size={24} color="#2563EB" />
          </Pressable>
        </View>

        {/* Messages or Quick Prompts */}
        {messages.length === 0 ? (
          <View className="flex-1 px-4 pt-4">
            <Text className="text-[16px] font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
              Quick questions to get started:
            </Text>
            <View className="gap-3">
              {QUICK_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt.text}
                  onPress={() => handleQuickPrompt(prompt.text)}
                  className="p-4 rounded-2xl border-[1px] border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-dark flex-row items-center"
                >
                  <Text className="text-[20px] mr-3">{prompt.icon}</Text>
                  <Text className="text-[15px] text-navy dark:text-navy-dark font-medium flex-1">
                    {prompt.text}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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
            className="flex-1"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
            onContentSizeChange={scrollToBottom}
          />
        )}

        {/* Input Bar */}
        <View className="px-4 py-3 border-t-[1px] border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark">
          {/* Pending Image Preview */}
          {pendingImage && (
            <View className="mb-2 relative self-start">
              <Image
                source={{ uri: pendingImage.uri }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
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
                  backgroundColor: "#EF4444",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={6}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          )}

          <View className="flex-row items-end bg-surface dark:bg-surface-dark rounded-3xl px-3 py-2 border-[1px] border-gray-200 dark:border-gray-700">
            <Pressable
              onPress={handleAttachImage}
              className="w-[36px] h-[36px] items-center justify-center rounded-full bg-primary/10 mb-1"
              hitSlop={8}
            >
              <Ionicons name="camera" size={20} color="#2563EB" />
            </Pressable>

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={pendingImage ? "Add a prompt for this image..." : "Type your message..."}
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[15px] text-navy dark:text-navy-dark px-3 max-h-[100px] min-h-[36px]"
              multiline
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />

            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              className={`w-[36px] h-[36px] items-center justify-center rounded-full mb-1 ${
                canSend ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
              }`}
              hitSlop={8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="send"
                  size={16}
                  color={canSend ? "#FFFFFF" : "#9CA3AF"}
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
