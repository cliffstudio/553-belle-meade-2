import { useRef } from "react";

type TouchPointerEvent = React.PointerEvent<HTMLElement>;
type TouchMouseEvent = React.MouseEvent<HTMLElement>;

interface TouchDragClickGuardHandlers {
  onPointerDown: (event: TouchPointerEvent) => void;
  onPointerMove: (event: TouchPointerEvent) => void;
  onPointerUp: (event: TouchPointerEvent) => void;
  onPointerCancel: (event: TouchPointerEvent) => void;
  onClick: (event: TouchMouseEvent) => void;
}

function useTouchDragClickGuard(
  dragThreshold = 8,
): TouchDragClickGuardHandlers {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isTouchDraggingRef = useRef(false);

  const onPointerDown = (event: TouchPointerEvent) => {
    if (event.pointerType !== "touch") return;
    touchStartRef.current = { x: event.clientX, y: event.clientY };
    isTouchDraggingRef.current = false;
  };

  const onPointerMove = (event: TouchPointerEvent) => {
    if (event.pointerType !== "touch" || !touchStartRef.current) return;
    const deltaX = Math.abs(event.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(event.clientY - touchStartRef.current.y);
    if (deltaX > dragThreshold || deltaY > dragThreshold) {
      isTouchDraggingRef.current = true;
    }
  };

  const onPointerEnd = (event: TouchPointerEvent) => {
    if (event.pointerType !== "touch") return;
    touchStartRef.current = null;
  };

  const onClick = (event: TouchMouseEvent) => {
    if (isTouchDraggingRef.current) {
      event.preventDefault();
      isTouchDraggingRef.current = false;
    }
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    onClick,
  };
}

export default useTouchDragClickGuard;
