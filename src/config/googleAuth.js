import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const config = {
    webClientId: '431588233052-cm1g5a31dmr1n0i5sltfn4ad07s84l42.apps.googleusercontent.com',
    iosClientId: '431588233052-k8bv1tq9o4tgr2c2af24iskes22sica1.apps.googleusercontent.com',
    androidClientId: '431588233052-mn66fgs7v4h1or3ag7mnaqg1b45n5bfa.apps.googleusercontent.com',
    scopes: ['openid', 'profile', 'email'],
  };

  const [request, response, promptAsync] = Google.useAuthRequest(config);
  
  const wrappedPromptAsync = async () => {
    try {
      return await promptAsync({
        showInRecents: false,
      });
    } catch (error) {
      console.error('Google Auth Error:', error);
      return { type: 'error', error };
    }
  };

  return [request, response, wrappedPromptAsync];
};