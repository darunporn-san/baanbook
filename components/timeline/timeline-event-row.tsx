import type { TimelineEvent } from "@/features/timeline/queries";
import { formatDate } from "@/lib/format";
import {
  formatTimelineTitle,
  getLabel,
  timelineEventLabels,
} from "@/lib/labels";

function eventTimeValue(value: string) {
  const time = value.includes("T") ? value.split("T")[1] : "";
  return time?.slice(0, 5) ?? "";
}

export function TimelineEventRow({
  event,
  done,
}: {
  event: TimelineEvent;
  done: boolean;
}) {
  return (
    <div className="rounded-md border bg-white p-4 shadow-sm">
      <div className="relative pl-5">
        <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#00bfa5]" />
        <span className="absolute bottom-0 left-[5px] top-6 w-px bg-border" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#e8f5f3] px-3 py-1 text-xs font-semibold text-primary">
            {getLabel(timelineEventLabels, event.event_type)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(event.event_date)}
          </span>
          {eventTimeValue(event.event_date) ? (
            <span className="text-xs text-muted-foreground">
              {eventTimeValue(event.event_date)}
            </span>
          ) : null}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              done
                ? "bg-secondary text-muted-foreground"
                : "bg-[#fff5d8] text-[#705b2f]"
            }`}
          >
            {done ? "จบแล้ว" : "ยังไม่จบ"}
          </span>
        </div>
        <p className="mt-2 text-base font-semibold">
          {formatTimelineTitle(event.title)}
        </p>
        {event.description ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {event.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
