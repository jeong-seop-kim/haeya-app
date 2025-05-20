import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
// 선택한 인증 방식에 따라 아래 중 하나만 사용
// import { AuthProvider, useAuth } from "@/lib/auth/AuthContext"; // 방법 1
import {
  GoogleAuthProvider,
  useGoogleAuth,
} from "@/lib/auth/GoogleAuthProvider"; // 방법 2

// 스플래시 화면이 자동으로 숨겨지지 않도록 설정
SplashScreen.preventAutoHideAsync();

// 인증 확인 래퍼 컴포넌트
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useGoogleAuth();
  const pathname = usePathname();

  // 인증 상태에 따라 리다이렉트 처리
  useEffect(() => {
    if (isLoading) return; // 로딩 중일 때는 아무 것도 하지 않음

    if (!isAuthenticated) {
      // 로그인 안된 경우 로그인 페이지로
      if (pathname !== "/login") {
        router.replace("/login");
      }
    } else if (pathname === "/login") {
      // 이미 로그인했는데 로그인 페이지에 있으면 홈으로
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, pathname]);

  // 인증 상태에 따라 Stack.Screen을 조건부로, 무한 리다이렉트 방지
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      // 폰트가 로드되면 스플래시 화면을 숨깁니다
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // 아래는 방법 2를 사용한 렌더링입니다.
  // 방법 1을 사용하려면 GoogleAuthProvider를 AuthProvider로 교체하세요.
  return (
    <GoogleAuthProvider>
      <RootLayoutNav />
    </GoogleAuthProvider>
  );
}
