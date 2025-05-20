import { useGoogleAuth } from "@/lib/auth/GoogleAuthProvider";
import { CustomWebView } from "../components/CustomWebView";

export default function TabTwoScreen() {
  const { user } = useGoogleAuth();
  return (
    <CustomWebView token={user?.token} uri="https://haeya-sunit.vercel.app/" />
  );
}
