import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { BlockData } from '../types';
import Block from './Block';
import useFlip from '../hooks/useFlip';
import { DragIndicatorIcon } from './Icons';

interface GridProps {
  blocks: BlockData[];
  onUpdateBlock: (id: string, updates: Partial<Omit<BlockData, 'id'>>) => void;
  onDeleteBlock: (id:string) => void;
  onReorderBlocks: (reorderedBlocks: BlockData[]) => void;
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  padding: number;
  gap: number;
  isEditingBlock: boolean;
  setIsEditingBlock: (isEditing: boolean) => void;
}

const ROW_HEIGHT_PX = 10; // The unit height for a grid row in pixels.
const GAP_VALUES_PX = [0, 8, 16, 24, 32]; // Spacing values in pixels

const Grid: React.FC<GridProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  activeBlockId,
  setActiveBlockId,
  padding,
  gap,
  isEditingBlock,
  setIsEditingBlock,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [previewBlocks, setPreviewBlocks] = useState<BlockData[] | null>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizingBlockInfo, setResizingBlockInfo] = useState<{ id: string; colSpan: BlockData['colSpan'] } | null>(null);
  const [draggedBlockHeight, setDraggedBlockHeight] = useState<number | null>(null);

  const displayBlocks = resizingBlockInfo
    ? blocks.map(b => b.id === resizingBlockInfo.id ? { ...b, colSpan: resizingBlockInfo.colSpan } : b)
    : previewBlocks || blocks;

  const gridRef = useFlip<HTMLDivElement>(displayBlocks.map(b => b.id + b.colSpan).join(''));
  const blockRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const gridItemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const currentGap = GAP_VALUES_PX[gap];

  useEffect(() => {
    if (activeBlockId) {
      const blockElement = blockRefs.current.get(activeBlockId);
      blockElement?.focus();
    }
  }, [activeBlockId]);

  useLayoutEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;

    // Use the dynamic gap value for calculations
    const rowGap = currentGap;

    gridItemRefs.current.forEach((itemEl) => {
      if (itemEl) {
        // Find the block content element to measure its actual height
        const contentEl = itemEl.querySelector(':scope > div:last-child') as HTMLElement;
        if (contentEl) {
          const contentHeight = contentEl.getBoundingClientRect().height;
          // Calculate how many rows the item should span.
          const span = Math.ceil((contentHeight + rowGap) / (ROW_HEIGHT_PX + rowGap));
          itemEl.style.gridRowEnd = `span ${span}`;
        }
      }
    });
  }, [displayBlocks, padding, currentGap, draggedBlockHeight]); // Recalculate when blocks, padding or gap change
  
  const colSpanClasses: { [key in BlockData['colSpan']]: string } = {
    1: 'sm:col-span-1',
    2: 'sm:col-span-2',
    3: 'sm:col-span-3',
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    const blockEl = gridItemRefs.current.get(id);
    if (blockEl) {
      setDraggedBlockHeight(blockEl.getBoundingClientRect().height);
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setTimeout(() => {
        setDraggedId(id);
    }, 0);
  };

  const handleDragOverItem = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedId || targetId === draggedId) return;

    // Always calculate reordering based on the original, stable `blocks` array
    // to prevent unstable feedback loops from using the preview state as input.
    const sourceIndex = blocks.findIndex((b) => b.id === draggedId);
    const targetIndex = blocks.findIndex((b) => b.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const targetElement = e.currentTarget;
    const rect = targetElement.getBoundingClientRect();
    const isAfter = e.clientY > rect.top + rect.height / 2;
    
    const reordered = Array.from(blocks);
    // FIX: Refactored to avoid array destructuring from splice, which might have caused type inference issues.
    const removedItems = reordered.splice(sourceIndex, 1);
    
    if (removedItems.length === 0) {
      handleDragEnd();
      return;
    }
    const removed = removedItems[0];

    const newTargetIndex = reordered.findIndex((b) => b.id === targetId);
    reordered.splice(newTargetIndex + (isAfter ? 1 : 0), 0, removed);

    const newOrderIds = reordered.map((b) => b.id).join('');
    const currentPreviewIds = (previewBlocks || []).map((b) => b.id).join('');

    if (newOrderIds !== currentPreviewIds) {
       setPreviewBlocks(reordered);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (previewBlocks) {
      onReorderBlocks(previewBlocks);
    }
    handleDragEnd();
  };
  
  const handleDragEnd = () => {
    setDraggedId(null);
    setPreviewBlocks(null);
    setDraggedBlockHeight(null);
  };
  
  const handleDragLeaveGrid = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setPreviewBlocks(null); // Reset preview if dragged outside
    }
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizePreview = (id: string, newColSpan: BlockData['colSpan']) => {
    if (!resizingBlockInfo || resizingBlockInfo.id !== id || resizingBlockInfo.colSpan !== newColSpan) {
      setResizingBlockInfo({ id, colSpan: newColSpan });
    }
  };

  const handleResizeEnd = (id: string, finalColSpan: BlockData['colSpan']) => {
    if (blocks.find(b => b.id === id)?.colSpan !== finalColSpan) {
      onUpdateBlock(id, { colSpan: finalColSpan });
    }
    setResizingBlockInfo(null);
    setIsResizing(false);
  };


  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-3 print-container"
      role="grid"
      aria-label="Infographic content grid"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeaveGrid}
      style={{ 
        gridAutoRows: `${ROW_HEIGHT_PX}px`,
        gap: `${currentGap}px`,
      }}
    >
      {displayBlocks.map(block => {
        const isBeingDragged = block.id === draggedId;
        
        return (
            <div
              ref={el => gridItemRefs.current.set(block.id, el)}
              key={block.id}
              data-flip-id={block.id}
              draggable={!isEditingBlock && !isResizing && !isBeingDragged}
              onDragStart={(e) => !isEditingBlock && !isResizing && handleDragStart(e, block.id)}
              onDragOver={(e) => handleDragOverItem(e, block.id)}
              onDragEnd={handleDragEnd}
              className={`
                ${colSpanClasses[block.colSpan]} 
                transition-all duration-300 relative group print-block
                ${activeBlockId === block.id ? 'z-10' : ''}
              `}
              role="gridcell"
            >
              {isBeingDragged ? (
                <div 
                  className="w-full bg-[var(--bg-tertiary)]/50 border-2 border-dashed border-[var(--text-secondary)]/50 rounded-lg"
                  style={{ height: draggedBlockHeight ? `${draggedBlockHeight}px` : '100px' }}
                />
              ) : (
                <>
                  <div 
                    className={`absolute -top-3 -left-3 p-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-opacity no-print z-10 border border-[var(--border-primary)] shadow-sm ${isEditingBlock || isResizing ? 'opacity-0 cursor-not-allowed' : 'cursor-move opacity-0 group-hover:opacity-100'}`}
                    aria-label="Drag to reorder"
                  >
                    <DragIndicatorIcon />
                  </div>
                  <Block
                    ref={el => {
                        if (el) blockRefs.current.set(block.id, el);
                        else blockRefs.current.delete(block.id);
                    }}
                    data={block}
                    onUpdate={onUpdateBlock}
                    onDelete={onDeleteBlock}
                    isActive={activeBlockId === block.id}
                    onFocus={() => !isEditingBlock && !isResizing && setActiveBlockId(block.id)}
                    padding={padding}
                    isEditingBlock={isEditingBlock}
                    setIsEditingBlock={setIsEditingBlock}
                    onResizeStart={handleResizeStart}
                    onResizePreview={handleResizePreview}
                    onResizeEnd={handleResizeEnd}
                  />
                </>
              )}
            </div>
      )})}
    </div>
  );
};

export default Grid;