import { PageHeader } from "@/components/PageHeader";
import { ComingNext } from "@/components/ComingNext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function SearchPage() {
  useDocumentTitle("Find a room");
  return (
    <>
      <PageHeader title="Find a room" lead="Describe what you need, or set the filters yourself." />
      <ComingNext>The search form and the natural-language request box are built next.</ComingNext>
    </>
  );
}
