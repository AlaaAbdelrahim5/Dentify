import { Redirect } from "expo-router";

export default function Index() {
  // Direct redirect to login page
  return <Redirect href="/(auth)/login" />;
}
