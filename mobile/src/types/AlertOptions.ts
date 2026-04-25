export interface AlertOptions {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}
