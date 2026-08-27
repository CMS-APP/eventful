import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/app/navigationTypes";

import { WebScreen } from "../../app/screens/WebScreen";
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
        component={WebScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
