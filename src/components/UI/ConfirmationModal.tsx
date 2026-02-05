import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onDiscard: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    discardLabel?: string;
    cancelLabel?: string;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    onDiscard,
    title = 'Modifiche non salvate',
    message = 'Ci sono modifiche non salvate. Vuoi salvarle prima di continuare?',
    confirmLabel = 'Salva',
    discardLabel = 'Non Salvare',
    cancelLabel = 'Annulla'
}: ConfirmationModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-500 shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm leading-relaxed">
                            {message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Se non salvi, tutte le modifiche recenti andranno perse.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
                    <Button variant="ghost" onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <Button variant="danger" onClick={onDiscard}>
                        {discardLabel}
                    </Button>
                    <Button variant="primary" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
