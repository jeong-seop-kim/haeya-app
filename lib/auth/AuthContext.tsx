import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useContext, useEffect, useState } from "react";

import { AuthContextType, User } from "./types";

// Google 인증 웹 요청을 위한 설정
WebBrowser.maybeCompleteAuthSession();

// Google OAuth 클라이언트 ID - 각 플랫폼별로 설정
const WEB_CLIENT_ID =
  "388595372908-s04mptr9nq7vpuu3bqh3c4ininlqkgmv.apps.googleusercontent.com";
const IOS_CLIENT_ID = "YOUR_IOS_CLIENT_ID"; // iOS 클라이언트 ID (필요시 추가)
const ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID"; // Android 클라이언트 ID (필요시 추가)
const STORAGE_KEY = "auth_user";

// 기본 컨텍스트 값
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
};

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(defaultContext);

// 인증 컨텍스트 제공자 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google 인증 요청 설정 - 딥링크 방식으로 변경
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID, // 웹 클라이언트
    iosClientId: IOS_CLIENT_ID, // iOS 클라이언트
    androidClientId: ANDROID_CLIENT_ID, // Android 클라이언트
    redirectUri: makeRedirectUri({
      scheme: "haeyaexpo", // 앱 스킴
      path: "oauth2redirect/google", // 경로 설정
    }),
    // useProxy 옵션 제거 (SDK 48부터 폐기됨)
    scopes: ["profile", "email"],
  });

  // 저장된 사용자 정보 불러오기
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // 인증 응답 처리
  useEffect(() => {
    if (response?.type === "success") {
      // 브라우저 강제 종료
      WebBrowser.dismissBrowser();

      const { authentication } = response;
      fetchUserInfo(authentication?.accessToken);
    }
  }, [response]);

  // 저장된 사용자 정보 불러오기
  const loadUserFromStorage = async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 인증을 통해 사용자 정보 가져오기
  const fetchUserInfo = async (token?: string) => {
    if (!token) return;

    try {
      // v3 API 엔드포인트로 업데이트
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData = await response.json();

      const user: User = {
        id: userData.sub, // v3 API에서는 'sub'가 사용자 ID임
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      };

      // 사용자 정보 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인
  const signIn = async () => {
    try {
      // useProxy 없이 호출
      const result = await promptAsync();

      // 명시적으로 브라우저 닫기 (로그인 성공 여부와 관계없이)
      setTimeout(() => {
        WebBrowser.dismissBrowser();
      }, 1000);

      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      WebBrowser.dismissBrowser();
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // 컨텍스트 값
  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => useContext(AuthContext);
