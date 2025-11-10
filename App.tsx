
import React, { useState, useCallback, useEffect } from 'react';
import { BlockData, Theme } from './types';
import { INITIAL_BLOCKS, THEMES } from './constants';
import Toolbar from './components/Toolbar';
import Grid from './components/Grid';

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockData[]>(INITIAL_BLOCKS);
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isEditingBlock, setIsEditingBlock] = useState<boolean>(false);
  const [internalPadding, setInternalPadding] = useState<number>(1);
  const [gap, setGap] = useState<number>(2);

  useEffect(() => {
    document.documentElement.className = theme.className;
  }, [theme]);
  
  const handleAddBlock = useCallback(() => {
    const newBlock: BlockData = {
      id: `block-${Date.now()}`,
      content: 'New block. Click to edit...',
      colSpan: 1,
    };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setActiveBlockId(newBlock.id);
  }, []);

  const handleUpdateBlock = useCallback((id: string, updates: Partial<Omit<BlockData, 'id'>>) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  }, []);
  
  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
    setActiveBlockId(null);
  }, []);

  const handleReorderBlocks = useCallback((reorderedBlocks: BlockData[]) => {
    setBlocks(reorderedBlocks);
  }, []);

  const handlePrint = () => {
    window.print();
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add Block: Ctrl/Cmd + A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        handleAddBlock();
      }

      if (activeBlockId) {
        const isEditingText =
          document.activeElement instanceof HTMLTextAreaElement ||
          document.activeElement instanceof HTMLInputElement;

        // Delete Block: Delete/Backspace (only if not editing text)
        if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
           e.preventDefault();
           handleDeleteBlock(activeBlockId);
        }
        
        // Change column span
        const currentBlock = blocks.find(b => b.id === activeBlockId);
        if (currentBlock) {
            if(e.key === '+' || e.key === '=') {
                e.preventDefault();
                handleUpdateBlock(activeBlockId, { colSpan: Math.min(3, currentBlock.colSpan + 1) });
            }
            if(e.key === '-') {
                e.preventDefault();
                handleUpdateBlock(activeBlockId, { colSpan: Math.max(1, currentBlock.colSpan - 1) });
            }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleAddBlock, handleDeleteBlock, handleUpdateBlock, activeBlockId, blocks]);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <header className="no-print p-4 sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm border-b border-[var(--border-primary)] z-20">
        <Toolbar
          onAddBlock={handleAddBlock}
          onPrint={handlePrint}
          currentTheme={theme}
          onThemeChange={setTheme}
          padding={internalPadding}
          onPaddingChange={setInternalPadding}
          gap={gap}
          onGapChange={setGap}
        />
      </header>
      <main id="infographic-content" className="flex-grow p-4 sm:p-6 md:p-8">
        <Grid
          blocks={blocks}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onReorderBlocks={handleReorderBlocks}
          activeBlockId={activeBlockId}
          setActiveBlockId={setActiveBlockId}
          padding={internalPadding}
          gap={gap}
          isEditingBlock={isEditingBlock}
          setIsEditingBlock={setIsEditingBlock}
        />
      </main>
    </div>
  );
};

export default App;