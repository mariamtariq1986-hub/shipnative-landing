import { Redirect } from 'expo-router';
import React from 'react';
import { useReplyly } from '../context/ReplylyContext';

export default function IndexGate(): React.JSX.Element {
  const { ready, onboardingDone } = useReplyly();
  if (!ready) return <></>;
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
