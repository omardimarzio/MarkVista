import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SearchToolbarProps {
    isVisible: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    onNext: () => void;
    onPrevious: () => void;
    currentMatch: number;
    totalMatches: number;
}

export const SearchToolbar = ({
    isVisible,
    onClose,
    onSearch,
    onNext,
    onPrevious,
    currentMatch,
    totalMatches
}: SearchToolbarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isVisible) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isVisible]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    onPrevious();
                } else {
                    onNext();
                }
            } else if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isVisible, onClose, onNext, onPrevious]);

    if (!isVisible) return null;

    return (
        <div
            style={{ top: '180px' }}
            className="fixed right-10 z-[100] flex flex-col gap-2 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 w-80"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cerca</span>
                <button
                    type="button"
                    onClick={() => onClose()}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-gray-500 hover:text-red-500 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Find..."
                    className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
                    onChange={(e) => onSearch(e.target.value)}
                />
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onPrevious()}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700"
                        title="Previous Match (Shift+Enter)"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onNext()}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700"
                        title="Next Match (Enter)"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
                {totalMatches > 0 ? `${currentMatch} of ${totalMatches}` : (
                    inputRef.current?.value ? 'No results' : 'Type to search'
                )}
            </div>
        </div>
    );
};
