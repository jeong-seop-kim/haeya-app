import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface CustomWebViewProps {
  uri: string;
}

export function CustomWebView({ uri }: CustomWebViewProps) {
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
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
