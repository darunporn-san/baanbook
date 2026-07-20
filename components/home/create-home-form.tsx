import { createHome } from "@/features/homes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homeTypeLabels } from "@/lib/labels";

export function CreateHomeForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  return (
    <form action={createHome} className="space-y-4">
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <div className="space-y-2">
        <Label htmlFor="name">ชื่อบ้าน</Label>
        <Input id="name" name="name" placeholder="บ้านสุขใจ" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="home_type">ประเภทบ้าน</Label>
        <select
          id="home_type"
          name="home_type"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue="house"
        >
          {Object.entries(homeTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <Button type="submit">สร้างบ้าน</Button>
    </form>
  );
}
