"use client";

import { useState } from "react";
import type { TimelineEvent } from "@/features/timeline/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { commonText, formatTimelineTitle, getLabel, timelineEventLabels } from "@/lib/labels";

function eventDateValue(value: string) {
  return value.slice(0, 10);
}

function eventTimeValue(value: string) {
  const time = value.includes("T") ? value.split("T")[1] : "";
  return time?.slice(0, 5) ?? "";
}

export function TimelineEventRow({
  event,
  updateAction,
  deleteAction,
}: {
  event: TimelineEvent;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={updateAction} className="grid gap-4 rounded-md border bg-white p-4 shadow-sm">
        <input type="hidden" name="id" value={event.id} />
        <input type="hidden" name="home_id" value={event.home_id} />
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label htmlFor={`timeline-title-${event.id}`}>หัวข้อ</Label>
            <Input id={`timeline-title-${event.id}`} name="title" defaultValue={formatTimelineTitle(event.title)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`timeline-type-${event.id}`}>ประเภท</Label>
            <select id={`timeline-type-${event.id}`} name="event_type" defaultValue={event.event_type} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {Object.entries(timelineEventLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`timeline-date-${event.id}`}>วันที่</Label>
            <Input id={`timeline-date-${event.id}`} name="event_date" type="date" defaultValue={eventDateValue(event.event_date)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`timeline-time-${event.id}`}>เวลา</Label>
            <Input id={`timeline-time-${event.id}`} name="event_time" type="time" defaultValue={eventTimeValue(event.event_date)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`timeline-description-${event.id}`}>รายละเอียด</Label>
          <Input id={`timeline-description-${event.id}`} name="description" defaultValue={event.description ?? ""} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>{commonText.cancel}</Button>
          <Button size="sm">{commonText.save}</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-3 rounded-md border bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="relative pl-5">
        <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#00bfa5]" />
        <span className="absolute bottom-0 left-[5px] top-6 w-px bg-border" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#e8f5f3] px-3 py-1 text-xs font-semibold text-primary">
            {getLabel(timelineEventLabels, event.event_type)}
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(event.event_date)}</span>
          {eventTimeValue(event.event_date) ? <span className="text-xs text-muted-foreground">{eventTimeValue(event.event_date)}</span> : null}
        </div>
        <p className="mt-2 text-base font-semibold">{formatTimelineTitle(event.title)}</p>
        {event.description ? <p className="mt-1 text-sm text-muted-foreground">{event.description}</p> : null}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>{commonText.edit}</Button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="home_id" value={event.home_id} />
          <Button variant="ghost" size="sm">{commonText.delete}</Button>
        </form>
      </div>
    </div>
  );
}
