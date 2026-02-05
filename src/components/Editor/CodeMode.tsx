import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

interface CodeModeProps {
    content: string;
    onChange: (value: string) => void;
    className?: string;
}

export const CodeMode = ({ content, onChange, className }: CodeModeProps) => {
    return (
        <div className={`code-editor ${className || ''} h-full`}>
            <CodeMirror
                value={content} // CodeMirror expects 'value', not 'content' like TipTap might (though TipTap uses editor.setContent)
                height="100%"
                extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                onChange={(value) => onChange(value)}
                theme="dark" // Or dynamic based on app theme
                className="h-full text-base font-mono"
            />
        </div>
    );
};
