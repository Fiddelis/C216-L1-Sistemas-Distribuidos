import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Modal({ title, subtitle, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="modal-title"
      onCancel={onClose}
      className="modal"
    >
      <div className="modal-heading">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2 id="modal-title">{title}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Fechar janela"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
