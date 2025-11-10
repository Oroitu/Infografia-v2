import { useLayoutEffect, useRef } from 'react';

// A type-safe FLIP animation hook
function useFlip<T extends HTMLElement>(dependency: any) {
  const ref = useRef<T>(null);
  const boundingBoxes = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // First: Record initial positions
    const newBoxes = new Map<string, DOMRect>();
    for (const child of Array.from(element.children)) {
      const flipId = (child as HTMLElement).dataset.flipId;
      if (flipId) {
        // Fix: Explicitly cast child to HTMLElement to access getBoundingClientRect, which was causing a type error.
        newBoxes.set(flipId, (child as HTMLElement).getBoundingClientRect());
      }
    }

    // Invert & Play: Animate from old positions to new positions
    for (const child of Array.from(element.children)) {
      const flipId = (child as HTMLElement).dataset.flipId;
      if (!flipId) continue;
      
      const oldBox = boundingBoxes.current.get(flipId);
      const newBox = newBoxes.get(flipId);

      if (oldBox && newBox) {
        const deltaX = oldBox.left - newBox.left;
        const deltaY = oldBox.top - newBox.top;

        // If there's a change, invert the position and play the animation
        if (deltaX !== 0 || deltaY !== 0) {
          requestAnimationFrame(() => {
            (child as HTMLElement).style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            (child as HTMLElement).style.transition = 'transform 0s';
            
            // Play the animation in the next frame
            requestAnimationFrame(() => {
              (child as HTMLElement).style.transform = '';
              (child as HTMLElement).style.transition = 'transform 300ms ease-in-out';
            });
          });
        }
      }
    }

    // Last: Update the stored positions for the next render
    boundingBoxes.current = newBoxes;
  }, [dependency]);

  return ref;
}

export default useFlip;
