import { BlockData, Theme } from './types';

export const THEMES: Theme[] = [
  { name: 'Light', className: 'theme-light' },
  { name: 'Dark', className: 'theme-dark' },
];

export const COLOR_PALETTE = [
    { name: 'Default', bg: 'var(--bg-secondary)', text: 'var(--text-primary)' },
    { name: 'Muted', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200' },
    { name: 'Sky', bg: 'bg-sky-100 dark:bg-sky-900/50', text: 'text-sky-800 dark:text-sky-200' },
    { name: 'Rose', bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-800 dark:text-rose-200' },
    { name: 'Emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-800 dark:text-emerald-200' },
    { name: 'Amber', bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-800 dark:text-amber-200' },
];

export const INITIAL_BLOCKS: BlockData[] = [
  {
    id: 'block-1',
    content: '## Welcome to your Infographic!\n\nThis is a masonry-style editor. You can **drag and drop** blocks to reorder them.',
    colSpan: 2,
  },
   {
    id: 'block-6',
    content: 'This block has an image. The text below acts as a caption. You can upload your own images using the controls that appear on hover.',
    colSpan: 1,
    imageUrl: 'https://picsum.photos/seed/infograph/400/300',
  },
  {
    id: 'block-2',
    content: '### Features\n\n*   Resizable columns\n*   FLIP animations\n*   Theming & Colors\n*   Image Uploads',
    colSpan: 1,
  },
  {
    id: 'block-3',
    content: 'Use the controls on each block to change its column span or delete it. Or use keyboard shortcuts: `+` / `-` to resize and `Delete` to remove the selected block.',
    colSpan: 1,
  },
  {
    id: 'block-4',
    content: '### Print Ready\n\nClick the "Export to PDF" button in the toolbar to get a print-friendly version of your layout. All UI elements will be hidden automatically.',
    colSpan: 2,
    backgroundColor: 'bg-sky-100 dark:bg-sky-900/50',
    textColor: 'text-sky-800 dark:text-sky-200'
  },
   {
    id: 'block-5',
    content: '#### Try adding a new block with `Ctrl/Cmd + A`',
    colSpan: 3,
  },
];
