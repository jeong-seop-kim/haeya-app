import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 선택한 인증 방식에 따라 아래 중 하나만 사용
// import { useAuth } from "@/lib/auth/AuthContext"; // 방법 1
import { useGoogleAuth } from "@/lib/auth/GoogleAuthProvider"; // 방법 2

export default function LoginScreen() {
  // 선택한 인증 방식에 따라 아래 중 하나만 사용
  // const { signIn, isLoading } = useAuth(); // 방법 1
  const { signIn, isLoading } = useGoogleAuth(); // 방법 2

  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState(false);

  // 리다이렉트 로직 제거 - _layout.tsx에서 처리

  // 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      setLoggingIn(true);
      await signIn();

      // 방법 1 사용시에만 필요 (웹뷰 닫기)
      // setTimeout(() => {
      //   WebBrowser.dismissBrowser();
      // }, 1500);

      router.replace("/"); // 로그인 성공 후 홈으로 이동
    } catch (error) {
      console.error(error);
      // 방법 1 사용시에만 필요
      // WebBrowser.dismissBrowser();
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>해야</Text>
        <Text style={styles.subtitle}>당신의 일상을 더 즐겁게</Text>
      </View>

      <View style={styles.footer}>
        {isLoading || loggingIn ? (
          <ActivityIndicator size="large" color="#4285F4" />
        ) : (
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconContainer}>
              <Ionicons name="logo-google" size={24} color="#4285F4" />
            </View>
            <Text style={styles.buttonText}>구글 계정으로 로그인</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  header: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 48,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  googleIconContainer: {
    marginRight: 24,
  },
  buttonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
});
