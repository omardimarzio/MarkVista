// import React from 'react';

interface TitleBarProps {
    filePath?: string;
}

export const TitleBar = ({ filePath }: TitleBarProps) => {
    return (
        <div
            className="h-[30px] bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-center relative select-none w-full"
            style={{ WebkitAppRegion: 'drag', height: '30px' } as any}
        >
            <div className="text-xs text-[var(--text-secondary)] font-medium truncate max-w-md">
                {filePath ? filePath : 'Untitled - MarkVista'}
            </div>
        </div>
    );
};
