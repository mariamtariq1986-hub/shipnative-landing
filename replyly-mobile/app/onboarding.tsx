import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MessageCircle, Sparkles, Zap } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, PrimaryButton, Screen } from '../components/ui';
import { useReplyly } from '../context/ReplylyContext';
import { hapticMedium } from '../lib/haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    icon: MessageCircle,
    title: 'Reply like a pro',
    body: 'Paste a customer WhatsApp message and get three ready-to-send replies in seconds.',
  },
  {
    key: '2',
    icon: Sparkles,
    title: 'Your brand, every time',
    body: 'Save business profile, hours, and brand words. Share an invite code with staff — no cloud login required.',
  },
  {
    key: '3',
    icon: Zap,
    title: 'Built for busy shops',
    body: 'Quick intents, Arabic mix, favorites, history, and WhatsApp send — free to try, Pro when you need unlimited.',
  },
];

export default function OnboardingScreen(): React.JSX.Element {
  const { colors, completeOnboarding } = useReplyly();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const finish = async () => {
    await hapticMedium();
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const next = () => {
    if (index >= SLIDES.length - 1) {
      void finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <Screen>
      <View style={[styles.root, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.top}>
          <BrandMark size={40} />
          <Text style={[styles.brand, { color: colors.ink }]}>Replyly</Text>
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const Icon = item.icon;
            return (
              <View style={[styles.slide, { width }]}>
                <LinearGradient
                  colors={['rgba(37,211,102,0.18)', 'rgba(37,211,102,0.04)']}
                  style={styles.iconWrap}
                >
                  <Icon size={34} color={colors.leafSoft} strokeWidth={1.8} />
                </LinearGradient>
                <Text style={[styles.title, { color: colors.ink }]}>{item.title}</Text>
                <Text style={[styles.body, { color: colors.inkMuted }]}>{item.body}</Text>
              </View>
            );
          }}
        />

        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? colors.leaf : colors.border,
                  width: i === index ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <PrimaryButton label={index === SLIDES.length - 1 ? 'Get started' : 'Continue'} onPress={next} />
          {index < SLIDES.length - 1 ? (
            <Pressable onPress={() => void finish()} style={{ marginTop: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_500Medium' }}>Skip</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { fontFamily: 'Fraunces_700Bold', fontSize: 26, letterSpacing: -0.4 },
  slide: { paddingTop: 48, paddingHorizontal: 8 },
  iconWrap: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 34, letterSpacing: -0.8, marginBottom: 12 },
  body: { fontFamily: 'Outfit_400Regular', fontSize: 17, lineHeight: 26, maxWidth: 340 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 24, paddingHorizontal: 8 },
  dot: { height: 8, borderRadius: 99 },
  actions: { paddingHorizontal: 4 },
});
