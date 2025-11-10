
import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '../types';
import { THEMES } from '../constants';
import { AddIcon, PrintIcon, MoonIcon, SunIcon, PaddingIcon } from './Icons';

interface ToolbarProps {
  onAddBlock: () => void;
  onPrint: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
  gap: number;
  onGapChange: (gap: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddBlock,
  onPrint,
  currentTheme,
  onThemeChange,
  padding,
  onPaddingChange,
  gap,
  onGapChange,
}) => {
  const [isLayoutPickerOpen, setIsLayoutPickerOpen] = useState(false);
  const layoutPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layoutPickerRef.current && !layoutPickerRef.current.contains(event.target as Node)) {
        setIsLayoutPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
      <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
        Infograph Editor
      </h1>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={onAddBlock}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Add new block (Ctrl+A)"
        >
          <AddIcon />
          <span className="hidden sm:inline">Add Block</span>
        </button>
        <button
          onClick={onPrint}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Export to PDF"
        >
          <PrintIcon />
          <span className="hidden sm:inline">Export to PDF</span>
        </button>
        
        <div ref={layoutPickerRef} className="relative">
          <button
            onClick={() => setIsLayoutPickerOpen(prev => !prev)}
            className="flex items-center justify-center p-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Adjust layout spacing"
          >
            <PaddingIcon />
          </button>
          {isLayoutPickerOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl p-4 z-20 space-y-4">
                    <div>
                        <label htmlFor="global-padding-slider" className="block text-xs text-[var(--text-secondary)] mb-2">Block Padding</label>
                        <input
                            id="global-padding-slider"
                            type="range"
                            min="0"
                            max="3"
                            step="1"
                            value={padding}
                            onChange={(e) => onPaddingChange(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-[var(--border-primary)] rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="global-gap-slider" className="block text-xs text-[var(--text-secondary)] mb-2">Block Spacing</label>
                        <input
                            id="global-gap-slider"
                            type="range"
                            min="0"
                            max="4"
                            step="1"
                            value={gap}
                            onChange={(e) => onGapChange(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-[var(--border-primary)] rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md p-1">
          {THEMES.map(theme => (
            <button
              key={theme.name}
              onClick={() => onThemeChange(theme)}
              className={`p-1.5 rounded ${currentTheme.name === theme.name ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
              aria-pressed={currentTheme.name === theme.name}
              aria-label={`Switch to ${theme.name} theme`}
            >
              {theme.name === 'Light' ? <SunIcon /> : <MoonIcon />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;