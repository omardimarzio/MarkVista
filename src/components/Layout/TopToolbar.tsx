import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { Bold, Italic, List, ListOrdered, Code, FilePlus, FolderOpen, Save, Printer, Quote, Minus, Undo, Redo, SquareCode, HelpCircle, FileSignature, Link as LinkIcon, Image as ImageIcon, Smile, Strikethrough, Highlighter, Subscript, Superscript, ListTodo, Table, Trash2, Plus } from 'lucide-react';

interface TopToolbarProps {
    mode: 'visual' | 'code';
    onToggleMode: () => void;
    editor: any; // TipTap editor instance
    onNew: () => void;
    onOpen: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    onExportPdf: () => void;
}

export const TopToolbar = ({ mode, onToggleMode, editor, onNew, onOpen, onSave, onSaveAs, onExportPdf }: TopToolbarProps) => {
    // Debug (uncomment to troubleshoot)
    // console.log('TopToolbar Render. Editor exists?', !!editor);

    // Modal State
    const [activeModal, setActiveModal] = useState<'link' | 'image' | null>(null);
    const [inputUrl, setInputUrl] = useState('');

    // Emoji State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0 });
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Close Emoji Picker on Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node) &&
                emojiButtonRef.current &&
                !emojiButtonRef.current.contains(event.target as Node)
            ) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    const handleHelp = async () => {
        if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
            await window.electronAPI.openInfoDialog();
        } else {
            alert('MarkVista by Omar Di Marzio\nGitHub: https://github.com/omardimarzio/\nLinkedIn: https://www.linkedin.com/in/omar-di-marzio/');
        }
    };

    // --- Selection Persistence ---
    const selectionRef = useRef<{ from: number; to: number } | null>(null);

    const saveSelection = () => {
        if (editor && editor.state.selection) {
            selectionRef.current = {
                from: editor.state.selection.from,
                to: editor.state.selection.to
            };
        }
    };

    const restoreSelection = () => {
        if (selectionRef.current && editor) {
            editor.commands.setTextSelection(selectionRef.current);
        }
    };

    // --- Link Handling ---
    const openLinkModal = () => {
        saveSelection();
        const previousUrl = editor?.getAttributes('link').href;
        setInputUrl(previousUrl || '');
        setActiveModal('link');
    };

    const confirmLink = () => {
        restoreSelection();
        if (inputUrl === '') {
            editor?.chain().focus().unsetLink().run();
        } else {
            editor?.chain().focus().setLink({ href: inputUrl }).run();
        }
        setActiveModal(null);
        setInputUrl('');
        selectionRef.current = null;
    };

    // --- Image Handling ---
    const openImageModal = () => {
        saveSelection();
        setInputUrl('');
        setActiveModal('image');
    };

    const confirmImage = () => {
        restoreSelection();
        if (inputUrl) {
            editor?.chain().focus().setImage({ src: inputUrl }).run();
        }
        setActiveModal(null);
        setInputUrl('');
        selectionRef.current = null;
    };

    // --- Emoji Handling ---
    const toggleEmojiPicker = () => {
        if (!showEmojiPicker && emojiButtonRef.current) {
            const rect = emojiButtonRef.current.getBoundingClientRect();
            setEmojiPosition({
                top: rect.bottom + 10,
                left: rect.left
            });
            setShowEmojiPicker(true);
        } else {
            setShowEmojiPicker(false);
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        // Emoji picker doesn't steal focus in the same way, but good to ensure
        editor?.chain().focus().insertContent(emojiData.emoji).run();
        setShowEmojiPicker(false);
    };

    const FileActions = () => (
        <div className="flex items-center gap-1 mr-4 border-r border-[var(--border-color)] pr-2">
            <Button variant="ghost" onClick={onNew} title="New File" className="px-2 gap-2">
                <FilePlus size={16} />
                <span className="hidden sm:inline text-xs">New</span>
            </Button>
            <Button variant="ghost" onClick={onOpen} title="Open File" className="px-2 gap-2">
                <FolderOpen size={16} />
                <span className="hidden sm:inline text-xs">Open</span>
            </Button>
            <Button variant="ghost" onClick={onSave} title="Save" className="px-2 gap-2">
                <Save size={16} />
                <span className="hidden sm:inline text-xs">Save</span>
            </Button>
            <Button variant="ghost" onClick={onSaveAs} title="Save As" className="px-2 gap-2">
                <FileSignature size={16} />
                <span className="hidden sm:inline text-xs">Save As</span>
            </Button>
            <Button variant="ghost" onClick={onExportPdf} title="Export PDF" className="px-2 gap-2">
                <Printer size={16} />
                <span className="hidden sm:inline text-xs">PDF</span>
            </Button>
        </div>
    );

    if (mode === 'code') {
        return (
            <div className="flex items-center justify-between p-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] h-16">
                <div className="flex items-center gap-2">
                    <FileActions />
                    <span className="text-sm text-[var(--text-secondary)] font-mono">Code Mode</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={onToggleMode} variant="secondary" className="px-3 py-1 text-sm">
                        Switch to Visual
                    </Button>
                    <Button variant="ghost" onClick={handleHelp} title="About" className="px-2">
                        <HelpCircle size={16} />
                    </Button>
                </div>
            </div>
        );
    }

    // Determine current heading level for select
    let currentHeading = 'paragraph';
    if (editor?.isActive('heading', { level: 1 })) currentHeading = '1';
    else if (editor?.isActive('heading', { level: 2 })) currentHeading = '2';
    else if (editor?.isActive('heading', { level: 3 })) currentHeading = '3';
    else if (editor?.isActive('heading', { level: 4 })) currentHeading = '4';
    else if (editor?.isActive('heading', { level: 5 })) currentHeading = '5';
    else if (editor?.isActive('heading', { level: 6 })) currentHeading = '6';

    const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'paragraph') {
            editor?.chain().focus().setParagraph().run();
        } else {
            editor?.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
        }
    };

    // Visual Mode Toolbar
    return (
        <>
            <div
                className="flex items-center justify-between p-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] h-16 relative z-50"
                style={{ WebkitAppRegion: 'no-drag' } as any}
            >
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <FileActions />

                    <div className="flex items-center gap-1">
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().undo().run()}
                            disabled={!editor?.can().undo()}
                            title="Undo"
                        >
                            <Undo size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().redo().run()}
                            disabled={!editor?.can().redo()}
                            title="Redo"
                        >
                            <Redo size={18} />
                        </Button>
                        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                        {/* Native Select for Headings */}
                        <select
                            title="Heading"
                            value={currentHeading}
                            onChange={handleHeadingChange}
                            className="h-8 border border-gray-300 rounded text-sm bg-white px-2 pr-6 focus:outline-none focus:border-blue-500"
                            style={{ width: '140px' }}
                        >
                            <option value="paragraph">Normal Text</option>
                            <option value="1">Heading 1</option>
                            <option value="2">Heading 2</option>
                            <option value="3">Heading 3</option>
                            <option value="4">Heading 4</option>
                            <option value="5">Heading 5</option>
                            <option value="6">Heading 6</option>
                        </select>

                        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            active={editor?.isActive('bold')}
                            title="Bold"
                        >
                            <Bold size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            active={editor?.isActive('italic')}
                            title="Italic"
                        >
                            <Italic size={18} />
                        </Button>


                        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleStrike().run()}
                            active={editor?.isActive('strike')}
                            title="Strikethrough"
                        >
                            <Strikethrough size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleHighlight().run()}
                            active={editor?.isActive('highlight')}
                            title="Highlight"
                        >
                            <Highlighter size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleSubscript().run()}
                            active={editor?.isActive('subscript')}
                            title="Subscript"
                        >
                            <Subscript size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                            active={editor?.isActive('superscript')}
                            title="Superscript"
                        >
                            <Superscript size={18} />
                        </Button>

                        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                        <Button
                            variant="icon"
                            onClick={openLinkModal}
                            active={editor?.isActive('link')}
                            title="Link"
                        >
                            <LinkIcon size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={openImageModal}
                            active={editor?.isActive('image')}
                            title="Image"
                        >
                            <ImageIcon size={18} />
                        </Button>

                        <div ref={emojiButtonRef as any} className="inline-block">
                            <Button
                                variant="icon"
                                onClick={toggleEmojiPicker}
                                active={showEmojiPicker}
                                title="Emoji"
                            >
                                <Smile size={18} />
                            </Button>
                        </div>

                        {showEmojiPicker && createPortal(
                            <div
                                ref={emojiPickerRef}
                                style={{
                                    position: 'fixed',
                                    top: `${emojiPosition.top}px`,
                                    left: `${emojiPosition.left}px`,
                                    zIndex: 9999
                                }}
                                className="shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-200"
                            >
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={Theme.AUTO}
                                    width={350}
                                    height={400}
                                    previewConfig={{ showPreview: false }}
                                />
                            </div>,
                            document.body
                        )}

                        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleTaskList().run()}
                            active={editor?.isActive('taskList')}
                            title="Task List"
                        >
                            <ListTodo size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            active={editor?.isActive('bulletList')}
                            title="Bullet List"
                        >
                            <List size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            active={editor?.isActive('orderedList')}
                            title="Ordered List"
                        >
                            <ListOrdered size={18} />
                        </Button>

                        <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                            title="Insert Table (3x3)"
                        >
                            <Table size={18} />
                        </Button>
                        {/* Simple Contextual Table Buttons if Table is active */}
                        {editor?.isActive('table') && (
                            <div className="flex items-center gap-1 mx-1 px-1 border-l border-r border-[var(--border-color)]">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex gap-1">
                                        <Button variant="ghost" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column" className="h-6 px-1 text-[10px] gap-1">
                                            <Plus size={12} /> Col
                                        </Button>
                                        <Button variant="ghost" onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column" className="h-6 px-1 text-[10px] gap-1 text-red-500 hover:text-red-600">
                                            <Trash2 size={12} /> Col
                                        </Button>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row" className="h-6 px-1 text-[10px] gap-1">
                                            <Plus size={12} /> Row
                                        </Button>
                                        <Button variant="ghost" onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row" className="h-6 px-1 text-[10px] gap-1 text-red-500 hover:text-red-600">
                                            <Trash2 size={12} /> Row
                                        </Button>
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table" className="h-full px-2 text-red-600 hover:bg-red-50">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                            active={editor?.isActive('blockquote')}
                            title="Blockquote"
                        >
                            <Quote size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                            active={editor?.isActive('codeBlock')}
                            title="Code Block"
                        >
                            <SquareCode size={18} />
                        </Button>
                        <Button
                            variant="icon"
                            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                            title="Horizontal Rule"
                        >
                            <Minus size={18} />
                        </Button>

                        <Button variant="ghost" onClick={handleHelp} title="About" className="px-2">
                            <HelpCircle size={16} />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Zoom Removed per request */}
                    <Button onClick={onToggleMode} variant="secondary" className="px-3 py-1 text-sm gap-2">
                        <Code size={16} />
                        <span>Code</span>
                    </Button>
                </div>
            </div>

            {/* Modals */}
            {/* Modals - Polished Design */}
            <Modal
                isOpen={activeModal === 'link'}
                onClose={() => setActiveModal(null)}
                title="Link"
            >
                <div className="flex flex-col gap-6 pt-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">URL Destination</label>
                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-zinc-800 transition-all text-[var(--text-primary)]"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && confirmLink()}
                        />
                        <p className="text-xs text-[var(--text-secondary)]">Enter a valid web address starting with http:// or https://</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" className="px-5" onClick={() => setActiveModal(null)}>Cancel</Button>
                        <Button variant="primary" className="px-5 shadow-sm" onClick={confirmLink}>
                            {inputUrl ? 'Set Link' : 'Remove Link'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={activeModal === 'image'}
                onClose={() => setActiveModal(null)}
                title="Insert Image"
            >
                <div className="flex flex-col gap-6 pt-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Image Source URL</label>
                        <input
                            type="text"
                            placeholder="https://example.com/image.png"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-zinc-800 transition-all text-[var(--text-primary)]"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && confirmImage()}
                        />
                        <p className="text-xs text-[var(--text-secondary)]">Supports JPG, PNG, GIF. Make sure the URL is publicly accessible.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" className="px-5" onClick={() => setActiveModal(null)}>Cancel</Button>
                        <Button variant="primary" className="px-5 shadow-sm" onClick={confirmImage}>Insert Image</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
