import api from "./api";
import { AuditLog, ApiResponse } from "@/types";

export const auditService = {
  async getTrail(documentId: string): Promise<AuditLog[]> {
    const res = await api.get<ApiResponse<AuditLog[]>>(
      `/audit/${documentId}`
    );
    return res.data.data ?? [];
  },
};
