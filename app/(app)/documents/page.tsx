import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateDocumentForm } from "@/components/document/create-document-form";
import { DocumentRow } from "@/components/document/document-row";
import { deleteDocument, updateDocument } from "@/features/documents/actions";
import { listDocuments } from "@/features/documents/queries";
import { listHomes } from "@/features/homes/queries";
import { listRooms } from "@/features/rooms/queries";
import { formatDate } from "@/lib/format";
import { commonText, documentTypeLabels, getLabel } from "@/lib/labels";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const rooms = await listRooms(home?.id);
  const documents = await listDocuments(home?.id);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-xl bg-[#246a78] p-5 text-white shadow-sm sm:p-6">
        <p className="text-sm font-medium text-white/70">คลังข้อมูลของบ้าน</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">เอกสาร</h1>
        <p className="mt-2 text-sm text-white/80">
          เก็บใบเสร็จ ประกัน คู่มือ และสัญญา
        </p>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <form
            action="/documents"
            className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="space-y-2">
              <label htmlFor="documents-home" className="text-sm font-medium">
                บ้านของเอกสาร
              </label>
              <select
                id="documents-home"
                name="homeId"
                defaultValue={home?.id}
                className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {homes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">ดูข้อมูล</Button>
          </form>
          <div className="grid gap-3">
            {documents.length ? (
              documents.map((document) => (
                <Card key={document.id} className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {document.title}
                    </CardTitle>
                    <CardDescription>
                      {getLabel(documentTypeLabels, document.document_type)} ·{" "}
                      {document.file_name ?? commonText.noFile} ·{" "}
                      {formatDate(document.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentRow
                      document={document}
                      rooms={rooms}
                      updateAction={updateDocument}
                      deleteAction={deleteDocument}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">ยังไม่มีเอกสาร</CardTitle>
                  <CardDescription>เพิ่มเอกสารรายการแรก</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </section>
        <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มเอกสาร</CardTitle>
            <CardDescription>แนบไฟล์หรือบันทึกข้อมูลเอกสารก่อน</CardDescription>
          </CardHeader>
          <CardContent>
            {home ? (
              <CreateDocumentForm
                homeId={home.id}
                homes={homes}
                rooms={rooms}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                สร้างบ้านก่อนเพิ่มเอกสาร
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
