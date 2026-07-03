import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import api from '../services/api';

const TiptapEditor = ({ content, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit includes blockquote, bulletList, orderedList, bold, italic, strike, heading etc.
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
          style: 'max-width:100%; border-radius:12px; margin:24px 0; border:1px solid #cbd5e1; display:block;'
        }
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'tiptap-youtube',
          style: 'border:1px solid #cbd5e1; border-radius:12px; margin:24px 0; display:block; aspect-ratio:16/9; max-width:100%;'
        },
        width: 640,
        height: 360,
        addPasteHandler: true,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep editor content in sync when content is updated from the outside (e.g. editing an existing item)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Handle local image upload to Cloudinary and insert into Tiptap
  const handleLocalImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const res = await api.post('/trainings/upload', { image: base64String });
      if (res.data && res.data.url) {
        editor.chain().focus().setImage({ src: res.data.url, alt: 'Imagen del artículo' }).run();
      }
    } catch (err) {
      console.error('Error uploading inline image in Tiptap:', err);
      alert('Error al subir la imagen a Cloudinary.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleInsertYoutube = () => {
    const url = window.prompt('Introduce el enlace del video de YouTube (o Short):');
    if (!url) return;

    editor.commands.setYoutubeVideo({
      src: url,
      width: 640,
      height: 360,
    });
  };

  // Menu Button helper
  const ToolbarButton = ({ label, title, onClick, active = false, disabled = false, styleOverride = {} }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 12px',
        fontSize: '13px',
        fontWeight: '700',
        textTransform: 'uppercase',
        backgroundColor: '#ffffff',
        color: active ? '#1f75f5ff' : '#64748b',
        border: active ? '1px solid #2B2D2F' : '1px solid #cbd5e1',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 2px 8px rgba(31, 117, 245, 0.2)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...styleOverride
      }}
      title={title}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
          e.currentTarget.style.color = '#0f172a';
          e.currentTarget.style.borderColor = '#94a3b8';
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#64748b';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Editor Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        border: '1px solid #cbd5e1',
        borderBottom: 'none',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        backgroundColor: '#f8fafc',
        flexWrap: 'wrap'
      }}>
        {/* Undo / Redo */}
        <ToolbarButton
          label="↶"
          title="Deshacer (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          label="↷"
          title="Rehacer (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

        {/* Text Formats */}
        <ToolbarButton
          label="B"
          title="Negrita (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          styleOverride={{ fontWeight: 'bold' }}
        />
        <ToolbarButton
          label="I"
          title="Cursiva (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          styleOverride={{ fontStyle: 'italic' }}
        />
        <ToolbarButton
          label="U"
          title="Subrayado (Ctrl+U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          styleOverride={{ textDecoration: 'underline' }}
        />
        <ToolbarButton
          label="S"
          title="Tachado"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          styleOverride={{ textDecoration: 'line-through' }}
        />

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

        {/* Heading Blocks */}
        <ToolbarButton
          label="H2"
          title="Subtítulo H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        />
        <ToolbarButton
          label="H3"
          title="Sección H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        />
        <ToolbarButton
          label="Texto"
          title="Texto Normal"
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
        />

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

        {/* Lists & Blocks */}
        <ToolbarButton
          label="• Lista"
          title="Lista con Viñetas"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        />
        <ToolbarButton
          label="1. Lista"
          title="Lista Numerada"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        />
        <ToolbarButton
          label="“ Cita"
          title="Bloque de Cita"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        />

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

        {/* Media Inserts */}
        <ToolbarButton
          label="📺 Video"
          title="Insertar Video de YouTube"
          onClick={handleInsertYoutube}
        />
        <ToolbarButton
          label={uploading ? 'Subiendo...' : '📷 Imagen'}
          title="Subir e Insertar Imagen"
          onClick={() => document.getElementById('tiptap-image-upload').click()}
          disabled={uploading}
        />
        <input
          id="tiptap-image-upload"
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleLocalImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Google Docs desk & centered Tiptap sheet paper */}
      <div style={{
        backgroundColor: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        padding: '40px 10px',
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '850px',
          minHeight: '500px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #cbd5e1',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EditorContent
            editor={editor}
            className="tiptap-editor-container"
          />
        </div>
      </div>

      {/* Styles for Tiptap Editor Content */}
      <style>{`
        .tiptap-editor-container .ProseMirror {
          min-height: 420px;
          padding: 40px 40px;
          outline: none;
          color: #2B2D2F;
          font-family: var(--font-sans);
          font-size: 16px;
          line-height: 1.7;
          width: 100%;
          height: 100%;
        }
        
        .tiptap-editor-container .ProseMirror h2 {
          font-size: 24px;
          font-weight: 800;
          color: #2B2D2F;
          margin-top: 24px;
          margin-bottom: 12px;
        }

        .tiptap-editor-container .ProseMirror h3 {
          font-size: 20px;
          font-weight: 700;
          color: #2B2D2F;
          margin-top: 18px;
          margin-bottom: 8px;
        }

        .tiptap-editor-container .ProseMirror p {
          margin-bottom: 16px;
        }

        .tiptap-editor-container .ProseMirror blockquote {
          border-left: 4px solid #1f75f5ff;
          padding-left: 16px;
          color: #6b7280;
          font-style: italic;
          margin: 16px 0;
        }

        .tiptap-editor-container .ProseMirror ul {
          list-style-type: disc;
          padding-left: 24px;
          margin-bottom: 16px;
        }

        .tiptap-editor-container .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 24px;
          margin-bottom: 16px;
        }

        .tiptap-editor-container .ProseMirror img {
          max-width: 100%;
          border-radius: 12px;
          margin: 24px 0;
          border: 1px solid #cbd5e1;
          display: block;
        }

        .tiptap-editor-container .ProseMirror iframe {
          max-width: 100%;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          margin: 24px 0;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
