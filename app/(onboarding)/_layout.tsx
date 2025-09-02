import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="skills" />
      <Stack.Screen name="tools" />
      <Stack.Screen name="availability" />
    </Stack>
  );
}
