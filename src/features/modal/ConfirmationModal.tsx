import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ModalShell } from "../ui/ModalShell";

interface ConfirmationModalProps {
  modalProps?: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
  };
  close: () => void;
  resolve: (value: boolean) => void;
}

const ConfirmationModal = ({
  modalProps = {},
  close,
  resolve,
}: ConfirmationModalProps) => {
  const { t } = useTranslation();
  const { title, message, confirmText, cancelText } = modalProps;

  const handleConfirm = () => {
    resolve?.(true);
    close();
  };

  const handleCancel = () => {
    resolve?.(false);
    close();
  };

  return (
    <ModalShell
      title={title}
      onClose={handleCancel}
      footer={
        <>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText ? t(cancelText) : t("Cancel")}
          </Button>
          <Button onClick={handleConfirm}>
            {confirmText ? t(confirmText) : t("Confirm")}
          </Button>
        </>
      }
    >
      <p className="px-2 text-base">{message}</p>
    </ModalShell>
  );
};

export default ConfirmationModal;
