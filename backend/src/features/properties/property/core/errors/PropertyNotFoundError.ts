export class PropertyNotFoundError extends Error {
  constructor(id: string) {
    super(`Property with ID ${id} not found`);
    this.name = 'PropertyNotFoundError';
  }
}
