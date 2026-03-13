import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";

let soundInstance: Sound | null = null;

export async function playNotificationSound() {
  try {
    if (soundInstance) {
      await soundInstance.unloadAsync();
      soundInstance = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/notification.wav"),
      { shouldPlay: true, volume: 1.0 }
    );
    soundInstance = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        soundInstance = null;
      }
    });
  } catch (e) {
    console.warn("Failed to play notification sound:", e);
  }
}

export async function cleanupSound() {
  if (soundInstance) {
    await soundInstance.unloadAsync();
    soundInstance = null;
  }
}
