
export interface QueryOptions {
  select?: string[];
  where?: Record<string, any>;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
  relations?: string[];
}

export interface IBaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  findAll(options?: QueryOptions): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  add(data: CreateDTO): Promise<T>;
  updateById(id: string, data: UpdateDTO): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(where?: Record<string, any>): Promise<number>;
  exists(where: Record<string, any>): Promise<boolean>;
}
