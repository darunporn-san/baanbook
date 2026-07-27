"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Room } from "@/features/rooms/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDimension } from "@/lib/format";
import { commonText, openingTypeLabels } from "@/lib/labels";

export function RoomRow({
  room,
  updateAction,
  deleteAction,
  createOpeningAction,
  updateOpeningAction,
  deleteOpeningAction,
}: {
  room: Room;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
  createOpeningAction: (formData: FormData) => void;
  updateOpeningAction: (formData: FormData) => void;
  deleteOpeningAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editingOpeningId, setEditingOpeningId] = useState<string | null>(null);
  const floorArea = room.width_m != null && room.length_m != null ? room.width_m * room.length_m : null;
  const wallArea =
    room.width_m != null && room.length_m != null && room.height_m != null
      ? 2 * (room.width_m + room.length_m) * room.height_m
      : null;
  const volume =
    room.width_m != null && room.length_m != null && room.height_m != null
      ? room.width_m * room.length_m * room.height_m
      : null;
  const openingArea = room.openings.reduce((total, opening) => {
    if (opening.width_m == null || opening.height_m == null) return total;
    return total + opening.width_m * opening.height_m * opening.quantity;
  }, 0);
  const paintArea = wallArea == null ? null : Math.max(wallArea - openingArea, 0);

  if (editing) {
    return (
      <div className="rounded-md border bg-white p-4">
        <form action={updateAction} className="grid gap-5">
          <input type="hidden" name="id" value={room.id} />
          <input type="hidden" name="home_id" value={room.home_id} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`room-name-${room.id}`}>ชื่อห้อง</Label>
              <Input id={`room-name-${room.id}`} name="name" defaultValue={room.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`room-floor-${room.id}`}>ชั้น</Label>
              <Input id={`room-floor-${room.id}`} name="floor" defaultValue={room.floor ?? ""} placeholder="2" />
            </div>
          </div>

          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">ขนาดห้อง</p>
            <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`room-width-${room.id}`}>กว้าง (ม.)</Label>
                <Input id={`room-width-${room.id}`} name="width_m" type="number" step="0.01" min="0" defaultValue={room.width_m ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`room-length-${room.id}`}>ยาว (ม.)</Label>
                <Input id={`room-length-${room.id}`} name="length_m" type="number" step="0.01" min="0" defaultValue={room.length_m ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`room-height-${room.id}`}>สูง (ม.)</Label>
                <Input id={`room-height-${room.id}`} name="height_m" type="number" step="0.01" min="0" defaultValue={room.height_m ?? ""} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm">{commonText.save}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>{commonText.cancel}</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="relative z-0 min-w-0 has-[>details[name='room-actions'][open]]:z-[5]">
      <details className="group min-w-0 overflow-hidden rounded-md border bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none flex-col gap-3 rounded-md bg-[#e8f5f3] p-4 pr-16 marker:content-none sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-lg font-semibold">{room.name}</p>
            <p className="text-sm text-muted-foreground">
              {room.floor ? `ชั้น ${room.floor}` : "ไม่ระบุชั้น"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1.5 text-muted-foreground shadow-sm">
              {floorArea == null
                ? "ยังไม่ระบุพื้นที่"
                : `${formatDimension(floorArea)} ตร.ม.`}
            </span>

            <span className="rounded-full bg-white px-3 py-1.5 text-muted-foreground shadow-sm">
              {room.openings.length} ช่องเปิด
            </span>
          </div>
        </summary>

        <div className="grid gap-4 border-t p-4 [container-type:inline-size]">
          <div className="grid gap-3 [@container(min-width:30rem)]:grid-cols-2 [@container(min-width:42rem)]:grid-cols-3 [@container(min-width:60rem)]:grid-cols-5">
            <div className="min-h-24 rounded-md bg-[#ff806f] p-4 text-white">
              <p className="text-xs font-semibold uppercase text-white/75">ขนาดห้อง</p>
              <p className="mt-2 text-lg font-semibold">
                {formatDimension(room.width_m) ?? "-"} x {formatDimension(room.length_m) ?? "-"} x {formatDimension(room.height_m) ?? "-"} ม.
              </p>
              <p className="mt-1 text-xs text-white/75">กว้าง x ยาว x สูง</p>
            </div>
            <div className="min-h-24 rounded-md bg-[#ffd36a] p-4 text-[#514227]">
              <p className="text-xs font-semibold uppercase text-[#705b2f]">พื้นที่พื้น</p>
              <p className="mt-2 text-lg font-semibold">{floorArea == null ? "-" : `${formatDimension(floorArea)} ตร.ม.`}</p>
              <p className="mt-1 text-xs text-[#705b2f]">ประเมินงานพื้น</p>
            </div>
            <div className="min-h-24 rounded-md bg-[#00bfa5] p-4 text-white">
              <p className="text-xs font-semibold uppercase text-white/75">พื้นที่ผนัง</p>
              <p className="mt-2 text-lg font-semibold">{wallArea == null ? "-" : `${formatDimension(wallArea)} ตร.ม.`}</p>
              <p className="mt-1 text-xs text-white/75">ประเมินงานสีและผนัง</p>
            </div>
            <div className="min-h-24 rounded-md border bg-[#f4faf9] p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">ปริมาตร</p>
              <p className="mt-2 text-lg font-semibold">{volume == null ? "-" : `${formatDimension(volume)} ลบ.ม.`}</p>
              <p className="mt-1 text-xs text-muted-foreground">ประเมินแอร์และความจุ</p>
            </div>
            <div className="min-h-24 rounded-md bg-[#246a78] p-4 text-white">
              <p className="text-xs font-semibold uppercase text-white/75">พื้นที่ต้องทาสี</p>
              <p className="mt-2 text-lg font-semibold">{paintArea == null ? "-" : `${formatDimension(paintArea)} ตร.ม.`}</p>
              <p className="mt-1 text-xs text-white/75">พื้นที่ผนังหักช่องเปิด</p>
            </div>
          </div>

          <div className="min-w-0 rounded-md border bg-[#f4faf9] [container-type:inline-size]">
            <div className="grid gap-4 border-b p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold">ขนาดช่องเปิด</p>
                <p className="text-xs text-muted-foreground">หน้าต่าง ประตู ระเบียง และขนาดจริงสำหรับวางแผนรีโนเวท</p>
              </div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm">
                  <p className="text-base font-semibold">{room.window_count}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">หน้าต่าง</p>
                </div>
                <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm">
                  <p className="text-base font-semibold">{room.door_count}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">ประตู</p>
                </div>
                <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm">
                  <p className="text-base font-semibold">{room.balcony_count}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">ระเบียง</p>
                </div>
                <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm">
                  <p className="text-base font-semibold">{formatDimension(openingArea) ?? "0"}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">ตร.ม.</p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-4 p-4">
              <div className="grid min-w-0 content-start gap-2 [@container(min-width:30rem)]:grid-cols-2">
                {room.openings.length ? (
                  room.openings.map((opening) => (
                    editingOpeningId === opening.id ? (
                      <form key={opening.id} action={updateOpeningAction} className="grid gap-3 rounded-md border bg-white p-3 shadow-sm [@container(min-width:30rem)]:col-span-2">
                        <input type="hidden" name="id" value={opening.id} />
                        <input type="hidden" name="home_id" value={room.home_id} />
                        <input type="hidden" name="room_id" value={room.id} />
                        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-[150px_1fr]">
                          <div className="space-y-1">
                            <Label htmlFor={`edit-opening-type-${opening.id}`}>ประเภท</Label>
                            <select
                              id={`edit-opening-type-${opening.id}`}
                              name="opening_type"
                              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                              defaultValue={opening.opening_type}
                            >
                              {Object.entries(openingTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-opening-label-${opening.id}`}>ชื่อรายการ</Label>
                            <Input id={`edit-opening-label-${opening.id}`} name="label" defaultValue={opening.label ?? ""} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                          <div className="space-y-1">
                            <Label htmlFor={`edit-opening-width-${opening.id}`}>กว้าง</Label>
                            <Input id={`edit-opening-width-${opening.id}`} name="width_m" type="number" step="0.01" min="0" defaultValue={opening.width_m ?? ""} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-opening-height-${opening.id}`}>สูง</Label>
                            <Input id={`edit-opening-height-${opening.id}`} name="height_m" type="number" step="0.01" min="0" defaultValue={opening.height_m ?? ""} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-opening-quantity-${opening.id}`}>จำนวน</Label>
                            <Input id={`edit-opening-quantity-${opening.id}`} name="quantity" type="number" step="1" min="1" defaultValue={opening.quantity} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">บันทึกช่องเปิด</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingOpeningId(null)}>{commonText.cancel}</Button>
                        </div>
                      </form>
                    ) : (
                      <div key={opening.id} className="grid min-w-0 gap-3 rounded-md border bg-white p-3 shadow-sm">
                        <div className="grid min-w-0 gap-2">
                          <div>
                            <p className="text-sm font-semibold">{opening.label || openingTypeLabels[opening.opening_type]}</p>
                            <p className="text-xs text-muted-foreground">{openingTypeLabels[opening.opening_type]}</p>
                          </div>
                          <div className="rounded-md bg-[#eef5f6] px-3 py-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">ขนาด</p>
                            <p className="text-sm font-semibold">
                              {formatDimension(opening.width_m) ?? "-"} x {formatDimension(opening.height_m) ?? "-"} ม.
                            </p>
                          </div>
                          <div className="rounded-md bg-[#eef5f6] px-3 py-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">จำนวน</p>
                            <p className="text-sm font-semibold">{opening.quantity}</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingOpeningId(opening.id)}>{commonText.edit}</Button>
                          <form action={deleteOpeningAction}>
                            <input type="hidden" name="id" value={opening.id} />
                            <input type="hidden" name="home_id" value={room.home_id} />
                            <input type="hidden" name="room_id" value={room.id} />
                            <Button variant="ghost" size="sm">{commonText.delete}</Button>
                          </form>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="rounded-md border border-dashed bg-white p-4 [@container(min-width:30rem)]:col-span-2">
                    <p className="text-sm font-semibold">ยังไม่มีขนาดช่องเปิด</p>
                    <p className="text-xs text-muted-foreground">เพิ่มหน้าต่าง ประตู หรือระเบียงเพื่อเริ่มวัดงานรีโนเวท</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </details>
      <details name="room-actions" className="absolute right-3 top-6 z-10">
        <summary
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border bg-white text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground [&::-webkit-details-marker]:hidden"
          aria-label={`เมนูจัดการ ${room.name}`}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </summary>
        <div className="absolute right-0 top-11 grid w-36 gap-1 rounded-md border bg-white p-1.5 shadow-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={(event) => {
              event.currentTarget.closest("details")?.removeAttribute("open");
              (
                document.getElementById(
                  `create-opening-${room.id}`,
                ) as HTMLDialogElement | null
              )?.showModal();
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            เพิ่มช่องเปิด
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {commonText.edit}
          </Button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={room.id} />
            <input type="hidden" name="home_id" value={room.home_id} />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {commonText.delete}
            </Button>
          </form>
        </div>
      </details>
      <dialog
        id={`create-opening-${room.id}`}
        aria-labelledby={`create-opening-title-${room.id}`}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white p-0 text-foreground shadow-2xl backdrop:bg-slate-950/35 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 sm:p-5">
          <div>
            <h2
              id={`create-opening-title-${room.id}`}
              className="text-lg font-semibold"
            >
              เพิ่มช่องเปิด
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              เพิ่มหน้าต่าง ประตู หรือระเบียงใน {room.name}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="ปิดหน้าต่างเพิ่มช่องเปิด"
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <form
          action={createOpeningAction}
          className="grid max-h-[calc(100dvh-7rem)] gap-3 overflow-y-auto p-4 sm:p-5"
        >
          <input type="hidden" name="home_id" value={room.home_id} />
          <input type="hidden" name="room_id" value={room.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`opening-type-${room.id}`}>ประเภท</Label>
              <select
                id={`opening-type-${room.id}`}
                name="opening_type"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                defaultValue="window"
              >
                {Object.entries(openingTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`opening-label-${room.id}`}>ชื่อรายการ</Label>
              <Input id={`opening-label-${room.id}`} name="label" placeholder="หน้าต่าง 1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor={`opening-width-${room.id}`}>กว้าง</Label>
              <Input id={`opening-width-${room.id}`} name="width_m" type="number" step="0.01" min="0" placeholder="1.20" />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`opening-height-${room.id}`}>สูง</Label>
              <Input id={`opening-height-${room.id}`} name="height_m" type="number" step="0.01" min="0" placeholder="1.00" />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`opening-quantity-${room.id}`}>จำนวน</Label>
              <Input id={`opening-quantity-${room.id}`} name="quantity" type="number" step="1" min="1" defaultValue="1" />
            </div>
          </div>
          <Button size="sm">เพิ่มช่องเปิด</Button>
        </form>
      </dialog>
    </div>
  );
}
