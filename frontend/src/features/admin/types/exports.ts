export type ExportTokenDto = {
  token: string;
  id: string;
  createdBy?: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  revoked: boolean;
  idsCsv?: string;
  query?: string;
  createdFromIp?: string;
  downloadedAt?: string;
  downloadedByIp?: string;
  revokedAt?: string;
  revokedBy?: string;
};
