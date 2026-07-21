import type { HomeSummary } from "@/features/homes/queries";
import { Button } from "@/components/ui/button";

export function HeaderHomeSwitcher({
  action,
  label,
  homes,
  homeId,
  hiddenFields,
}: {
  action: string;
  label: string;
  homes: HomeSummary[];
  homeId?: string;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      className="grid gap-2 rounded-lg bg-white/15 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
    >
      {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="grid min-w-0 gap-1.5">
        <label
          htmlFor={`${action.slice(1)}-home`}
          className="text-xs font-medium opacity-80"
        >
          {label}
        </label>
        <select
          id={`${action.slice(1)}-home`}
          name="homeId"
          defaultValue={homeId}
          className="h-10 min-w-0 rounded-md border border-white/20 bg-white px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {homes.map((home) => (
            <option key={home.id} value={home.id}>
              {home.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="secondary">
        ดูข้อมูล
      </Button>
    </form>
  );
}
