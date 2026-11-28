import { Link } from "react-router";
import { PageHeader } from "@/components/PageHeader";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <>
      <PageHeader title="Page not found" lead="That address does not exist." />
      <Link to="/">Back to the start</Link>
    </>
  );
}
