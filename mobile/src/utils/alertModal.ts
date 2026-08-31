import { AlertOptions } from "@/types/AlertOptions";

type ShowAlertModal = (
  title: string,
  message: string | undefined,
  buttons: AlertOptions[]
) => void;

let globalShowAlertModal: ShowAlertModal | null = null;

export function setGlobalAlertModalFunction(showAlertModal: ShowAlertModal) {
  globalShowAlertModal = showAlertModal;
}

export function showOptionsAlert(
  title: string,
  message: string | undefined,
  buttons: AlertOptions[]
) {
  globalShowAlertModal?.(title, message, buttons);
}
