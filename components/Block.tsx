
import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { BlockData } from '../types';
import { MinusIcon, PlusIcon, TrashIcon, ImageIcon, XIcon, PaletteIcon } from './Icons';
import { COLOR_PALETTE } from '../constants';

interface BlockProps {
  data: BlockData;
  onUpdate: (id: string, updates: Partial<Omit<BlockData, 'id'>>) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  onFocus: () => void;
  padding: number;
  isEditingBlock: boolean;
  setIsEditingBlock: (isEditing: boolean) => void;
  onResizeStart: () => void;
  onResizePreview: (id: string, newColSpan: BlockData['colSpan']) => void;
  onResizeEnd: (id: string, finalColSpan: BlockData['colSpan']) => void;
}

const Block = forwardRef<HTMLDivElement, BlockProps>(({ data, onUpdate, onDelete, isActive, onFocus, padding, isEditingBlock, setIsEditingBlock, onResizeStart, onResizePreview, onResizeEnd }, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  const blockRef = useRef<HTMLDivElement>(null);
  const resizeDirection = useRef<'left' | 'right' | null>(null);
  const dragStartX = useRef<number>(0);
  const initialColSpan = useRef<number>(data.colSpan);
  const initialWidth = useRef<number>(0);
  const lastClientX = useRef<number>(0);

  const composedRef = (el: HTMLDivElement | null) => {
    (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && 'current' in ref) {
      ref.current = el;
    }
  };

  useEffect(() => {
    setContent(data.content);
  }, [data.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const handleStartEditing = () => {
    if (!isEditing && !isEditingBlock) {
      setIsEditing(true);
      setIsEditingBlock(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    setIsEditingBlock(false);
    if (content !== data.content) {
        onUpdate(data.id, { content });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate(data.id, { imageUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onUpdate(data.id, { imageUrl: undefined });
  };

  const handleSpanChange = (increment: 1 | -1) => {
    const newSpan = data.colSpan + increment;
    if (newSpan >= 1 && newSpan <= 3) {
      onUpdate(data.id, { colSpan: newSpan as BlockData['colSpan'] });
    }
  };

  const handleColorChange = (color: {name: string, bg: string, text: string}) => {
    if (color.name === 'Default') {
        onUpdate(data.id, { backgroundColor: undefined, textColor: undefined });
    } else {
        onUpdate(data.id, { backgroundColor: color.bg, textColor: color.text });
    }
    setIsColorPickerOpen(false);
  };
  
  const handleResizeStart = (e: React.DragEvent<HTMLDivElement>, direction: 'left' | 'right') => {
    e.stopPropagation();
    onResizeStart();
    
    resizeDirection.current = direction;
    dragStartX.current = e.clientX;
    lastClientX.current = e.clientX;
    initialColSpan.current = data.colSpan;
    if (blockRef.current) {
      initialWidth.current = blockRef.current.getBoundingClientRect().width;
    }
    
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleResizeDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.clientX === 0 || e.clientX === lastClientX.current) {
      return;
    }
    lastClientX.current = e.clientX;
    
    if (initialWidth.current === 0 || !resizeDirection.current) return;

    const columnWidth = initialWidth.current / initialColSpan.current;
    
    const deltaX = e.clientX - dragStartX.current;
    const columnsChanged = Math.round(deltaX / columnWidth);

    const spanChange = resizeDirection.current === 'right' ? columnsChanged : -columnsChanged;
    let newColSpan = initialColSpan.current + spanChange;
    newColSpan = Math.max(1, Math.min(3, newColSpan));

    onResizePreview(data.id, newColSpan as BlockData['colSpan']);
  };

  const handleResizeEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!resizeDirection.current) return;

    if (initialWidth.current === 0) {
      onResizeEnd(data.id, data.colSpan); // Cancel resize if width is invalid
      resizeDirection.current = null;
      return;
    }
    
    const columnWidth = initialWidth.current / initialColSpan.current;
    const deltaX = lastClientX.current - dragStartX.current;
    const columnsChanged = Math.round(deltaX / columnWidth);

    const spanChange = resizeDirection.current === 'right' ? columnsChanged : -columnsChanged;
    let finalColSpan = initialColSpan.current + spanChange;
    finalColSpan = Math.max(1, Math.min(3, finalColSpan));

    onResizeEnd(data.id, finalColSpan as BlockData['colSpan']);
    
    resizeDirection.current = null;
  };

  const handleResizeOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const renderContent = () => {
    // A very simple markdown-to-html parser
    const htmlContent = content
      .split('\n')
      .map(line => {
        if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
        if (line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/`(.*?)`/g, '<code class="bg-black/10 dark:bg-white/10 text-sm rounded px-1 py-0.5">$1</code>');
        return `<p>${line}</p>`;
      })
      .join('')
      .replace(/<\/li><p>/g, '</li>')
      .replace(/<\/p><li>/g, '<li>')
      .replace(/<li>/g, '<ul class="list-disc pl-5"><li>')
      .replace(/<\/li>(?!<li>)/g, '</li></ul>');

      return (
        <div
            className="prose prose-sm max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-headings:text-current prose-strong:text-current prose-p:text-current prose-li:text-current"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
  }

  const blockBgClass = data.backgroundColor && !COLOR_PALETTE.find(c => c.name === 'Default' && c.bg === data.backgroundColor) ? data.backgroundColor : 'bg-[var(--bg-secondary)]';
  const paddingClasses = ['p-2', 'p-4', 'p-6', 'p-8'];
  const currentPaddingIndex = padding;
  const paddingClass = paddingClasses[currentPaddingIndex];

  return (
    <div
      ref={composedRef}
      className={`relative rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border ${isActive ? 'ring-2 ring-[var(--accent-primary)] border-transparent' : 'border-[var(--border-primary)]'} flex flex-col ${blockBgClass} ${data.textColor || ''} ${isEditing ? 'animate-pulse-ring' : ''}`}
      style={data.backgroundColor?.startsWith('var(') ? { backgroundColor: data.backgroundColor, color: data.textColor } : {}}
      tabIndex={0}
      onFocus={onFocus}
      aria-label={`Infographic block, column span ${data.colSpan}, content: ${data.content.substring(0, 50)}...`}
    >
      {isActive && !isEditing && (
        <>
          {/* Left Resize Handle */}
          {data.colSpan > 1 && (
            <div
              className="absolute left-0 top-0 z-10 h-full w-4 group/handle flex items-center justify-start cursor-ew-resize"
              draggable
              onDragStart={(e) => handleResizeStart(e, 'left')}
              onDrag={handleResizeDrag}
              onDragEnd={handleResizeEnd}
              onDragOver={handleResizeOver}
              aria-label="Decrease column span"
            >
              <div className="w-1.5 h-10 bg-[var(--accent-primary)] rounded-full opacity-50 group-hover/handle:opacity-100 transition-opacity" />
            </div>
          )}
          {/* Right Resize Handle */}
          {data.colSpan < 3 && (
            <div
              className="absolute right-0 top-0 z-10 h-full w-4 group/handle flex items-center justify-end cursor-ew-resize"
              draggable
              onDragStart={(e) => handleResizeStart(e, 'right')}
              onDrag={handleResizeDrag}
              onDragEnd={handleResizeEnd}
              onDragOver={handleResizeOver}
              aria-label="Increase column span"
            >
              <div className="w-1.5 h-10 bg-[var(--accent-primary)] rounded-full opacity-50 group-hover/handle:opacity-100 transition-opacity" />
            </div>
          )}
        </>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />

      {data.imageUrl && (
        <div className="flex-shrink-0 bg-black/5 rounded-t-lg overflow-hidden">
          <img src={data.imageUrl} alt="" className="w-full h-auto max-h-96 object-cover" />
        </div>
      )}

      <div className={`${paddingClass} flex-grow flex flex-col`} onClick={handleStartEditing}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onBlur={handleBlur}
            className="w-full bg-transparent border-0 p-0 focus:ring-0 resize-none text-current flex-grow"
            aria-label="Edit block content"
          />
        ) : (
          <div className="cursor-pointer min-h-[50px] flex-grow">
              {renderContent()}
          </div>
        )}
      </div>

      <div className="absolute -bottom-3 right-2 flex items-center space-x-1 p-1 bg-[var(--bg-tertiary)] rounded-full border border-[var(--border-primary)] shadow-sm opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity no-print">
        <div ref={colorPickerRef} className="relative">
            <button onClick={() => setIsColorPickerOpen(prev => !prev)} className="p-1 rounded-full hover:bg-[var(--border-primary)]" aria-label="Change block color">
                <PaletteIcon />
            </button>
            {isColorPickerOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl p-2 z-20">
                    <div className="grid grid-cols-5 gap-2">
                        {COLOR_PALETTE.map(color => (
                            <button
                                key={color.name}
                                onClick={() => handleColorChange(color)}
                                className={`w-8 h-8 rounded-full border border-black/10 transition-transform hover:scale-110 ${color.name === 'Default' ? 'bg-[var(--bg-secondary)]' : color.bg}`}
                                aria-label={`Set color to ${color.name}`}
                                style={color.name === 'Default' ? { backgroundColor: color.bg } : {}}
                            >
                                {((data.backgroundColor === color.bg) || (!data.backgroundColor && color.name === 'Default')) && (
                                    <span className={`block w-3 h-3 rounded-full mx-auto ${color.name === 'Default' ? 'bg-[var(--text-primary)]' : 'bg-white'}`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <button onClick={triggerImageUpload} className="p-1 rounded-full hover:bg-[var(--border-primary)]" aria-label={data.imageUrl ? "Change image" : "Upload image"}>
          <ImageIcon />
        </button>
        {data.imageUrl && (
            <button onClick={handleRemoveImage} className="p-1 rounded-full text-red-500 hover:bg-red-100" aria-label="Remove image">
              <XIcon />
            </button>
        )}
        <div className="w-px h-4 bg-[var(--border-primary)] mx-1"></div>
        <button onClick={() => handleSpanChange(-1)} disabled={data.colSpan === 1} className="p-1 rounded-full hover:bg-[var(--border-primary)] disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Decrease column span">
          <MinusIcon />
        </button>
        <span className="text-xs font-mono w-4 text-center text-[var(--text-secondary)]">{data.colSpan}</span>
        <button onClick={() => handleSpanChange(1)} disabled={data.colSpan === 3} className="p-1 rounded-full hover:bg-[var(--border-primary)] disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Increase column span">
          <PlusIcon />
        </button>
        <div className="w-px h-4 bg-[var(--border-primary)] mx-1"></div>
        <button onClick={() => onDelete(data.id)} className="p-1 rounded-full text-red-500 hover:bg-red-100" aria-label="Delete block">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
});

export default Block;
