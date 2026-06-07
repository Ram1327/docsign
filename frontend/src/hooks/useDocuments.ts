import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Document } from "@/types";
import { documentService, ListDocumentsParams } from "@/services/document.service";

interface UseDocumentsResult {
  documents: Document[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  deleteDocument: (id: string) => Promise<void>;
}

export function useDocuments(params: ListDocumentsParams = {}): UseDocumentsResult {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    documentService
      .list(params)
      .then(({ documents: docs, pagination }) => {
        if (cancelled) return;
        setDocuments(docs);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to load documents";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, params.page, params.limit, params.status]);

  const deleteDocument = useCallback(
    async (id: string) => {
      await documentService.delete(id);
      toast.success("Document deleted");
      refetch();
    },
    [refetch]
  );

  return { documents, total, totalPages, isLoading, error, refetch, deleteDocument };
}
