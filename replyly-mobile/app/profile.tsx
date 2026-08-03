import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field, Label, PrimaryButton, Screen, Subtitle, Title } from '../components/ui';
import { useReplyly } from '../context/ReplylyContext';
import { BIZ, type BusinessProfile } from '../lib/constants';
import { hapticSuccess } from '../lib/haptics';

export default function ProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, profile, updateProfile, setBiz } = useReplyly();
  const [form, setForm] = useState<BusinessProfile>(profile);

  const set = (key: keyof BusinessProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    await updateProfile({
      ...form,
      name: form.name.trim(),
      services: form.services.trim(),
      hours: form.hours.trim(),
      location: form.location.trim(),
      whatsapp: form.whatsapp.trim(),
      neverSay: form.neverSay.trim(),
      alwaysSay: form.alwaysSay.trim(),
    });
    if (form.type) await setBiz(form.type as typeof BIZ[number]['id']);
    await hapticSuccess();
    Alert.alert('Saved', 'Business profile updated on this device.');
    router.back();
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
        <Title>Business profile</Title>
        <Subtitle>Replies use your name, hours, services, area, and brand words.</Subtitle>

        <View style={{ marginTop: 20, gap: 14 }}>
          <View>
            <Label>Business name</Label>
            <Field value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Bloom Salon" />
          </View>
          <View>
            <Label>Type</Label>
            <Field
              value={form.type}
              onChangeText={(v) => set('type', v)}
              placeholder="salon / clinic / restaurant…"
            />
          </View>
          <View>
            <Label>Services / prices</Label>
            <Field
              value={form.services}
              onChangeText={(v) => set('services', v)}
              placeholder="Haircut 80, Color from 220…"
              multiline
              style={{ minHeight: 88, textAlignVertical: 'top' }}
            />
          </View>
          <View>
            <Label>Hours</Label>
            <Field value={form.hours} onChangeText={(v) => set('hours', v)} placeholder="Sat–Thu 10am–8pm" />
          </View>
          <View>
            <Label>Location</Label>
            <Field value={form.location} onChangeText={(v) => set('location', v)} placeholder="JLT, Dubai" />
          </View>
          <View>
            <Label>WhatsApp number</Label>
            <Field
              value={form.whatsapp}
              onChangeText={(v) => set('whatsapp', v)}
              placeholder="9715…"
              keyboardType="phone-pad"
            />
          </View>
          <View>
            <Label>Never say (comma-separated)</Label>
            <Field
              value={form.neverSay}
              onChangeText={(v) => set('neverSay', v)}
              placeholder="cheap, asap, bro"
            />
          </View>
          <View>
            <Label>Always say (comma-separated)</Label>
            <Field
              value={form.alwaysSay}
              onChangeText={(v) => set('alwaysSay', v)}
              placeholder="Dr., Happy to help"
            />
          </View>
          <PrimaryButton label="Save profile" onPress={() => void save()} />
        </View>
      </ScrollView>
    </Screen>
  );
}
