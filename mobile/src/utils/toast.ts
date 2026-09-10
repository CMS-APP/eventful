import { ToastType } from "@/app/context/toast/const";

let globalShowToast: ((message: string, type?: ToastType) => void) | null =
  null;

let toastQueue: { message: string; type?: ToastType }[] = [];

export function setGlobalToastFunction(
  showToast: (message: string, type?: ToastType) => void
) {
  globalShowToast = showToast;

  if (toastQueue.length > 0) {
    toastQueue.forEach(({ message, type }) => {
      showToast(message, type);
    });

    toastQueue = [];
  }
}

function showToastOfType(type: ToastType) {
  return (message: string) => {
    if (globalShowToast) {
      globalShowToast(message, type);
    } else {
      toastQueue.push({ message, type });
    }
  };
}

export const showSuccessToast = showToastOfType("success");
export const showErrorToast = showToastOfType("error");
export const showWarningToast = showToastOfType("warning");
