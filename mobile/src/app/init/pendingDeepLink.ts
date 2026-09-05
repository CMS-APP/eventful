type DeepLinkAction = () => void | Promise<void>;

type BootStatus = "pending" | "main" | "other";

let bootStatus: BootStatus = "pending";
let pendingAction: DeepLinkAction | null = null;

export function isBootReadyOnMain() {
  return bootStatus === "main";
}

export function isBootPending() {
  return bootStatus === "pending";
}

export function setPendingDeepLink(action: DeepLinkAction) {
  pendingAction = action;
}

export function resolveBootDeepLink(result: string) {
  bootStatus = result === "Main" ? "main" : "other";

  const action = pendingAction;
  pendingAction = null;

  if (bootStatus === "main") {
    action?.();
  }
}
