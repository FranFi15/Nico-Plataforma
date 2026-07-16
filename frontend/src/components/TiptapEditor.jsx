import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import api from '../services/api';
import {
  IoArrowUndoOutline,
  IoArrowRedoOutline,
  IoListOutline,
  IoCodeSlashOutline,
  IoLinkOutline,
  IoUnlinkOutline,
  IoLogoYoutube,
  IoImageOutline,
  IoChatboxEllipsesOutline,
  IoDocumentAttachOutline
} from 'react-icons/io5';

const TiptapEditor = ({ content, onChange, stickyTopOffset = '115px' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit includes blockquote, bulletList, orderedList, bold, italic, strike, heading, codeBlock etc.
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
          style: 'color: #1f75f5ff; text-decoration: underline; font-weight: 600;'
        }
      }),
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

  // Handle local PDF / Video / File upload and insert into Tiptap editor
  const handleLocalFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const res = await api.post('/content/upload-file', {
        file: base64String,
        filename: file.name,
        fileType: file.type
      });

      if (res.data && res.data.url) {
        const fileUrl = res.data.url;
        const ext = (file.name.split('.').pop() || 'file').toLowerCase();
        const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(ext);

        if (isVideo) {
          editor.chain().focus().insertContent(`
            <div style="margin: 24px 0;">
              <video controls src="${fileUrl}" style="width: 100%; max-height: 520px; border-radius: 16px; background: #000; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"></video>
            </div>
            <p></p>
          `).run();
        } else {
          const fileIcon = ext === 'pdf' ? '📄' : (['zip', 'rar'].includes(ext) ? '📦' : '📎');
          editor.chain().focus().insertContent(`
            <div style="margin: 24px 0;">
              <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="blog-file-download-card" style="display: flex; align-items: center; gap: 16px; padding: 18px 24px; background-color: #f8fafc; border: 2px solid #cbd5e1; border-radius: 16px; text-decoration: none; color: #0f172a; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <span style="font-size: 32px; flex-shrink: 0;">${fileIcon}</span>
                <div style="flex: 1; text-align: left;">
                  <strong style="display: block; font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 4px;">Descargar Archivo Adjunto: ${file.name}</strong>
                  <span style="font-size: 13px; color: #64748b; font-weight: 600;">Haz clic aquí para ver o descargar (${ext.toUpperCase()})</span>
                </div>
              </a>
            </div>
            <p></p>
          `).run();
        }
      }
    } catch (err) {
      console.error('Error uploading file in Tiptap:', err);
      alert('Error al subir el archivo/PDF/video.');
    } finally {
      setUploadingFile(false);
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

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Introduce la URL del enlace:', previousUrl || 'https://');
    if (url === null) {
      return; // Cancelled
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
      {/* Editor Toolbar (Sticky so it follows you when scrolling down) */}
      <div style={{
        position: 'sticky',
        top: stickyTopOffset,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        border: '1px solid #cbd5e1',
        borderBottom: '2px solid #94a3b8',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        backgroundColor: '#f8fafc',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        flexWrap: 'wrap'
      }}>
        {/* Undo / Redo */}
        <ToolbarButton
          label={<IoArrowUndoOutline size={16} />}
          title="Deshacer (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          label={<IoArrowRedoOutline size={16} />}
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
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoListOutline size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Viñetas</span></div>}
          title="Lista con Viñetas"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        />
        <ToolbarButton
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontWeight: '900', fontSize: '12px' }}>1.</span><span style={{ fontSize: '11px', fontWeight: '700' }}>Numerada</span></div>}
          title="Lista Numerada"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        />
        <ToolbarButton
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoChatboxEllipsesOutline size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Cita</span></div>}
          title="Bloque de Cita"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        />
        <ToolbarButton
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoCodeSlashOutline size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Código</span></div>}
          title="Bloque de Código (Codeblock)"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
        />

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

        {/* Links */}
        <ToolbarButton
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoLinkOutline size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Enlace</span></div>}
          title="Añadir Enlace"
          onClick={handleSetLink}
          active={editor.isActive('link')}
        />
        {editor.isActive('link') && (
          <ToolbarButton
            label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoUnlinkOutline size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Quitar</span></div>}
            title="Eliminar Enlace"
            onClick={() => editor.chain().focus().unsetLink().run()}
          />
        )}

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

        {/* Media Inserts */}
        <ToolbarButton
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoLogoYoutube size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Video</span></div>}
          title="Insertar Video de YouTube"
          onClick={handleInsertYoutube}
        />
        <ToolbarButton
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoImageOutline size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>{uploading ? 'Subiendo...' : 'Imagen'}</span></div>}
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

        <ToolbarButton
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IoDocumentAttachOutline size={16} /><span style={{ fontSize: '11px', fontWeight: '700' }}>{uploadingFile ? 'Subiendo...' : 'Archivo / Video'}</span></div>}
          title="Subir e Insertar Archivo PDF, Video o Documento"
          onClick={() => document.getElementById('tiptap-file-upload').click()}
          disabled={uploadingFile}
        />
        <input
          id="tiptap-file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.mp4,.webm,.mov,.avi"
          onChange={handleLocalFileUpload}
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

        .tiptap-editor-container .ProseMirror pre {
          background: #0f172a;
          color: #f8fafc;
          font-family: 'Courier New', Courier, monospace;
          padding: 16px 20px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 16px 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .tiptap-editor-container .ProseMirror pre code {
          color: inherit;
          padding: 0;
          background: none;
          font-size: inherit;
        }

        .tiptap-editor-container .ProseMirror code {
          background: #e2e8f0;
          color: #be185d;
          padding: 3px 6px;
          border-radius: 6px;
          font-size: 14px;
          font-family: 'Courier New', Courier, monospace;
        }

        .tiptap-editor-container .ProseMirror a {
          color: #1f75f5ff;
          text-decoration: underline;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
