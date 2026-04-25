import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SocketProvider } from '../context/SocketContext';

export default function RootLayout() {
  return (
    <SocketProvider>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#f9fafb' } // Light, clean modern background
      }}>
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="dark" />
    </SocketProvider>
  );
}
