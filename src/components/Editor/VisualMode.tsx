import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { useEffect, useState } from 'react';

interface VisualModeProps {
    content: string; // HTML content
    onChange: (html: string) => void;
    onSelectionUpdate?: () => void;
    className?: string;
    onEditorReady?: (editor: any) => void;
    searchQuery?: string;
    searchAction?: { type: 'next' | 'previous' | 'none', id?: number };
    onSearchStats?: (current: number, total: number) => void;
}

// Simple implementation of search using TextSelection for now.
// For robust highlighting, we need a NodeView or decoration-based extension.

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// Search Extension for highlighting
const SearchExtension = Extension.create({
    name: 'search',

    addOptions() {
        return {
            searchClassName: 'search-result',
        };
    },

    addCommands() {
        return {
            setSearchQuery: (query: string) => ({ tr, dispatch }: any) => {
                if (dispatch) {
                    dispatch(tr.setMeta('searchQuery', query));
                }
                return true;
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('search'),
                state: {
                    init() {
                        return { query: '', decorations: DecorationSet.empty };
                    },
                    apply(tr: any, prevState: any) {
                        const metaQuery = tr.getMeta('searchQuery');
                        const newQuery = metaQuery !== undefined ? metaQuery : prevState.query;

                        // If query unchanged and doc unchanged, just map decorations
                        if (newQuery === prevState.query && !tr.docChanged) {
                            return {
                                query: prevState.query,
                                decorations: prevState.decorations.map(tr.mapping, tr.doc)
                            };
                        }

                        // If doc changed but query is same, remap decorations
                        if (newQuery === prevState.query) {
                            return {
                                query: prevState.query,
                                decorations: prevState.decorations.map(tr.mapping, tr.doc)
                            };
                        }

                        // Calculate new decorations for new query by iterating over text nodes
                        const decorations: Decoration[] = [];
                        if (newQuery) {
                            const escapedQuery = newQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(escapedQuery, 'gi');

                            // Properly iterate over text nodes to get correct positions
                            tr.doc.descendants((node: any, pos: number) => {
                                if (node.isText && node.text) {
                                    let match;
                                    while ((match = regex.exec(node.text))) {
                                        const from = pos + match.index;
                                        const to = from + match[0].length;
                                        decorations.push(
                                            Decoration.inline(from, to, {
                                                style: 'background-color: #fef08a; color: #000; border-radius: 2px;',
                                            })
                                        );
                                    }
                                    // Reset regex for next node
                                    regex.lastIndex = 0;
                                }
                            });
                        }

                        return {
                            query: newQuery,
                            decorations: DecorationSet.create(tr.doc, decorations),
                        };
                    },
                },
                props: {
                    decorations(state: any) {
                        return this.getState(state)?.decorations;
                    },
                },
            }),
        ];
    },
});

export const VisualMode = ({ content, onChange, onSelectionUpdate, className, onEditorReady, searchQuery, searchAction, onSearchStats }: VisualModeProps) => {

    // We need to keep track of matches
    const [matches, setMatches] = useState<{ from: number, to: number }[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Image,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            SearchExtension,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            if (onEditorReady) {
                onEditorReady(editor);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
    }, []); // Ensure editor is created only once

    // Handle Search Logic
    useEffect(() => {
        if (!editor) return;

        // Update Highlighting via Extension
        // @ts-ignore
        editor.commands.setSearchQuery(searchQuery || '');

        if (!searchQuery) {
            setMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        // Find all matches for Navigation State by iterating over text nodes
        const doc = editor.state.doc;
        const found: { from: number, to: number }[] = [];
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'gi');

        // Properly iterate over text nodes to get correct positions
        doc.descendants((node, pos) => {
            if (node.isText && node.text) {
                let match;
                while ((match = regex.exec(node.text))) {
                    const from = pos + match.index;
                    const to = from + match[0].length;
                    found.push({ from, to });
                }
                // Reset regex for next node
                regex.lastIndex = 0;
            }
        });

        setMatches(found);

        if (found.length > 0) {
            setCurrentMatchIndex(0);
            // Select first match (without stealing focus from search input)
            const first = found[0];
            editor.commands.setTextSelection({ from: first.from, to: first.to });
            // Don't call focus() here - it would steal focus from the search input
        } else {
            setCurrentMatchIndex(-1);
        }

        if (onSearchStats) onSearchStats(found.length > 0 ? 1 : 0, found.length);

    }, [editor, searchQuery]);

    // Handle Search Action (Next/Prev)
    useEffect(() => {
        if (!editor || matches.length === 0 || searchAction?.type === 'none') return;

        let nextIndex = currentMatchIndex;

        if (searchAction?.type === 'next') {
            nextIndex = (currentMatchIndex + 1) % matches.length;
        } else if (searchAction?.type === 'previous') {
            nextIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        }

        setCurrentMatchIndex(nextIndex);
        const match = matches[nextIndex];

        editor.commands.setTextSelection({ from: match.from, to: match.to });
        editor.commands.focus();

        // Scroll the selection into view using DOM API
        setTimeout(() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const container = editor.view.dom.closest('.overflow-y-auto') || editor.view.dom.parentElement;
                if (container && rect) {
                    const containerRect = container.getBoundingClientRect();
                    const scrollTop = rect.top - containerRect.top - containerRect.height / 2 + container.scrollTop;
                    container.scrollTo({ top: scrollTop, behavior: 'smooth' });
                }
            }
        }, 50);

        if (onSearchStats) onSearchStats(nextIndex + 1, matches.length);

    }, [searchAction]);


    useEffect(() => {
        if (!editor) return;

        const selectionHandler = () => {
            if (onSelectionUpdate) onSelectionUpdate();
        };

        editor.on('selectionUpdate', selectionHandler);
        editor.on('transaction', selectionHandler);

        return () => {
            editor.off('selectionUpdate', selectionHandler);
            editor.off('transaction', selectionHandler);
        };
    }, [editor, onSelectionUpdate]);

    return (
        <>
            <style>{`
        /* FORCED STYLES INJECTED INTO COMPONENT */
        
        .ProseMirror {
            outline: none !important;
            min-height: 1122px !important;
            width: 800px !important;
            max-width: 100% !important;
            background: white !important;
            padding: 4rem 5rem !important;
            margin: 2rem auto !important; /* Centered */
            
            /* Deep Shadow */
            box-shadow: 
                0 20px 25px -5px rgba(0, 0, 0, 0.2), 
                0 8px 10px -6px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(0, 0, 0, 0.05) !important;
            
            border-radius: 2px !important;
        }

        /* Blockquote Styling */
        .ProseMirror blockquote {
            border-left: 5px solid #3b82f6 !important;
            background-color: #f3f4f6 !important;
            color: #4b5563 !important;
            padding: 1rem !important;
            margin: 1.5rem 0 !important;
            border-radius: 0 4px 4px 0 !important;
            font-style: italic !important;
        }

        /* Headings */
        .ProseMirror h1 { font-size: 2.5em; font-weight: 800; margin-top: 1em; }
        .ProseMirror h2 { font-size: 2em; font-weight: 700; margin-top: 1em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em;}
        .ProseMirror h3 { font-size: 1.5em; font-weight: 600; margin-top: 1em; }
        .ProseMirror h4 { font-size: 1.25em; font-weight: 600; margin-top: 1em; }

        /* Dark Mode Overrides */
        @media (prefers-color-scheme: dark) {
            .ProseMirror {
                background: #27272a !important; /* Zinc 800 */
                color: #e4e4e7 !important; /* Zinc 200 */
                 box-shadow: 
                    0 20px 25px -5px rgba(0, 0, 0, 0.5), 
                    0 8px 10px -6px rgba(0, 0, 0, 0.4) !important;
            }
            .ProseMirror blockquote {
                background-color: #3f3f46 !important; /* Zinc 700 */
                color: #d4d4d8 !important; /* Zinc 300 */
                border-left-color: #60a5fa !important;
            }
            /* Code Block Dark */
            .ProseMirror pre {
                background: #1e1e20 !important;
                color: #e4e4e7 !important;
            }
        }

        /* Code Block Styling (Light Mode Default) */
        .ProseMirror pre {
            background: #f3f4f6 !important; /* Gray-100 */
            color: #1f2937 !important;
            padding: 1rem !important;
            border-radius: 0.5rem !important;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important;
            margin: 1.5rem 0 !important;
        }
        
        .ProseMirror code {
            font-family: inherit !important;
        }
      `}</style>
            <div className={className}>
                <EditorContent editor={editor} />
            </div>
        </>
    );
};
