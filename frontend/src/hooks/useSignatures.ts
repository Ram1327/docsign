import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Signature } from "@/types";
import {
  signatureService,
  CreateSignaturePayload,
} from "@/services/signature.service";

interface UseSignaturesResult {
  signatures: Signature[];
  isLoading: boolean;
  addSignature: (payload: CreateSignaturePayload) => Promise<Signature | null>;
  removeSignature: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useSignatures(documentId: string): UseSignaturesResult {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;

    setIsLoading(true);
    signatureService
      .listByDocument(documentId)
      .then((sigs) => { if (!cancelled) setSignatures(sigs); })
      .catch(() => { if (!cancelled) setSignatures([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [documentId, tick]);

  const addSignature = useCallback(
    async (payload: CreateSignaturePayload): Promise<Signature | null> => {
      try {
        const sig = await signatureService.create(payload);
        setSignatures((prev) => [...prev, sig]);
        toast.success("Signature field placed");
        return sig;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to place signature";
        toast.error(msg);
        return null;
      }
    },
    []
  );

  const removeSignature = useCallback(async (id: string): Promise<void> => {
    await signatureService.delete(id);
    setSignatures((prev) => prev.filter((s) => s._id !== id));
    toast.success("Signature field removed");
  }, []);

  return { signatures, isLoading, addSignature, removeSignature, refetch };
}
