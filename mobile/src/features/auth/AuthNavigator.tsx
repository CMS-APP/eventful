import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/features/app/navigationTypes";

import { WebViewScreen } from "../app/screens/WebViewScreen";
import { SignInScreen } from "./screens/SignInScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={WebViewScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
