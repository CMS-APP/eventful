import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

export function profileNavigatorGestureOptions({
  route
}: {
  route: Parameters<typeof getFocusedRouteNameFromRoute>[0];
}) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "ProfileView";
  return { gestureEnabled: routeName === "ProfileView" };
}
