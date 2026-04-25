import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

export function accountNavigatorGestureOptions({
  route
}: {
  route: Parameters<typeof getFocusedRouteNameFromRoute>[0];
}) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "AccountView";
  return { gestureEnabled: routeName === "AccountView" };
}
