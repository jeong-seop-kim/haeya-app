import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface CustomWebViewProps {
  uri: string;
  onLogout?: () => void;
  token?: string; // 외부에서 토큰을 받을 수 있도록 prop 추가
}

// 웹뷰와 네이티브 앱 간의 통신을 위한 타입 정의
type WebViewMessage = {
  type: "COOKIE_CHECK" | "LOGOUT" | "ERROR" | string;
  data?: any;
  cookies?: string;
  error?: string;
};

export function formatTokenForSupabase(token?: string): string {
  if (!token) return "";

  const tokenArray = [token, null, null, null, null];

  // JSON 문자열로 변환
  const tokenString = JSON.stringify(tokenArray);

  // URL 인코딩 (이미 인코딩된 경우 두 번 하지 않음)
  if (token.includes("%")) {
    return token; // 이미 인코딩된 경우 그대로 반환
  }

  return encodeURIComponent(tokenString);
}

export function CustomWebView({ uri, onLogout, token }: CustomWebViewProps) {
  console.log("🚀 ~ CustomWebView ~ token:", token);
  const formattedToken =
    "%5B%22eyJhbGciOiJIUzI1NiIsImtpZCI6Im52eDRSL1cxOGlkZDhtZloiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2t4dWl4eGV4cmRqYWJzenpoZW96LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkMmNiMjE2OC1iMTlkLTQ1MWItYTYwYS1mZTc0NWM3OTI5ZjgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQ3NzMyMjcyLCJpYXQiOjE3NDc3Mjg2NzIsImVtYWlsIjoianNlb2Iua2ltQHB5bGVyLnRlY2giLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w3NkdjRkJ1bW9yeW5qTXphRHd3Q2o3ME4wT2Y2bHQtOFpTb01NczVKRHBuN1lmZz1zOTYtYyIsImN1c3RvbV9jbGFpbXMiOnsiaGQiOiJweWxlci50ZWNoIn0sImVtYWlsIjoianNlb2Iua2ltQHB5bGVyLnRlY2giLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoi6rmA7KCV7IStIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6Iuq5gOygleyErSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w3NkdjRkJ1bW9yeW5qTXphRHd3Q2o3ME4wT2Y2bHQtOFpTb01NczVKRHBuN1lmZz1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTAwNTIzODY4NTMwMzk4MTQ0NjY2Iiwic3ViIjoiMTAwNTIzODY4NTMwMzk4MTQ0NjY2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib2F1dGgiLCJ0aW1lc3RhbXAiOjE3NDc3Mjg2NzJ9XSwic2Vzc2lvbl9pZCI6ImJlNTlmMzc0LThiM2UtNDE3NC1iM2U2LTRlYmUzMWQ0OTcwYSIsImlzX2Fub255bW91cyI6ZmFsc2V9.Hp45bK48XERikvfQt6Vsxrk5ueD5JqUQT974tOms2jU%22%2C%22vdvveodgxluy%22%2Cnull%2Cnull%2Cnull%5D";

  const webViewRef = useRef<WebView>(null);
  const router = useRouter();

  // 쿠키 설정을 위한 JavaScript 코드 생성 함수
  const generateCookieScript = (authToken?: string) => {
    const cookieValue =
      "%5B%22eyJhbGciOiJIUzI1NiIsImtpZCI6Im52eDRSL1cxOGlkZDhtZloiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2t4dWl4eGV4cmRqYWJzenpoZW96LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkMmNiMjE2OC1iMTlkLTQ1MWItYTYwYS1mZTc0NWM3OTI5ZjgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQ3NzMyMjcyLCJpYXQiOjE3NDc3Mjg2NzIsImVtYWlsIjoianNlb2Iua2ltQHB5bGVyLnRlY2giLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w3NkdjRkJ1bW9yeW5qTXphRHd3Q2o3ME4wT2Y2bHQtOFpTb01NczVKRHBuN1lmZz1zOTYtYyIsImN1c3RvbV9jbGFpbXMiOnsiaGQiOiJweWxlci50ZWNoIn0sImVtYWlsIjoianNlb2Iua2ltQHB5bGVyLnRlY2giLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoi6rmA7KCV7IStIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6Iuq5gOygleyErSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w3NkdjRkJ1bW9yeW5qTXphRHd3Q2o3ME4wT2Y2bHQtOFpTb01NczVKRHBuN1lmZz1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTAwNTIzODY4NTMwMzk4MTQ0NjY2Iiwic3ViIjoiMTAwNTIzODY4NTMwMzk4MTQ0NjY2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib2F1dGgiLCJ0aW1lc3RhbXAiOjE3NDc3Mjg2NzJ9XSwic2Vzc2lvbl9pZCI6ImJlNTlmMzc0LThiM2UtNDE3NC1iM2U2LTRlYmUzMWQ0OTcwYSIsImlzX2Fub255bW91cyI6ZmFsc2V9.Hp45bK48XERikvfQt6Vsxrk5ueD5JqUQT974tOms2jU%22%2C%22vdvveodgxluy%22%2Cnull%2Cnull%2Cnull%5D";

    return `
    (function() {
      document.cookie = "sb-kxuixxexrdjabszzheoz-auth-token=${cookieValue}; path=/; max-age=31536000;";
      
      // 쿠키 설정 확인
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'COOKIE_CHECK', 
        cookies: document.cookie
      }));
  
      // 웹사이트 내에서 네이티브 앱과 통신할 수 있는 함수 등록
      window.nativeApp = {
        logout: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOGOUT'
          }));
        },
        sendMessage: function(messageType, data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: messageType,
            data: data
          }));
        }
      };
      
      // 로그아웃 버튼이나 특정 요소에 이벤트 리스너 추가 예시
      document.addEventListener('click', function(e) {
        // 로그아웃 버튼에 data-action="logout" 속성이 있는 경우 처리
        if (e.target && e.target.dataset && e.target.dataset.action === 'logout') {
          window.nativeApp.logout();
        }
      });
      
      true;
    })();
    `;
  };

  // 현재 토큰으로 쿠키 스크립트 생성
  const INJECTED_JAVASCRIPT = generateCookieScript(formattedToken);

  // 토큰이 변경되면 쿠키 업데이트
  useEffect(() => {
    if (webViewRef.current && formattedToken) {
      const updateCookieScript = `
        document.cookie = "sb-kxuixxexrdjabszzheoz-auth-token=${formattedToken}; path=/; max-age=31536000;";
        console.log("토큰이 업데이트되었습니다.");
        true;
      `;
      webViewRef.current.injectJavaScript(updateCookieScript);
    }
  }, [formattedToken]);

  // 페이지 로드 완료 시 쿠키 다시 설정
  const handleLoadEnd = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(INJECTED_JAVASCRIPT);
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = useCallback(() => {
    console.log("로그아웃 요청 처리");

    // 쿠키 삭제를 위한 스크립트 실행
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        document.cookie = "sb-kxuixxexrdjabszzheoz-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        true;
      `);
    }

    // AsyncStorage에서도 토큰 삭제
    (async () => {
      try {
        await AsyncStorage.removeItem("sb-kxuixxexrdjabszzheoz-auth-token");
        console.log("AsyncStorage에서 토큰이 삭제되었습니다");
      } catch (error) {
        console.error("토큰 삭제 오류:", error);
      }
    })();

    // 외부에서 제공된 로그아웃 핸들러 호출
    if (onLogout) {
      onLogout();
    } else {
      // 기본 로그아웃 동작: 로그인 화면으로 이동
      router.push("/login");
    }
  }, [onLogout, router]);

  // 웹뷰로부터 메시지 수신
  const handleMessage = (event: any) => {
    try {
      const message: WebViewMessage = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case "COOKIE_CHECK":
          console.log("현재 쿠키:", message.cookies);
          break;

        case "LOGOUT":
          handleLogout();
          break;

        case "ERROR":
          console.error("웹뷰 에러:", message.error);
          break;

        default:
          console.log("웹뷰 메시지:", message);
          break;
      }
    } catch (error) {
      console.error("메시지 파싱 에러:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        injectedJavaScriptBeforeContentLoaded={`
          window.document.addEventListener('DOMContentLoaded', function() {
            ${INJECTED_JAVASCRIPT}
          });
        `}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
