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

export function showErrorToast(message: string) {
  if (globalShowToast) {
    globalShowToast(message, "error");
  } else {
    toastQueue.push({ message, type: "error" });
  }
}

export function showWarningToast(message: string) {
  if (globalShowToast) {
    globalShowToast(message, "warning");
  } else {
    toastQueue.push({ message, type: "warning" });
  }
}
