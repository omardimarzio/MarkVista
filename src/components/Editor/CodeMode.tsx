import { useRef, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

interface CodeModeProps {
    content: string;
    onChange: (value: string) => void;
    className?: string;
    searchQuery?: string;
    searchAction?: { type: 'next' | 'previous' | 'none', id?: number };
    onSearchStats?: (current: number, total: number) => void;
}

export const CodeMode = ({ content, onChange, className, searchQuery, searchAction, onSearchStats }: CodeModeProps) => {
    // We need a ref to the editor view to manipulate selection
    // @uiw/react-codemirror exposes `view` in `onCreateEditor` or via ref
    const viewRef = useRef<any>(null); // Actually CodeMirror EditorView
    const [matches, setMatches] = useState<{ from: number, to: number }[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

    // Search Logic
    useEffect(() => {
        if (!viewRef.current || !searchQuery) {
            setMatches([]);
            setCurrentMatchIndex(-1);
            // Avoid calling parent state update on empty query to prevent potential render loops on startup
            return;
        }

        const view = viewRef.current.view;
        const text = view.state.doc.toString();
        const found: { from: number, to: number }[] = [];
        const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        let match;
        while ((match = regex.exec(text))) {
            found.push({
                from: match.index,
                to: match.index + match[0].length
            });
        }

        setMatches(found);

        if (found.length > 0) {
            setCurrentMatchIndex(0);
            const first = found[0];
            view.dispatch({
                selection: { anchor: first.from, head: first.to },
                scrollIntoView: true
            });
        }

        if (onSearchStats) onSearchStats(found.length > 0 ? 1 : 0, found.length);

    }, [searchQuery]);

    // Navigation Logic
    useEffect(() => {
        if (!viewRef.current || matches.length === 0 || !searchAction || searchAction.type === 'none') return;

        let nextIndex = currentMatchIndex;
        if (searchAction.type === 'next') {
            nextIndex = (currentMatchIndex + 1) % matches.length;
        } else if (searchAction.type === 'previous') {
            nextIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        }

        setCurrentMatchIndex(nextIndex);
        const match = matches[nextIndex];
        const view = viewRef.current.view;

        view.dispatch({
            selection: { anchor: match.from, head: match.to },
            scrollIntoView: true
        });

        if (onSearchStats) onSearchStats(nextIndex + 1, matches.length);

    }, [searchAction]);


    return (
        <div className={`code-editor ${className || ''} h-full`}>
            <CodeMirror
                ref={viewRef}
                value={content}
                height="100%"
                extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                onChange={(value) => onChange(value)}
                theme="dark" // Or dynamic based on app theme
                className="h-full text-base font-mono"
            />
        </div>
    );
};

