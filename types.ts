export interface BlockData {
  id: string;
  content: string;
  colSpan: 1 | 2 | 3;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface Theme {
  name: string;
  className: string;
}
