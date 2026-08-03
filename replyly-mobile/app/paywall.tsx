import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field, GhostButton, PrimaryButton, Screen, Subtitle, Title } from '../components/ui';
import { useReplyly } from '../context/ReplylyContext';
import { GUMROAD_URL, PROMO_CODE } from '../lib/constants';
import { hapticSuccess } from '../lib/haptics';

const FEATURES = [
  'Unlimited reply generations',
  'Keep business profile & brand words',
  'Team invite codes',
  'History, pinned templates & stats',
  'Works offline — no API key required',
];

export default function PaywallScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, pro, unlockPro } = useReplyly();
  const [code, setCode] = useState('');

  const unlock = async () => {
    if (code.trim().toUpperCase() !== PROMO_CODE) {
      Alert.alert('Invalid code', `Try ${PROMO_CODE} after purchasing on Gumroad.`);
      return;
    }
    await unlockPro();
    await hapticSuccess();
    Alert.alert('Pro unlocked', 'Unlimited generations are now enabled on this device.');
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
        <Title>{pro ? 'You\'re on Pro' : 'Replyly Pro'}</Title>
        <Subtitle>
          {pro
            ? 'Unlimited generations unlocked on this device.'
            : 'For shops that reply all day — $12/mo via Gumroad, unlock with your code.'}
        </Subtitle>

        <LinearGradient
          colors={['rgba(37,211,102,0.22)', 'rgba(22,163,74,0.08)']}
          style={{
            marginTop: 22,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(74,222,128,0.35)',
          }}
        >
          <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_500Medium', fontSize: 13 }}>Pro</Text>
          <Text style={{ color: colors.ink, fontFamily: 'Fraunces_700Bold', fontSize: 40, marginTop: 4 }}>
            $12
            <Text style={{ fontSize: 18, fontFamily: 'Outfit_500Medium', color: colors.inkMuted }}>/mo</Text>
          </Text>
          <View style={{ marginTop: 16, gap: 10 }}>
            {FEATURES.map((f) => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 8,
                    backgroundColor: 'rgba(37,211,102,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={14} color={colors.leafSoft} />
                </View>
                <Text style={{ color: colors.ink, fontFamily: 'Outfit_400Regular', fontSize: 14.5, flex: 1 }}>{f}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {!pro ? (
          <View style={{ marginTop: 22, gap: 12 }}>
            <PrimaryButton
              label="Pay on Gumroad"
              onPress={() => void Linking.openURL(GUMROAD_URL)}
            />
            <Field
              value={code}
              onChangeText={setCode}
              placeholder={PROMO_CODE}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <GhostButton label="Unlock with code" onPress={() => void unlock()} />
            <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_400Regular', fontSize: 12, lineHeight: 18 }}>
              App Store / Play billing can be wired later via RevenueCat. For launch, Gumroad + unlock code keeps you shipping
              without IAP review complexity.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
