import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field, GhostButton, Label, PrimaryButton, Screen, Subtitle, Title } from '../components/ui';
import { useReplyly } from '../context/ReplylyContext';
import { BIZ, type BizId, type TeamState } from '../lib/constants';
import { decodeInvite, encodeInvite } from '../lib/engine';
import { hapticSuccess } from '../lib/haptics';

export default function TeamScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, profile, team, updateTeam, updateProfile, setBiz } = useReplyly();
  const [form, setForm] = useState<TeamState>(team);
  const [inviteIn, setInviteIn] = useState('');
  const [inviteOut, setInviteOut] = useState(team.lastInvite);

  const createInvite = async () => {
    const code = encodeInvite(profile, form);
    const next = { ...form, lastInvite: code };
    setForm(next);
    setInviteOut(code);
    await updateTeam(next);
    await hapticSuccess();
  };

  const copyInvite = async () => {
    if (!inviteOut) return;
    await Clipboard.setStringAsync(inviteOut);
    await hapticSuccess();
    Alert.alert('Copied', 'Invite code copied. Paste it on each staff phone.');
  };

  const importInvite = async () => {
    try {
      const data = decodeInvite(inviteIn);
      await updateProfile({
        name: data.profile.name || '',
        type: data.profile.type || '',
        services: data.profile.services || '',
        hours: data.profile.hours || '',
        location: data.profile.location || '',
        whatsapp: data.profile.whatsapp || '',
        neverSay: data.profile.neverSay || '',
        alwaysSay: data.profile.alwaysSay || '',
      });
      const importedType = data.profile.type;
      if (BIZ.some((b) => b.id === importedType)) {
        await setBiz(importedType as BizId);
      }
      const staff: [string, string, string] = ['', '', ''];
      data.staff.slice(0, 3).forEach((s, i) => {
        staff[i] = s;
      });
      const next: TeamState = {
        teamName: data.teamName || form.teamName,
        staff,
        activeStaff: 0,
        lastInvite: inviteIn.trim(),
      };
      setForm(next);
      await updateTeam(next);
      await hapticSuccess();
      Alert.alert('Imported', 'Shared profile applied on this device. No live cloud sync — re-import when it changes.');
    } catch (e) {
      Alert.alert('Invalid code', e instanceof Error ? e.message : 'Could not import invite.');
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.leaf, fontFamily: 'Outfit_600SemiBold' }}>Close</Text>
        </Pressable>
        <Title>Team mode</Title>
        <Subtitle>Share profile with 2–3 staff via a base64 invite code (same as web Replyly).</Subtitle>

        <View style={{ marginTop: 20, gap: 14 }}>
          <View>
            <Label>Team label</Label>
            <Field
              value={form.teamName}
              onChangeText={(v) => setForm((p) => ({ ...p, teamName: v }))}
              placeholder="Front desk"
            />
          </View>
          {([0, 1, 2] as const).map((i) => (
            <View key={i}>
              <Label>{`Staff ${i + 1}`}</Label>
              <Field
                value={form.staff[i]}
                onChangeText={(v) =>
                  setForm((p) => {
                    const staff = [...p.staff] as [string, string, string];
                    staff[i] = v;
                    return { ...p, staff };
                  })
                }
                placeholder={`Name ${i + 1}`}
              />
            </View>
          ))}

          <PrimaryButton label="Create invite code" onPress={() => void createInvite()} />
          {inviteOut ? (
            <>
              <Field value={inviteOut} editable={false} multiline style={{ minHeight: 90 }} />
              <GhostButton label="Copy invite code" onPress={() => void copyInvite()} />
            </>
          ) : null}

          <View style={{ height: 8 }} />
          <Label>Import shared profile</Label>
          <Field
            value={inviteIn}
            onChangeText={setInviteIn}
            placeholder="Paste RPLY1.… code"
            multiline
            style={{ minHeight: 90, textAlignVertical: 'top' }}
          />
          <PrimaryButton label="Import invite" onPress={() => void importInvite()} />

          <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_400Regular', fontSize: 12, lineHeight: 18 }}>
            Limitation: no live cloud sync. Paste a fresh code on each device when the profile changes.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
