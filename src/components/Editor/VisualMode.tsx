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
import { useEffect } from 'react';

interface VisualModeProps {
    content: string; // HTML content
    onChange: (html: string) => void;
    onSelectionUpdate?: () => void;
    className?: string;
    onEditorReady?: (editor: any) => void;
}

export const VisualMode = ({ content, onChange, onSelectionUpdate, className, onEditorReady }: VisualModeProps) => {
    const editor = useEditor({
        immediatelyRender: false, // Required for React 18 / SSR / Electron environments
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                // We use our own Link extension configuration
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
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            console.log('Tiptap Editor CREATED. View exists?', !!editor.view);
            if (onEditorReady) {
                onEditorReady(editor);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
    });

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
