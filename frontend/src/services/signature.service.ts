import api from "./api";
import { Signature, ApiResponse } from "@/types";

export interface CreateSignaturePayload {
  documentId: string;
  signerEmail?: string;
  x: number;
  y: number;
  page: number;
  pageWidth: number;
  pageHeight: number;
}

export const signatureService = {
  async create(payload: CreateSignaturePayload): Promise<Signature> {
    const res = await api.post<ApiResponse<Signature>>("/signatures", payload);
    return res.data.data!;
  },

  async listByDocument(documentId: string): Promise<Signature[]> {
    const res = await api.get<ApiResponse<Signature[]>>(
      `/signatures/document/${documentId}`
    );
    return res.data.data ?? [];
  },

  async delete(signatureId: string): Promise<void> {
    await api.delete(`/signatures/${signatureId}`);
  },

  async finalize(documentId: string): Promise<{ signedFileUrl: string }> {
    const res = await api.post<ApiResponse<{ signedFileUrl: string }>>(
      `/signatures/finalize/${documentId}`
    );
    return res.data.data!;
  },
};
