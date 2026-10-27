
import { Redirect } from 'expo-router';

export default function Index() {
  // Automatically pushes the user to the login screen
  return <Redirect href="/loading" />;
}