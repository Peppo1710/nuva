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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useCallback } from "react";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import api from "@/lib/api";
import { Colors } from "@/constants/colors";
import { Typography, S, R } from "@/constants/typography";
import { useT } from "@/lib/useT";
import { useProfileStore } from "@/store/profileStore";
import { useVoiceInput } from "@/lib/useVoiceInput";

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

const QUICK_PROMPT_KEYS = ["scan", "interaction", "headache", "myMeds"] as const;

const QUICK_PROMPT_COLORS: Record<string, [string, string]> = {
  scan: ["#3DD6A3", "#2BC48A"],
  interaction: ["#A594F9", "#7C6FEF"],
  headache: ["#F87171", "#EF4444"],
  myMeds: ["#60A5FA", "#3B82F6"],
};

export default function ChatScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = isDark ? Colors.dark : Colors.light;
  const t = useT();
  const language = useProfileStore((s) => s.language);
  const voice = useVoiceInput();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 64 + insets.bottom;

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
        content: text.trim() || t("chat.imageSent"),
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
          message: text.trim() || t("chat.analyzeImage"),
          image_base64: imageBase64 || null,
          history,
          language,
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
            t("chat.errorReply"),
        };
        setMessages((prev) =>
          prev.map((m) => (m.id === loadingMessage.id ? errorMessage : m))
        );
      } finally {
        setIsSending(false);
        setTimeout(scrollToBottom, 200);
      }
    },
    [messages, isSending, scrollToBottom, t, language]
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
        Alert.alert(t("chat.permissionNeeded"), t("chat.permissionPhotos"));
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
      Alert.alert(t("common.error"), t("chat.errorOpenGallery"));
    }
  }, [t]);

  const openCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("chat.permissionNeeded"), t("chat.permissionCamera"));
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
      Alert.alert(t("common.error"), t("chat.errorOpenCamera"));
    }
  }, [t]);

  const handleAttachImage = useCallback(() => {
    Alert.alert(
      t("chat.attachImage"),
      t("chat.attachChoose"),
      [
        { text: t("chat.gallery"), onPress: openGallery },
        { text: t("chat.camera"), onPress: openCamera },
        { text: t("common.cancel"), style: "cancel" },
      ],
      { cancelable: true }
    );
  }, [openGallery, openCamera, t]);

  const handleMicPress = useCallback(async () => {
    if (voice.isRecording) {
      try {
        const transcript = await voice.stop(language);
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      } catch {
        Alert.alert(t("common.error"), t("chat.errorVoice"));
      }
    } else {
      const started = await voice.start();
      if (!started) {
        Alert.alert(t("chat.permissionNeeded"), t("chat.permissionMic"));
      }
    }
  }, [voice, language, t]);

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
                width: 34,
                height: 34,
                borderRadius: 10,
                overflow: "hidden",
                marginRight: 10,
                marginTop: 2,
              }}
            >
              <LinearGradient
                colors={["#3DD6A3", "#A594F9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 16 }}>✦</Text>
              </LinearGradient>
            </View>
          )}
          <View style={{ maxWidth: "78%" }}>
            {item.imageUri && (
              <Image
                source={{ uri: item.imageUri }}
                style={{
                  width: 200,
                  height: 150,
                  borderRadius: R.lg,
                  marginBottom: 6,
                  borderWidth: 1,
                  borderColor: isDark ? "#222" : c.border,
                }}
                resizeMode="cover"
              />
            )}
            {isUser ? (
              <View style={{ overflow: "hidden", borderRadius: R.lg }}>
                <LinearGradient
                  colors={["#3DD6A3", "#A594F9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderTopRightRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: Typography.base,
                      lineHeight: 24,
                      color: "#FFFFFF",
                      fontWeight: "500",
                    }}
                  >
                    {item.content}
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: R.lg,
                  borderTopLeftRadius: 4,
                  backgroundColor: isDark ? "#111111" : c.surface,
                  borderWidth: 1,
                  borderColor: isDark ? "#1E1E1E" : c.border,
                }}
              >
                {item.loading ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <ActivityIndicator size="small" color={isDark ? "#3DD6A3" : c.navy} />
                    <Text style={{ fontSize: Typography.sm, color: c.textMuted }}>{t("chat.thinking")}</Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontSize: Typography.base,
                      lineHeight: 24,
                      color: c.textPrimary,
                    }}
                  >
                    {item.content}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      );
    },
    [c, t, isDark]
  );

  const canSend = (inputText.trim().length > 0 || pendingImage !== null) && !isSending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }} edges={["top"]}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? TAB_BAR_HEIGHT : 0}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: S.xl,
            paddingTop: 12,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#111111" : c.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: isDark ? "#000000" : c.bg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                overflow: "hidden",
                marginRight: 12,
              }}
            >
              <LinearGradient
                colors={["#3DD6A3", "#A594F9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 20 }}>✦</Text>
              </LinearGradient>
            </View>
            <View>
              <Text style={{ fontSize: Typography.base + 1, fontWeight: "700", color: c.textPrimary }}>
                {t("chat.title")}
              </Text>
              <Text style={{ fontSize: Typography.sm - 1, color: isDark ? "#3DD6A3" : c.teal, fontWeight: "600" }}>
                {t("chat.subtitle")}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleNewChat}
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              backgroundColor: isDark ? "#111111" : "#F0F2F5",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "#1E1E1E" : c.border,
            }}
            hitSlop={8}
          >
            <Ionicons name="add" size={20} color={isDark ? "rgba(255,255,255,0.6)" : c.navy} />
          </Pressable>
        </View>

        {/* Messages or Quick Prompts */}
        {messages.length === 0 ? (
          <View style={{ flex: 1, paddingHorizontal: S.base, paddingTop: S.xl }}>
            <View style={{ alignItems: "center", marginBottom: S.xl }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  overflow: "hidden",
                  marginBottom: 16,
                  shadowColor: "#3DD6A3",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={["#3DD6A3", "#A594F9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: 32 }}>✦</Text>
                </LinearGradient>
              </View>
              <Text style={{ fontSize: Typography.md, fontWeight: "700", color: c.textPrimary, textAlign: "center" }}>
                AI Health Assistant
              </Text>
              <Text style={{ fontSize: Typography.sm, color: c.textSecondary, textAlign: "center", marginTop: 4 }}>
                {t("chat.quickStart")}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              {QUICK_PROMPT_KEYS.map((key) => {
                const promptText = t(`chat.prompts.${key}`);
                const promptIcon = t(`chat.promptIcons.${key}`);
                const colors = QUICK_PROMPT_COLORS[key];
                return (
                  <Pressable
                    key={key}
                    onPress={() => handleQuickPrompt(promptText)}
                    style={{
                      borderRadius: R.lg,
                      borderWidth: 1,
                      borderColor: isDark ? "#1E1E1E" : c.border,
                      backgroundColor: isDark ? "#0D0D0D" : c.surface,
                      flexDirection: "row",
                      alignItems: "center",
                      padding: S.base,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        overflow: "hidden",
                        marginRight: 12,
                      }}
                    >
                      <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                      >
                        <Text style={{ fontSize: 18 }}>{promptIcon}</Text>
                      </LinearGradient>
                    </View>
                    <Text style={{ fontSize: Typography.base, color: c.textPrimary, fontWeight: "500", flex: 1 }}>
                      {promptText}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? "rgba(255,255,255,0.2)" : c.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={{ flex: 1, backgroundColor: isDark ? "#000000" : c.bg }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
            onContentSizeChange={scrollToBottom}
          />
        )}

        {/* Input Bar */}
        <View
          style={{
            paddingHorizontal: S.base,
            paddingTop: 12,
            paddingBottom: 12 + insets.bottom,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#111111" : c.border,
            backgroundColor: isDark ? "#000000" : c.bg,
          }}
        >
          {(voice.isRecording || voice.isTranscribing) && (
            <View
              style={{
                marginBottom: 10,
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: voice.isRecording
                  ? "rgba(248,113,113,0.12)"
                  : isDark ? "#111111" : "#F0F2F5",
                borderWidth: 1,
                borderColor: voice.isRecording ? "rgba(248,113,113,0.3)" : "transparent",
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: voice.isRecording ? c.danger : c.textSecondary,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: Typography.sm, color: c.textPrimary, fontWeight: "600" }}>
                {voice.isRecording ? t("chat.listening") : t("chat.transcribing")}
              </Text>
            </View>
          )}

          {pendingImage && (
            <View style={{ marginBottom: 10, alignSelf: "flex-start", position: "relative" }}>
              <Image
                source={{ uri: pendingImage.uri }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: R.lg,
                  borderWidth: 1,
                  borderColor: isDark ? "#222" : c.border,
                }}
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
                  borderWidth: 1.5,
                  borderColor: isDark ? "#000" : "#fff",
                }}
                hitSlop={6}
              >
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </Pressable>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: isDark ? "#0D0D0D" : c.surface,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: isDark ? "#1E1E1E" : c.border,
            }}
          >
            <Pressable
              onPress={handleAttachImage}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
                marginBottom: 2,
              }}
              hitSlop={8}
            >
              <Ionicons name="camera" size={18} color={isDark ? "rgba(255,255,255,0.5)" : c.textSecondary} />
            </Pressable>

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={pendingImage ? t("chat.placeholderImage") : t("chat.placeholder")}
              placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : c.textMuted}
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
              onPress={handleMicPress}
              disabled={voice.isTranscribing}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                backgroundColor: voice.isRecording
                  ? c.danger
                  : isDark ? "#1A1A1A" : "#F0F2F5",
                marginBottom: 2,
                marginRight: 6,
              }}
              hitSlop={8}
            >
              {voice.isTranscribing ? (
                <ActivityIndicator size="small" color={isDark ? "#3DD6A3" : c.navy} />
              ) : (
                <Ionicons
                  name={voice.isRecording ? "stop" : "mic"}
                  size={16}
                  color={voice.isRecording ? "#FFFFFF" : isDark ? "rgba(255,255,255,0.5)" : c.textSecondary}
                />
              )}
            </Pressable>

            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 2,
              }}
              hitSlop={8}
            >
              {canSend ? (
                <LinearGradient
                  colors={["#3DD6A3", "#A594F9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={15} color="#FFFFFF" style={{ marginLeft: 2 }} />
                  )}
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    backgroundColor: isDark ? "#1A1A1A" : "#F0F2F5",
                  }}
                >
                  <Ionicons name="send" size={15} color={isDark ? "rgba(255,255,255,0.2)" : c.textMuted} style={{ marginLeft: 2 }} />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
