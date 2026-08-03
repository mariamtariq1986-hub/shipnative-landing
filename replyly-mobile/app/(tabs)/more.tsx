import { router } from 'expo-router';
import {
  Bell,
  Building2,
  ChevronRight,
  Crown,
  Moon,
  Shield,
  Sun,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, RowSwitch, Screen, Subtitle, Title } from '../../components/ui';
import { useReplyly } from '../../context/ReplylyContext';
import { PRIVACY_URL } from '../../lib/constants';
import { cancelAllReminders, requestReminderPermission, scheduleLocalReminder } from '../../lib/notifications';
import { getNotifyPref } from '../../lib/storage';

function RowLink({
  icon: Icon,
  title,
  subtitle,
  onPress,
}: {
  icon: typeof Building2;
  title: string;
  subtitle?: string;
  onPress: () => void;
}): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: 'rgba(37,211,102,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Icon size={18} color={colors.leafSoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.ink, fontFamily: 'Outfit_600SemiBold', fontSize: 15 }}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={18} color={colors.inkFaint} />
    </Pressable>
  );
}

export default function MoreScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, themePref, setThemePreference, pro, profile } = useReplyly();
  const [reminders, setReminders] = useState(false);

  React.useEffect(() => {
    void getNotifyPref().then(setReminders);
  }, []);

  const toggleReminders = async (on: boolean) => {
    if (on) {
      const ok = await requestReminderPermission();
      setReminders(ok);
      if (ok) {
        await scheduleLocalReminder(120);
        Alert.alert('Reminders on', 'We’ll send an occasional local reminder to follow up on replies. No server required.');
      } else {
        Alert.alert('Permission needed', 'Enable notifications in system settings to use reply reminders.');
      }
    } else {
      const { setNotifyPref } = await import('../../lib/storage');
      await cancelAllReminders();
      await setNotifyPref(false);
      setReminders(false);
    }
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
        <Title>More</Title>
        <Subtitle>Profile, team, Pro, privacy, and appearance.</Subtitle>

        <Card style={{ marginTop: 22 }}>
          <RowLink
            icon={Building2}
            title="Business profile"
            subtitle={profile.name || 'Name, hours, brand words'}
            onPress={() => router.push('/profile')}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <RowLink
            icon={Users}
            title="Team invite"
            subtitle="Share profile via RPLY1 code"
            onPress={() => router.push('/team')}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <RowLink
            icon={Crown}
            title={pro ? 'Replyly Pro' : 'Upgrade to Pro'}
            subtitle={pro ? 'Unlimited generations unlocked' : '$12/mo · unlock with code'}
            onPress={() => router.push('/paywall')}
          />
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: colors.ink, fontFamily: 'Outfit_600SemiBold', fontSize: 15, marginBottom: 12 }}>
            Appearance
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {(
              [
                { id: 'system' as const, label: 'System', Icon: Sun },
                { id: 'light' as const, label: 'Light', Icon: Sun },
                { id: 'dark' as const, label: 'Dark', Icon: Moon },
              ] as const
            ).map(({ id, label, Icon }) => {
              const active = themePref === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => void setThemePreference(id)}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: active ? 'rgba(74,222,128,0.55)' : colors.border,
                    backgroundColor: active ? 'rgba(37,211,102,0.14)' : 'transparent',
                    paddingVertical: 12,
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icon size={16} color={active ? colors.leafSoft : colors.inkFaint} />
                  <Text
                    style={{
                      color: active ? colors.success : colors.inkMuted,
                      fontFamily: 'Outfit_500Medium',
                      fontSize: 12,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <RowSwitch
            label="Reply reminders"
            hint="Local notification stub — no account/server"
            value={reminders}
            onValueChange={(v) => void toggleReminders(v)}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
          <RowLink
            icon={Bell}
            title="Schedule test reminder"
            subtitle="In ~2 minutes (if enabled)"
            onPress={() => {
              void scheduleLocalReminder(2).then((id) => {
                if (!id) Alert.alert('Enable reminders first');
                else Alert.alert('Scheduled', 'A local reminder was queued for ~2 minutes.');
              });
            }}
          />
        </Card>

        <Card style={{ marginTop: 14 }}>
          <RowLink
            icon={Shield}
            title="Privacy policy"
            subtitle={PRIVACY_URL}
            onPress={() => void Linking.openURL(PRIVACY_URL)}
          />
        </Card>

        <Text
          style={{
            color: colors.inkFaint,
            fontFamily: 'Outfit_400Regular',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 28,
          }}
        >
          Replyly 1.0.0 · Store-ready Expo app
        </Text>
      </ScrollView>
    </Screen>
  );
}
