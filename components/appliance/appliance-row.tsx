"use client";

import { useState } from "react";
import type { Appliance } from "@/features/appliances/queries";
import type { Room } from "@/features/rooms/queries";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { commonText } from "@/lib/labels";

export function ApplianceRow({
  item,
  rooms,
  updateAction,
  deleteAction,
  redirectTo,
}: {
  item: Appliance;
  rooms: Room[];
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
  redirectTo?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={updateAction} className="grid gap-2 sm:grid-cols-2">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="home_id" value={item.home_id} />
        {redirectTo ? <input type="hidden" name="redirect_to" value={redirectTo} /> : null}
        <input name="name" defaultValue={item.name} className="h-9 rounded-md border bg-background px-3 text-sm" />
        <input name="brand" defaultValue={item.brand ?? ""} placeholder="ยี่ห้อ" className="h-9 rounded-md border bg-background px-3 text-sm" />
        <input name="model" defaultValue={item.model ?? ""} placeholder="รุ่น" className="h-9 rounded-md border bg-background px-3 text-sm" />
        <select name="room_id" defaultValue={item.room_id ?? ""} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">{commonText.noRoom}</option>
          {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </select>
        <input name="purchase_date" type="date" defaultValue={item.purchase_date ?? ""} className="h-9 rounded-md border bg-background px-3 text-sm" />
        <select
          name="warranty_type"
          defaultValue={item.warranty_lifetime ? "lifetime" : item.warranty_end_date ? "date" : "none"}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="none">ไม่มีประกัน</option>
          <option value="date">ระบุวันหมดประกัน</option>
          <option value="lifetime">ประกันตลอดชีพ</option>
        </select>
        <input name="warranty_end_date" type="date" defaultValue={item.warranty_end_date ?? ""} className="h-9 rounded-md border bg-background px-3 text-sm" />
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
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {[item.brand, item.model, item.warranty_lifetime ? "ประกันตลอดชีพ" : item.warranty_end_date ? `ประกันถึง ${formatDate(item.warranty_end_date)}` : null].filter(Boolean).join(" · ") || commonText.noDetails}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>{commonText.edit}</Button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="home_id" value={item.home_id} />
          {redirectTo ? <input type="hidden" name="redirect_to" value={redirectTo} /> : null}
          <Button variant="ghost" size="sm">{commonText.delete}</Button>
        </form>
      </div>
    </div>
  );
}
