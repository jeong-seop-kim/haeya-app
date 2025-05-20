import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import React, { createContext, useContext, useEffect, useState } from "react";

import { AuthContextType, User } from "./types";

// Google 클라이언트 ID 설정
const WEB_CLIENT_ID =
  "388595372908-s04mptr9nq7vpuu3bqh3c4ininlqkgmv.apps.googleusercontent.com";
const STORAGE_KEY = "auth_user";

// 기본 컨텍스트 값
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
};

// 구글 인증 컨텍스트 생성
const GoogleAuthContext = createContext<AuthContextType>(defaultContext);

// 초기화 함수
const initializeGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID, // 웹 클라이언트 ID
    iosClientId:
      "388595372908-gm5av1a6nf92pi8t6kjhii5du01j9h3s.apps.googleusercontent.com",
    offlineAccess: true, // 리프레시 토큰 요청 (선택)
    forceCodeForRefreshToken: true, // 리프레시 토큰을 위한 코드 강제 요청 (선택)
  });
};

// Google 인증 제공자 컴포넌트
export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 구글 로그인 초기화
  useEffect(() => {
    initializeGoogleSignIn();
    loadUserFromStorage();
  }, []);

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

  // 구글 로그인 함수
  const signIn = async () => {
    try {
      // Play 서비스 사용 가능 확인 (Android 전용)
      await GoogleSignin.hasPlayServices();

      // 구글 로그인 실행
      const userInfo = (await GoogleSignin.signIn()) as any;
      console.log("🚀 ~ signIn ~ userInfo:", userInfo);

      // 사용자 데이터 처리
      const userData: User = {
        id: userInfo.data?.user?.id || String(Date.now()),
        email: userInfo.data?.user?.email || "",
        name: userInfo.data?.user?.name || "",
        picture: userInfo.data?.user?.photo || undefined,
      };

      // 사용자 정보 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      return userInfo;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("로그인이 취소되었습니다");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("로그인이 이미 진행 중입니다");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play 서비스를 사용할 수 없습니다");
      } else {
        console.error("로그인 오류:", error);
      }
    }
  };

  // 로그아웃 함수
  const signOut = async () => {
    try {
      // 구글 로그아웃 실행
      await GoogleSignin.signOut();
      // 로컬 스토리지에서 사용자 정보 제거
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("로그아웃 오류:", error);
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

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

// 구글 인증 컨텍스트 사용 훅
export const useGoogleAuth = () => useContext(GoogleAuthContext);
