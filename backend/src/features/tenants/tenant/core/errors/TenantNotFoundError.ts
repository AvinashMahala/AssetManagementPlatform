export class TenantNotFoundError extends Error {
  constructor(id: string) {
    super(`Tenant with ID ${id} not found`);
    this.name = 'TenantNotFoundError';
  }
}
