import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, EmptyState, GhostButton, Screen, Subtitle, Title } from '../../components/ui';
import { useReplyly } from '../../context/ReplylyContext';
import { hapticSuccess } from '../../lib/haptics';
import { bumpCopied } from '../../lib/storage';
import { maybeAskForRating } from '../../lib/rating';

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - (Number(ts) || 0);
  if (!ts || diff < 0) return '';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HistoryScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, history, wipeHistory, reloadStats } = useReplyly();

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    await bumpCopied();
    await reloadStats();
    await hapticSuccess();
    void maybeAskForRating();
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 18,
        }}
      >
        <Title>History</Title>
        <Subtitle>Last 20 generated replies on this device.</Subtitle>

        {history.length === 0 ? (
          <View style={{ marginTop: 28 }}>
            <EmptyState
              title="No replies yet"
              description="Generate a few suggestions on the home tab — they’ll show up here for quick re-copy."
            />
          </View>
        ) : (
          <View style={{ marginTop: 22, gap: 12 }}>
            {history.map((item) => (
              <Card key={item.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: colors.leafSoft, fontFamily: 'Outfit_500Medium', fontSize: 12 }}>
                    {item.intent || 'reply'}
                  </Text>
                  <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_400Regular', fontSize: 12 }}>
                    {formatRelativeTime(item.at)}
                  </Text>
                </View>
                <Text style={{ color: colors.ink, fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 22 }}>
                  {item.text}
                </Text>
                <Pressable onPress={() => void copy(item.text)} style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.leaf, fontFamily: 'Outfit_600SemiBold', fontSize: 13 }}>Copy again</Text>
                </Pressable>
              </Card>
            ))}
            <GhostButton
              label="Clear history"
              danger
              onPress={() =>
                Alert.alert('Clear history?', 'This only removes local history on this phone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: () => void wipeHistory() },
                ])
              }
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
