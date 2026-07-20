"use client";

import { useState } from "react";
import type { HomeDocument } from "@/features/documents/queries";
import type { Room } from "@/features/rooms/queries";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { commonText, documentTypeLabels, getLabel } from "@/lib/labels";

export function DocumentRow({
  document,
  rooms,
  updateAction,
  deleteAction,
}: {
  document: HomeDocument;
  rooms: Room[];
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={updateAction} className="grid gap-2 sm:grid-cols-2">
        <input type="hidden" name="id" value={document.id} />
        <input type="hidden" name="home_id" value={document.home_id} />
        <input name="title" defaultValue={document.title} className="h-9 rounded-md border bg-background px-3 text-sm" />
        <select name="document_type" defaultValue={document.document_type} className="h-9 rounded-md border bg-background px-3 text-sm">
          {Object.entries(documentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="room_id" defaultValue={document.room_id ?? ""} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">{commonText.noRoom}</option>
          {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </select>
        <input name="notes" placeholder="บันทึก" className="h-9 rounded-md border bg-background px-3 text-sm" />
        <div className="flex gap-2">
          <Button size="sm">{commonText.save}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>{commonText.cancel}</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-medium">{document.title}</p>
        <p className="text-sm text-muted-foreground">
          {getLabel(documentTypeLabels, document.document_type)} · {document.file_name ?? commonText.noFile} · {formatDate(document.created_at)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>{commonText.edit}</Button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={document.id} />
          <input type="hidden" name="home_id" value={document.home_id} />
          <Button variant="ghost" size="sm">{commonText.delete}</Button>
        </form>
      </div>
    </div>
  );
}
