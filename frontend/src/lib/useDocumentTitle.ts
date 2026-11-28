import { useEffect } from "react";

/** Sets the browser tab title; screen readers announce it on navigation. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Smart Room`;
  }, [title]);
}
