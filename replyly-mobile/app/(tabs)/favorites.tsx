import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, EmptyState, Screen, Subtitle, Title } from '../../components/ui';
import { useReplyly } from '../../context/ReplylyContext';
import { hapticSuccess } from '../../lib/haptics';

export default function FavoritesScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, favorites, unpinFavorite } = useReplyly();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 18,
        }}
      >
        <Title>Pinned</Title>
        <Subtitle>Favorite reply templates you reuse across customers.</Subtitle>

        {favorites.length === 0 ? (
          <View style={{ marginTop: 28 }}>
            <EmptyState
              title="Nothing pinned"
              description="Tap Pin on any generated reply to keep your best templates here."
            />
          </View>
        ) : (
          <View style={{ marginTop: 22, gap: 12 }}>
            {favorites.map((item) => (
              <Card key={item.id}>
                <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_500Medium', fontSize: 12, marginBottom: 8 }}>
                  {item.label}
                </Text>
                <Text style={{ color: colors.ink, fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 22 }}>
                  {item.text}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                  <Pressable
                    onPress={() => {
                      void Clipboard.setStringAsync(item.text);
                      void hapticSuccess();
                    }}
                  >
                    <Text style={{ color: colors.leaf, fontFamily: 'Outfit_600SemiBold', fontSize: 13 }}>Copy</Text>
                  </Pressable>
                  <Pressable onPress={() => void Share.share({ message: item.text })}>
                    <Text style={{ color: colors.leaf, fontFamily: 'Outfit_600SemiBold', fontSize: 13 }}>Share</Text>
                  </Pressable>
                  <Pressable onPress={() => void unpinFavorite(item.id)}>
                    <Text style={{ color: colors.danger, fontFamily: 'Outfit_600SemiBold', fontSize: 13 }}>Unpin</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
