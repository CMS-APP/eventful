import { Button } from "@/design-system/components/buttons/Button";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface LinkInviteDisclaimerModalProps {
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
  onAccept: () => void;
}

export function LinkInviteDisclaimerModal({
  presentModal,
  setPresentModal,
  onAccept
}: LinkInviteDisclaimerModalProps) {
  return (
    <ModalView
      show={presentModal}
      setShow={setPresentModal}
      backgroundColor={colors.primary}
    >
      <Text type="header" color={colors.white}>
        Enable Link Invite
      </Text>

      <Text type="body" color={colors.white}>
        This link will allow anyone to RSVP to your event and view the event
        details. Anyone with the link will be able to see details such as the
        location, time and date.
      </Text>

      <Button
        text="Accept"
        onPress={onAccept}
        color={colors.primaryTint}
        textColor={colors.white}
      />

      <Button
        text="Decline"
        onPress={() => setPresentModal(false)}
        color={colors.lightGray}
        textColor={colors.black}
      />
    </ModalView>
  );
}
