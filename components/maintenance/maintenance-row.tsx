"use client";

import { useState } from "react";
import type { Appliance } from "@/features/appliances/queries";
import type { MaintenanceTask } from "@/features/maintenance/queries";
import type { Room } from "@/features/rooms/queries";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { formatDate } from "@/lib/format";
import { commonText, getLabel, maintenanceStatusLabels, priorityLabels } from "@/lib/labels";

export function MaintenanceRow({
  task,
  rooms,
  appliances,
  updateAction,
  completeAction,
  deleteAction,
}: {
  task: MaintenanceTask;
  rooms: Room[];
  appliances: Appliance[];
  updateAction: (formData: FormData) => void;
  completeAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={updateAction} className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="home_id" value={task.home_id} />
        <input name="title" defaultValue={task.title} className="h-9 rounded-md border bg-background px-3 text-sm" />
        <input name="description" defaultValue={task.description ?? ""} placeholder="บันทึก" className="h-9 rounded-md border bg-background px-3 text-sm" />
        <select name="status" defaultValue={task.status} className="h-9 rounded-md border bg-background px-3 text-sm">
          {Object.entries(maintenanceStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="priority" defaultValue={task.priority} className="h-9 rounded-md border bg-background px-3 text-sm">
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <DateInput name="due_date" defaultValue={task.due_date ?? ""} className="h-9" />
        <select name="room_id" defaultValue={task.room_id ?? ""} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">{commonText.noRoom}</option>
          {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </select>
        <select name="appliance_id" defaultValue={task.appliance_id ?? ""} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">{commonText.noAppliance}</option>
          {appliances.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <div className="flex gap-2">
          <Button size="sm">{commonText.save}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>{commonText.cancel}</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div>
        <p className="font-medium">{task.title}</p>
        <p className="text-sm text-muted-foreground">
          {getLabel(maintenanceStatusLabels, task.status)} · {getLabel(priorityLabels, task.priority)} · {formatDate(task.due_date) || "ไม่มีกำหนด"}
        </p>
        {task.description ? <p className="mt-1 text-sm text-muted-foreground">{task.description}</p> : null}
      </div>
      <div className="flex gap-2">
        {task.status !== "done" ? (
          <form action={completeAction}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="home_id" value={task.home_id} />
            <input type="hidden" name="title" value={task.title} />
            <Button size="sm">เสร็จแล้ว</Button>
          </form>
        ) : null}
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>{commonText.edit}</Button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="home_id" value={task.home_id} />
          <Button variant="ghost" size="sm">{commonText.delete}</Button>
        </form>
      </div>
    </div>
  );
}
