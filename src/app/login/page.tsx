import LoginPageContent from './LoginPageContent';
import { googleCompatibilityConfigured } from '@/lib/auth-origin';

export default function LoginPage() {
  return <LoginPageContent showGoogleCompatibility={googleCompatibilityConfigured()} />;
}
