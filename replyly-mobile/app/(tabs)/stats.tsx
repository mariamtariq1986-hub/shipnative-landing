import React, { useMemo } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, GhostButton, Label, Screen, Subtitle, Title } from '../../components/ui';
import { useReplyly } from '../../context/ReplylyContext';
import { todayKey } from '../../lib/storage';

function last7Days(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }
  return out;
}

export default function StatsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, stats, pro } = useReplyly();
  const days = useMemo(() => last7Days(), []);
  const weekTotal = days.reduce((sum, d) => sum + (stats.byDay[d] || 0), 0);
  const maxDay = Math.max(1, ...days.map((d) => stats.byDay[d] || 0));
  const today = stats.byDay[todayKey()] || 0;

  const exportWeekly = async () => {
    const lines = [
      'Replyly weekly stats',
      `Week replies generated: ${weekTotal}`,
      `All-time generated: ${stats.totalGenerated}`,
      `All-time copied: ${stats.totalCopied}`,
      `Plan: ${pro ? 'Pro' : 'Free'}`,
      '',
      ...days.map((d) => `${d}: ${stats.byDay[d] || 0}`),
    ];
    await Share.share({ message: lines.join('\n') });
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
        <Title>Stats</Title>
        <Subtitle>Simple local analytics — nothing leaves your phone.</Subtitle>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_500Medium', fontSize: 12 }}>This week</Text>
            <Text style={{ color: colors.ink, fontFamily: 'Fraunces_700Bold', fontSize: 32, marginTop: 6 }}>
              {weekTotal}
            </Text>
            <Text style={{ color: colors.inkMuted, fontFamily: 'Outfit_400Regular', fontSize: 12 }}>replies</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_500Medium', fontSize: 12 }}>Copied</Text>
            <Text style={{ color: colors.ink, fontFamily: 'Fraunces_700Bold', fontSize: 32, marginTop: 6 }}>
              {stats.totalCopied}
            </Text>
            <Text style={{ color: colors.inkMuted, fontFamily: 'Outfit_400Regular', fontSize: 12 }}>all time</Text>
          </Card>
        </View>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_500Medium', fontSize: 12 }}>Today</Text>
          <Text style={{ color: colors.ink, fontFamily: 'Fraunces_700Bold', fontSize: 28, marginTop: 4 }}>{today}</Text>
        </Card>

        <View style={{ marginTop: 24 }}>
          <Label>Last 7 days</Label>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
              {days.map((d) => {
                const v = stats.byDay[d] || 0;
                const h = Math.max(6, Math.round((v / maxDay) * 100));
                return (
                  <View key={d} style={{ alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 18,
                        height: h,
                        borderRadius: 8,
                        backgroundColor: v ? colors.leaf : colors.border,
                      }}
                    />
                    <Text style={{ color: colors.inkFaint, fontSize: 10, marginTop: 6, fontFamily: 'Outfit_400Regular' }}>
                      {d.slice(8)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        <View style={{ marginTop: 18 }}>
          <GhostButton label="Export weekly summary" onPress={() => void exportWeekly()} />
        </View>
      </ScrollView>
    </Screen>
  );
}
