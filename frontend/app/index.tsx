
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Loading from './loading';

export default function Index() {

  const {onboardingCompleted, user, loading} = useAuth();


  if (loading) {
    return <Loading spinner={true} />
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(onboarding)/calculator"/>
  }

  if (!user) {
    return <Redirect href="/loading"/>
  }
  
  return <Redirect href="/(tabs)" />;
}