# MarkVista - The Modern Markdown Editor

**MarkVista** is a powerful, dual-mode Markdown editor built for the modern era. It combines the ease of a WYSIWYG interface with the precision of a code editor, making it the perfect tool for developers, writers, and AI enthusiasts who treat Markdown as the standard for documentation.

## 🚀 Why MarkVista?

I built MarkVista out of a personal necessity. As a developer heavily reliant on Markdown for documentation, notes, and AI interactions, I struggled to find an editor that felt "just right."

Existing tools were either too simple (lacking visual feedback), too complex (bloated features), or just didn't handle the hybrid workflow of writing content *and* seeing the code. With AI increasingly using Markdown as the de facto standard for communication, having a tool that bridges the gap between raw text and visual presentation became essential.

MarkVista is designed to be the tool I always wanted: **clean, fast, and persistent.**

## ✨ Features

- **Dual Editing Modes**:
  - **Visual Mode**: A rich-text, notion-style interface (powered by TipTap) with enhanced table controls and distraction-free writing.
  - **Code Mode**: A robust syntax-highlighted editor (powered by CodeMirror) for precise control.
  - **Real-time Sync**: Switch seamlessly between modes without losing context or content.

- **Robust File Operations**:
  - **Smart Save**: Silently rewrites existing files; prompts for new ones.
  - **Save As**: Create copies or rename files easily.
  - **Drag & Drop**: Open any Markdown file instantly by dragging it into the window.
  - **Unsaved Changes Protection**: Smart modals prevent accidental data loss when closing the app or switching files.
  - **Save Feedback**: Visual confirmation in the status bar lets you know exactly when your work is safe.
  - **Autosave**: Never lose data again. Your content persists in local storage even if you accidentally refresh or close the app.
  - **PDF Export**: Generate professional PDFs of your documents with a single click.

- **Developer Friendly**:
  - **Gray Code Blocks**: Distinct styling for code snippets to separate them from prose.
  - **Active State Toolbar**: Visual feedback for current formatting (Bold, Headings, etc.).
  - **Clean UI**: A minimalist interface focused on your content.

## 🛠️ Technology Stack

MarkVista is built with cutting-edge web technologies:
- **Electron**: For cross-platform desktop experience.
- **React 19 & Vite**: For a blazing fast UI.
- **TypeScript**: For type-safe, maintainable code.
- **TailwindCSS**: For a modern, responsive design.
- **TipTap & CodeMirror**: The best-in-class engines for text editing.

## 📦 Installation & Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/omardimarzio/markvista.git
   cd markvista
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run in Development Mode**
   This starts the React renderer and the Electron main process concurrently.
   ```bash
   npm run dev:electron
   ```
   *Note: If you just want to test the UI in a browser (with mocked Electron APIs), you can run `npm run dev`.*

4. **Build for Production**
   To create a robust desktop application executable for your current operating system:
   ```bash
   npm run build:electron
   ```
   The output will be generated in the `release` folder:
   - **macOS**: `.dmg` (Drag and Drop installer)
   - **Windows**: `.exe` (NSIS Installer)
   - **Linux**: `.AppImage`

   *Note: To build for Windows on macOS (or vice versa), additional configuration or CI/CD pipelines (like GitHub Actions) are typically required.*

## 📖 Usage

- **Writing**: Just start typing! Use the toolbar or standard Markdown syntax (`#`, `**`, etc.).
- **Switching Modes**: Click the "Code" / "Visual" button in the top right.
- **Saving**:
  - `Cmd/Ctrl + S` or click the **Save** icon (Disk) to save.
  - Click the **Save As** icon (Disk with Pen) to save a copy.
- **New File**: Click the **New** icon (File with Plus) to start fresh.
- **Export**: Click the **PDF** icon (Printer) to export your document.

---

*Handcrafted with ❤️ by [Omar Di Marzio](https://github.com/omardimarzio/)*
