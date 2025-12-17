import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/index" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/patient/PatientOverview" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/dentist/DentistOverview" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard/secretary/SecretaryOverview" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
