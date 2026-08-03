import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import {
  ClipboardPaste,
  Copy,
  ExternalLink,
  Heart,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Badge,
  BrandMark,
  Card,
  Chip,
  Field,
  Label,
  PrimaryButton,
  RowSwitch,
  Screen,
} from '../../components/ui';
import { useReplyly } from '../../context/ReplylyContext';
import { BIZ, INTENTS, TONES, type IntentId } from '../../lib/constants';
import { generateTemplateReplies, smartSuggestionChips, timeOfDayGreeting, waMeUrl } from '../../lib/engine';
import { hapticMedium, hapticSuccess } from '../../lib/haptics';
import { maybeAskForRating } from '../../lib/rating';
import { bumpCopied, bumpGenerated, consumeGeneration, pushHistory } from '../../lib/storage';

export default function GenerateScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const {
    colors,
    pro,
    remaining,
    refreshUsage,
    biz,
    setBiz,
    tone,
    setTone,
    arabic,
    setArabic,
    profile,
    recentIntents,
    rememberIntent,
    pinFavorite,
    reloadHistory,
    reloadStats,
  } = useReplyly();

  const [message, setMessage] = useState('');
  const [forcedIntent, setForcedIntent] = useState<IntentId | null>(null);
  const [replies, setReplies] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const greeting = useMemo(
    () => timeOfDayGreeting(profile.name || undefined),
    [profile.name],
  );
  const smart = useMemo(() => smartSuggestionChips(), [replies.length]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text.trim()) {
      Alert.alert('Clipboard empty', 'Copy a customer message from WhatsApp, then paste here.');
      return;
    }
    setMessage(text.trim());
    void hapticMedium();
    showToast('Pasted from clipboard');
  };

  const onGenerate = async () => {
    if (!message.trim() && !forcedIntent) {
      Alert.alert('Add a message', 'Paste a customer message or tap a quick intent first.');
      return;
    }
    const ok = await consumeGeneration();
    if (!ok) {
      Alert.alert('Daily limit reached', 'Free plan includes 5 generations/day. Upgrade to Pro for unlimited.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'See Pro', onPress: () => router.push('/paywall') },
      ]);
      return;
    }

    setBusy(true);
    try {
      if (forcedIntent) await rememberIntent(forcedIntent);
      const out = generateTemplateReplies(message, biz, tone, arabic, profile, forcedIntent);
      setReplies(out);
      const intentLabel = forcedIntent || 'auto';
      await pushHistory(out, intentLabel);
      await bumpGenerated(out.length);
      await reloadHistory();
      await reloadStats();
      await refreshUsage();
      await hapticSuccess();
    } finally {
      setBusy(false);
    }
  };

  const copyReply = async (text: string) => {
    await Clipboard.setStringAsync(text);
    await bumpCopied();
    await reloadStats();
    await hapticSuccess();
    showToast('Copied');
    void maybeAskForRating();
  };

  const shareReply = async (text: string) => {
    await Share.share({ message: text });
    void hapticMedium();
  };

  const openWhatsApp = async (text: string) => {
    const url = waMeUrl(text, profile.whatsapp);
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert('WhatsApp unavailable', 'Could not open WhatsApp on this device.');
      return;
    }
    await Linking.openURL(url);
  };

  const usageLabel = pro
    ? 'Pro · unlimited'
    : `${Number.isFinite(remaining) ? remaining : 0} left today`;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 18,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <BrandMark />
            <View>
              <Text style={[styles.brand, { color: colors.ink }]}>Replyly</Text>
              <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_400Regular', fontSize: 12 }}>
                {greeting}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/paywall')}>
            <Badge text={usageLabel} accent={pro} />
          </Pressable>
        </View>

        <Text style={[styles.lede, { color: colors.inkMuted }]}>
          For messages bots can&apos;t handle — paste a WhatsApp message, pick an intent, get 3 replies.
        </Text>

        <Label>Smart for right now</Label>
        <View style={styles.wrap}>
          {smart.map((s) => (
            <Chip
              key={s.id}
              label={s.hint}
              active={forcedIntent === s.id}
              onPress={() => setForcedIntent(forcedIntent === s.id ? null : s.id)}
            />
          ))}
        </View>

        {(recentIntents.length > 0 || true) && (
          <>
            <Label>Quick intents</Label>
            <View style={styles.wrap}>
              {INTENTS.map((intent) => {
                const label = arabic ? `${intent.label} · ${intent.labelAr}` : intent.label;
                return (
                  <Chip
                    key={intent.id}
                    label={label}
                    active={forcedIntent === intent.id}
                    onPress={() => setForcedIntent(forcedIntent === intent.id ? null : intent.id)}
                  />
                );
              })}
            </View>
          </>
        )}

        <Label>Customer message</Label>
        <Field
          value={message}
          onChangeText={setMessage}
          placeholder="Paste the customer WhatsApp message…"
          multiline
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
        <Pressable onPress={() => void pasteFromClipboard()} style={[styles.pasteBtn, { borderColor: colors.border }]}>
          <ClipboardPaste size={16} color={colors.leafSoft} />
          <Text style={{ color: colors.ink, fontFamily: 'Outfit_500Medium', marginLeft: 8 }}>
            Paste from WhatsApp
          </Text>
        </Pressable>

        <Label>Business type</Label>
        <View style={styles.wrap}>
          {BIZ.map((b) => (
            <Chip key={b.id} label={b.label} active={biz === b.id} onPress={() => void setBiz(b.id)} />
          ))}
        </View>

        <Label>Tone</Label>
        <View style={styles.wrap}>
          {TONES.map((t) => (
            <Chip key={t.id} label={t.label} active={tone === t.id} onPress={() => void setTone(t.id)} />
          ))}
        </View>

        <Card style={{ marginBottom: 18 }}>
          <RowSwitch
            label="Arabic-friendly mix"
            hint="Add natural bilingual touches"
            value={arabic}
            onValueChange={(v) => void setArabic(v)}
          />
        </Card>

        {replies.length > 0 ? (
          <View style={{ gap: 12, marginBottom: 16 }}>
            <Label>Suggestions</Label>
            {replies.map((text, i) => (
              <Card key={`${i}-${text.slice(0, 12)}`}>
                <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_500Medium', fontSize: 12, marginBottom: 8 }}>
                  Reply {i + 1}
                </Text>
                <Text style={{ color: colors.ink, fontFamily: 'Outfit_400Regular', fontSize: 15.5, lineHeight: 23 }}>
                  {text}
                </Text>
                <View style={styles.actionRow}>
                  <Action icon={Copy} label="Copy" onPress={() => void copyReply(text)} color={colors.leafSoft} />
                  <Action icon={Share2} label="Share" onPress={() => void shareReply(text)} color={colors.leafSoft} />
                  <Action
                    icon={ExternalLink}
                    label="WhatsApp"
                    onPress={() => void openWhatsApp(text)}
                    color={colors.leafSoft}
                  />
                  <Action
                    icon={Heart}
                    label="Pin"
                    onPress={() => {
                      void pinFavorite(text, forcedIntent || 'Pinned');
                      showToast('Pinned');
                      void hapticMedium();
                    }}
                    color={colors.leafSoft}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.sticky,
          {
            paddingBottom: insets.bottom + 10,
            backgroundColor: colors.bg,
            borderTopColor: colors.border,
          },
        ]}
      >
        <PrimaryButton
          label={busy ? 'Generating…' : 'Generate 3 replies'}
          onPress={() => void onGenerate()}
          loading={busy}
          disabled={busy}
        />
        <View style={styles.stickyHint}>
          <Sparkles size={14} color={colors.inkFaint} />
          <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_400Regular', fontSize: 12, marginLeft: 6 }}>
            Works offline · no API key required
          </Text>
        </View>
      </View>

      {toast ? (
        <View style={[styles.toast, { backgroundColor: colors.leafDeep }]}>
          <Text style={{ color: '#fff', fontFamily: 'Outfit_600SemiBold' }}>{toast}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

function Action({
  icon: Icon,
  label,
  onPress,
  color,
}: {
  icon: typeof Copy;
  label: string;
  onPress: () => void;
  color: string;
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Icon size={15} color={color} />
      <Text style={{ color, fontFamily: 'Outfit_500Medium', fontSize: 12, marginLeft: 5 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brand: { fontFamily: 'Fraunces_700Bold', fontSize: 22, letterSpacing: -0.4 },
  lede: { fontFamily: 'Outfit_400Regular', fontSize: 14.5, lineHeight: 21, marginBottom: 20 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  pasteBtn: {
    marginTop: 10,
    marginBottom: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(37,211,102,0.10)',
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stickyHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
});
