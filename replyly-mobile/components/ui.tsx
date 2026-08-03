import { LinearGradient } from 'expo-linear-gradient';
import { Inbox } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useReplyly } from '../context/ReplylyContext';
import { hapticLight } from '../lib/haptics';
import { radii, space } from '../lib/theme';

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}): React.JSX.Element {
  const { colors, themeMode } = useReplyly();
  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }, style]}>
      {themeMode === 'dark' ? (
        <LinearGradient
          colors={['rgba(37,211,102,0.14)', 'transparent', 'rgba(18,140,74,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : (
        <LinearGradient
          colors={['rgba(37,211,102,0.12)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

export function BrandMark({ size = 36 }: { size?: number }): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: 'rgba(37,211,102,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(74,222,128,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.leafSoft, fontSize: size * 0.42, fontFamily: 'Outfit_700Bold' }}>R</Text>
    </View>
  );
}

export function Title({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <Text style={{ color: colors.ink, fontSize: 28, fontFamily: 'Fraunces_700Bold', letterSpacing: -0.5 }}>
      {children}
    </Text>
  );
}

export function Subtitle({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <Text style={{ color: colors.inkMuted, fontSize: 15, lineHeight: 22, fontFamily: 'Outfit_400Regular', marginTop: 6 }}>
      {children}
    </Text>
  );
}

export function Label({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <Text
      style={{
        color: colors.inkFaint,
        fontSize: 11,
        fontFamily: 'Outfit_600SemiBold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <Pressable
      onPress={() => {
        void hapticLight();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? 'rgba(37,211,102,0.22)' : colors.card,
          borderColor: active ? 'rgba(74,222,128,0.55)' : colors.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text
        style={{
          color: active ? colors.success : colors.inkMuted,
          fontFamily: 'Outfit_500Medium',
          fontSize: 13.5,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.55 : pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
    >
      <LinearGradient
        colors={['#2be06f', '#25d366', '#16a34a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryBtn}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontFamily: 'Outfit_700Bold', fontSize: 16 }}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghostBtn,
        {
          borderColor: danger ? colors.danger : colors.border,
          backgroundColor: colors.card,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ color: danger ? colors.danger : colors.ink, fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <TextInput
      placeholderTextColor={colors.inkFaint}
      {...props}
      style={[
        styles.field,
        {
          color: colors.ink,
          backgroundColor: colors.bgMuted,
          borderColor: colors.border,
        },
        props.style,
      ]}
    />
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 36 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: 'rgba(37,211,102,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Inbox size={24} color={colors.leafSoft} />
      </View>
      <Text style={{ color: colors.ink, fontFamily: 'Fraunces_600SemiBold', fontSize: 20 }}>{title}</Text>
      <Text
        style={{
          color: colors.inkMuted,
          fontFamily: 'Outfit_400Regular',
          fontSize: 14,
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 21,
          paddingHorizontal: 12,
        }}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <View style={{ marginTop: 18, alignSelf: 'stretch' }}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </Card>
  );
}

export function RowSwitch({
  label,
  value,
  onValueChange,
  hint,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  hint?: string;
}): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <View style={styles.rowSwitch}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: colors.ink, fontFamily: 'Outfit_600SemiBold', fontSize: 15 }}>{label}</Text>
        {hint ? (
          <Text style={{ color: colors.inkFaint, fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 3 }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.leaf }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function Badge({ text, accent }: { text: string; accent?: boolean }): React.JSX.Element {
  const { colors } = useReplyly();
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: radii.pill,
        backgroundColor: accent ? 'rgba(37,211,102,0.15)' : colors.card,
        borderWidth: 1,
        borderColor: accent ? 'rgba(74,222,128,0.35)' : colors.border,
      }}
    >
      <Text
        style={{
          color: accent ? colors.success : colors.inkMuted,
          fontFamily: 'Outfit_500Medium',
          fontSize: 12,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  ghostBtn: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: space.md,
  },
  field: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: space.md,
  },
  rowSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
