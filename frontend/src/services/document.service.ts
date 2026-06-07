import api from "./api";
import { Document, ApiResponse, PaginatedResponse } from "@/types";

export interface UploadDocumentPayload {
  file: File;
  title?: string;
}

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const documentService = {
  async upload(
    payload: UploadDocumentPayload,
    onProgress?: (percent: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.title) formData.append("title", payload.title);

    const res = await api.post<ApiResponse<Document>>(
      "/documents/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      }
    );
    return res.data.data!;
  },

  async list(params: ListDocumentsParams = {}): Promise<{
    documents: Document[];
    pagination: PaginatedResponse<Document>["pagination"];
  }> {
    const res = await api.get<PaginatedResponse<Document>>("/documents", {
      params,
    });
    return {
      documents: res.data.data ?? [],
      pagination: res.data.pagination,
    };
  },

  async getOne(id: string): Promise<Document> {
    const res = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return res.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  // Returns a URL to open the protected PDF in an iframe/tab
  getFileUrl(id: string, signed = false): string {
    const base = import.meta.env.VITE_API_URL ?? "/api";
    return `${base}/documents/${id}/${signed ? "signed-file" : "file"}`;
  },
};
