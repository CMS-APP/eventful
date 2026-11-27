import { useBackButtonAction } from "./useBackButtonAction";

function ignoreBackPress() {}

export function useDisableBackButton(disabled = true) {
  useBackButtonAction(ignoreBackPress, disabled);
}
