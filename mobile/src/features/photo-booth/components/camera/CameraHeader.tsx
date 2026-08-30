import { CameraOverlayHeader } from "@/components/camera/CameraOverlayHeader";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";

import { CameraSelectedCollage } from "./CameraSelectedCollage";

export function CameraHeader({
  show,
  setShow
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  const { isBoothRunning } = usePhotoBoothSession();

  return (
    <CameraOverlayHeader
      title="Photo Booth"
      subtitle="Capture This Moment"
      visible={!isBoothRunning}
    >
      <CameraSelectedCollage show={show} setShow={setShow} />
    </CameraOverlayHeader>
  );
}
