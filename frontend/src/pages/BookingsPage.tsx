import { PageHeader } from "@/components/PageHeader";
import { ComingNext } from "@/components/ComingNext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function BookingsPage() {
  useDocumentTitle("My bookings");
  return (
    <>
      <PageHeader title="My bookings" lead="Your upcoming additional sessions." />
      <ComingNext>Your booked sessions and cancellation appear here once booking is built.</ComingNext>
    </>
  );
}
