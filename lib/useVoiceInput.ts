import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import api from "./api";
import type { AppLanguage } from "./i18n";

export interface VoiceInputApi {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  /** Returns true if recording was successfully started (permissions granted). */
  start: () => Promise<boolean>;
  /** Stops the recording, uploads it to /ai/transcribe and returns the text (or null on failure). */
  stop: (language?: AppLanguage) => Promise<string | null>;
  /** Abort an in-progress recording without transcribing. */
  cancel: () => Promise<void>;
}

export function useVoiceInput(): VoiceInputApi {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      return true;
    } catch (e) {
      console.warn("[voice] start error", e);
      setError("record_failed");
      setIsRecording(false);
      return false;
    }
  }, []);

  const stop = useCallback(async (language: AppLanguage = "en"): Promise<string | null> => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (!recording) {
      setIsRecording(false);
      return null;
    }

    try {
      setIsRecording(false);
      setIsTranscribing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {}

      if (!uri) {
        setError("no_audio");
        return null;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mimeType = Platform.OS === "ios" ? "audio/m4a" : "audio/m4a";

      const res = await api.post<{ text: string }>("/ai/transcribe", {
        audio_base64: base64,
        mime_type: mimeType,
        language,
      });

      return (res.data?.text || "").trim() || null;
    } catch (e) {
      console.warn("[voice] stop/transcribe error", e);
      setError("transcribe_failed");
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;
    try {
      if (recording) await recording.stopAndUnloadAsync();
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {}
    } catch {
    } finally {
      setIsRecording(false);
      setIsTranscribing(false);
      setError(null);
    }
  }, []);

  return { isRecording, isTranscribing, error, start, stop, cancel };
}
