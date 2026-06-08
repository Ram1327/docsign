import { useState, useEffect } from "react";
import api from "@/services/api";

interface UsePDFBlobResult {
  blobUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches a protected PDF through the authenticated Axios instance
 * and returns a local blob URL safe for react-pdf to render.
 *
 * Why: react-pdf uses fetch() directly (not Axios), so it can't attach
 * the Authorization header. This hook bridges the gap.
 */
export function usePDFBlob(apiPath: string): UsePDFBlobResult {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiPath) return;

    let objectUrl: string | null = null;

    setIsLoading(true);
    setError(null);

    api
      .get<Blob>(apiPath, { responseType: "blob" })
      .then(({ data }) => {
        objectUrl = URL.createObjectURL(data);
        setBlobUrl(objectUrl);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to load PDF";
        setError(msg);
      })
      .finally(() => setIsLoading(false));

    // Cleanup blob URL on unmount to prevent memory leaks
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [apiPath]);

  return { blobUrl, isLoading, error };
}
