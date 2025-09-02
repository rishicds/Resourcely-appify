import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Rooms",
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="room/[id]" 
        options={{ 
          title: "Room",
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
