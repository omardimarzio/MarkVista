import { Minus, Plus } from 'lucide-react';

interface StatusBarProps {
    filePath?: string;
    zoomLevel: number;
    onZoomChange: (level: number) => void;
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    isDirty?: boolean;
}

export const StatusBar = ({ filePath, zoomLevel, onZoomChange, saveStatus = 'idle', isDirty = false }: StatusBarProps) => {
    // Convert zoom 0.5-2.0 to slider 50-200
    const sliderValue = Math.round(zoomLevel * 100);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        onZoomChange(val / 100);
    };

    return (
        <div className="h-8 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex items-center justify-between px-4 text-xs select-none">
            <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                <span>{filePath || 'Ready'}</span>
                {saveStatus === 'saving' && <span className="text-blue-500 animate-pulse">Saving...</span>}
                {saveStatus === 'saved' && <span className="text-green-500 fade-out pointer-events-none">Saved</span>}
                {isDirty && saveStatus !== 'saving' && <span className="text-yellow-500 text-[10px] uppercase font-bold tracking-wider">● Unsaved</span>}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onZoomChange(Math.max(zoomLevel - 0.1, 0.5))}
                    className="hover:bg-[var(--bg-secondary)] p-1 rounded"
                >
                    <Minus size={14} />
                </button>

                <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="w-24 accent-blue-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />

                <button
                    onClick={() => onZoomChange(Math.min(zoomLevel + 0.1, 2.0))}
                    className="hover:bg-[var(--bg-secondary)] p-1 rounded"
                >
                    <Plus size={14} />
                </button>

                <span className="w-10 text-right">{sliderValue}%</span>
            </div>
        </div>
    );
};
