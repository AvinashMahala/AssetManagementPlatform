import { useCallback } from 'react';
import type { Meter, MeterInput, MeterReading, MeterReadingInput } from '@/features/meters/types';
import { meterService, type PaginationOptions, type PaginationResult, type MeterFilters } from '../services/meterService';
import { useApi, useApiMutation } from './useApi';

/**
 * Get all meters with optional filtering and pagination
 */
export function useMeters(options?: PaginationOptions, filters?: MeterFilters) {
  const query = useCallback(() => meterService.getAll(options, filters), [options, filters]);
  return useApi<PaginationResult<Meter>>(query, [options, filters]);
}

/**
 * Get meter by ID
 */
export function useMeter(id: string) {
  const query = useCallback(() => meterService.getById(id), [id]);
  return useApi<Meter>(query, [id]);
}

/**
 * Create meter
 */
export function useCreateMeter() {
  return useApiMutation<Meter, MeterInput>(
    (data) => meterService.create(data)
  );
}

/**
 * Update meter
 */
export function useUpdateMeter() {
  return useApiMutation<Meter, { id: string; data: Partial<MeterInput> }>(
    ({ id, data }) => meterService.update(id, data)
  );
}

/**
 * Delete meter
 */
export function useDeleteMeter() {
  return useApiMutation<void, string>((id) => meterService.delete(id));
}

/**
 * Update meter status
 */
export function useUpdateMeterStatus() {
  return useApiMutation<void, { id: string; isActive: boolean }>(
    ({ id, isActive }) => meterService.updateStatus(id, isActive)
  );
}

/**
 * Get meter readings
 */
export function useMeterReadings(meterId: string, startDate?: string, endDate?: string) {
  const query = useCallback(
    () => meterService.getMeterReadings(meterId, startDate, endDate),
    [meterId, startDate, endDate]
  );
  return useApi<{ readings: MeterReading[] }>(query, [meterId, startDate, endDate]);
}

/**
 * Get latest meter reading
 */
export function useLatestMeterReading(meterId: string) {
  const query = useCallback(() => meterService.getLatestReading(meterId), [meterId]);
  return useApi<MeterReading>(query, [meterId]);
}

/**
 * Create meter reading
 */
export function useCreateMeterReading() {
  return useApiMutation<MeterReading, { meterId: string; data: Omit<MeterReadingInput, 'meterId'> }>(
    ({ meterId, data }) => meterService.createReading(meterId, data)
  );
}

/**
 * Update meter reading
 */
export function useUpdateMeterReading() {
  return useApiMutation<MeterReading, { id: string; data: Partial<MeterReadingInput> }>(
    ({ id, data }) => meterService.updateReading(id, data)
  );
}

/**
 * Delete meter reading
 */
export function useDeleteMeterReading() {
  return useApiMutation<void, string>((id) => meterService.deleteReading(id));
}

/**
 * Get meter trend data
 */
export function useMeterTrend(meterId: string, months: number = 6) {
  const query = useCallback(
    () => meterService.getTrendData(meterId, months),
    [meterId, months]
  );
  return useApi<{ trend: any[] }>(query, [meterId, months]);
}

/**
 * Get meter statistics
 */
export function useMeterStatistics(meterId: string) {
  const query = useCallback(() => meterService.getStatistics(meterId), [meterId]);
  return useApi<any>(query, [meterId]);
}