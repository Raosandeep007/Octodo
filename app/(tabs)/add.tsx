import { Redirect } from 'expo-router';

// This tab triggers a modal, so we redirect to the main tab
export default function AddTab() {
  return <Redirect href="/" />;
}
