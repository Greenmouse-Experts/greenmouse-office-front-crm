import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use the primary button style instead of the destructive one. */
  destructive?: boolean;
}

export interface ConfirmModalHandle {
  /**
   * Opens the confirmation dialog and resolves to `true` when the user
   * confirms, or `false` when they cancel/dismiss it.
   */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmModal = forwardRef<ConfirmModalHandle>((_props, ref) => {
  const modalRef = useRef<ModalHandle>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const settle = (confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(confirmed);
    modalRef.current?.close();
  };

  // Dismissing via ESC, backdrop, or the close button counts as a cancel.
  const handleClose = () => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(false);
  };

  useImperativeHandle(ref, () => ({
    confirm: (next) => {
      // Any promise still waiting from a previous dialog is treated as cancelled.
      resolveRef.current?.(false);
      setOptions(next);
      modalRef.current?.open();
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
      });
    },
  }));

  return (
    <Modal
      ref={modalRef}
      title={options?.title ?? "Please confirm"}
      onClose={handleClose}
      actions={
        <>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => settle(false)}
          >
            {options?.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              options?.destructive === false ? "btn-primary" : "btn-error"
            }`}
            onClick={() => settle(true)}
          >
            {options?.confirmLabel ?? "Confirm"}
          </button>
        </>
      }
    >
      <p className="text-base-content/80">{options?.message}</p>
    </Modal>
  );
});

ConfirmModal.displayName = "ConfirmModal";

export default ConfirmModal;
