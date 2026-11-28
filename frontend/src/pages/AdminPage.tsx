import { PageHeader } from "@/components/PageHeader";
import { ComingNext } from "@/components/ComingNext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function AdminPage() {
  useDocumentTitle("Administration");
  return (
    <>
      <PageHeader title="Administration" lead="Rooms, timetable, bookings and room-usage insights." />
      <ComingNext>The administration dashboard is built in the final steps.</ComingNext>
    </>
  );
}
