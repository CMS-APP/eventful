import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { Input } from "@/components/inputs/Input";
import { SpotifyPlaylists } from "@/features/events/components/music/SpotifyPlaylists";
import { colors } from "@/styles/colors";
import { Event } from "@/types/Event";

interface EventMusicEditProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function EventMusicEdit({ event, setEvent }: EventMusicEditProps) {
  const setEventMusic = useCallback(
    (text: string) => {
      setEvent({
        ...event,
        music: text
      });
    },
    [event, setEvent]
  );

  return (
    <View style={styles.container}>
      <Input
        placeholder="Music"
        value={event.music}
        onChangeText={setEventMusic}
        dark
        backgroundColor={colors.lightGray}
        textColor={colors.black}
        multilineProps={{ numberOfLines: 10, height: 100 }}
      />

      <SpotifyPlaylists event={event} setEvent={setEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    flex: 1,
    gap: 16,
    paddingHorizontal: 24
  }
});
