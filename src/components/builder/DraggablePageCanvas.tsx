"use client";

import { useRef, useState } from "react";
import PageBlocks from "@/components/builder/PageBlocks";
import { PAGE_BLOCK_KINDS } from "@/platform/builder/page-model";
import type { PageDocument, PageBlockKind } from "@/platform/builder/page-model";

type DragSession = { fromId: string; targetId: string; active: boolean; startX: number; startY: number };
type Props = {
 blocks: PageDocument;
 selectedId: string | null;
 siteBasePath: string;
 busy: boolean;
 onSelect: (id: string) => void;
 onMove: (from: number, to: number) => void;
 onInsert: (kind: PageBlockKind, atIndex: number) => void;
};

export default function DraggablePageCanvas({ blocks, selectedId, siteBasePath, busy, onSelect, onMove, onInsert }: Props) {
 const drag = useRef<DragSession | null>(null);
 const [draggedId, setDraggedId] = useState<string | null>(null);
 const [overId, setOverId] = useState<string | null>(null);

 function getTarget(x: number, y: number): string | null {
  const element = document.elementFromPoint(x,y);
  return element?.closest<HTMLElement>("[data-veyra-canvas-block]")?.dataset.veyraCanvasBlock ?? null;
 }
 function onStart(event: React.PointerEvent<HTMLButtonElement>, id: string) {
  if (busy || event.button !== 0) return;
  drag.current = { fromId: id, targetId: id, active: false, startX: event.clientX, startY: event.clientY };
  event.currentTarget.setPointerCapture(event.pointerId);
  onSelect(id);
 }
 function onDrag(event: React.PointerEvent<HTMLButtonElement>) {
  const state = drag.current;
  if (!state) return;
  const dist = Math.hypot(event.clientX-state.startX, event.clientY-state.startY);
  if (dist < 6 && !state.active) return;
  state.active = true;
  setDraggedId(state.fromId);
  const target = getTarget(event.clientX,event.clientY);
  if (target) { state.targetId=target;setOverId(target); }
 }
 function finish(event: React.PointerEvent<HTMLButtonElement>, cancelled = false) {
  const state = drag.current;
  if (!state) return;
  if (!cancelled && state.active) {
   const target = getTarget(event.clientX,event.clientY) ?? state.targetId;
   const from = blocks.findIndex(item=>item.id===state.fromId);
   const to = blocks.findIndex(item=>item.id===target);
   if (from >= 0 && to >= 0 && from !== to) onMove(from,to);
  }
  drag.current=null;setDraggedId(null);setOverId(null);
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
 }
 function allowPaletteDrop(event: React.DragEvent<HTMLElement>) {
   if (!busy && event.dataTransfer.types.includes("application/x-veyra-block")) {
     event.preventDefault();
     event.dataTransfer.dropEffect = "copy";
   }
 }
 function insertPaletteDrop(event: React.DragEvent<HTMLElement>, index: number) {
   if (busy) return;
   const kind = event.dataTransfer.getData("application/x-veyra-block");
   if (!PAGE_BLOCK_KINDS.includes(kind as PageBlockKind)) return;
   event.preventDefault();
   event.stopPropagation();
   onInsert(kind as PageBlockKind, index);
 }
 return <div className="vstudio-drag-canvas" aria-label="Direct manipulation website canvas"
    onDragOver={allowPaletteDrop}
    onDrop={event=>insertPaletteDrop(event,blocks.length)}>
   {blocks.map((block,index)=><div key={block.id}
     data-veyra-canvas-block={block.id}
     className={["vstudio-editable-block",block.id===selectedId?"is-selected":"",block.id===draggedId?"is-dragging":"",block.id===overId && draggedId!==block.id?"is-drop-target":""].filter(Boolean).join(" ")}
     onClick={()=>{if(!drag.current&&!busy)onSelect(block.id);}}
     onDragOver={allowPaletteDrop}
     onDrop={event=>insertPaletteDrop(event,index)}
   >
     <div className="vstudio-editable-controls">
      <button type="button" className="vstudio-drag-handle"
        aria-label={`Drag to reorder ${block.type} element ${index+1}`}
        title="Drag with mouse or finger to move"
        disabled={busy}
        onPointerDown={event=>onStart(event,block.id)}
        onPointerMove={onDrag}
        onPointerUp={event=>finish(event)}
        onPointerCancel={event=>finish(event,true)}>⠿ <span>Drag</span></button>
      <button type="button" aria-label={`Edit ${block.type} element ${index+1}`}
        disabled={busy} onClick={()=>onSelect(block.id)}>Edit</button>
      <span>{index+1} / {block.type}</span>
     </div>
     <div className="vstudio-editable-content"><PageBlocks blocks={[block]} siteBasePath={siteBasePath} /></div>
   </div>)}
 </div>;
}
