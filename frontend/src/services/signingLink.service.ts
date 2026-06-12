import api from "./api";
import { SigningLink, ApiResponse } from "@/types";

export interface GenerateLinkPayload {
  documentId: string;
  signerEmail: string;
}

export interface ValidateTokenResult {
  link: SigningLink;
  document: {
    _id: string;
    title: string;
    originalFileName: string;
    status: string;
    fileUrl: string;
  };
  signatures: Array<{
    _id: string;
    x: number;
    y: number;
    page: number;
    pageWidth: number;
    pageHeight: number;
    status: string;
  }>;
}

export const signingLinkService = {
  async generate(
    payload: GenerateLinkPayload
  ): Promise<{ link: SigningLink; url: string }> {
    const res = await api.post<
      ApiResponse<{ link: SigningLink; url: string }>
    >("/signing-links/generate", payload);
    return res.data.data!;
  },

  async validate(token: string): Promise<ValidateTokenResult> {
    const res = await api.get<ApiResponse<ValidateTokenResult>>(
      `/signing-links/validate/${token}`
    );
    return res.data.data!;
  },

  async signViaLink(
    token: string,
    action: "sign" | "reject",
    rejectionReason?: string
  ): Promise<void> {
    await api.post(`/signing-links/sign/${token}`, {
      action,
      rejectionReason,
    });
  },

  async listForDocument(documentId: string): Promise<SigningLink[]> {
    const res = await api.get<ApiResponse<SigningLink[]>>(
      `/signing-links/document/${documentId}`
    );
    return res.data.data ?? [];
  },
};
