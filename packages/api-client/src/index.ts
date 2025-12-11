/**
 * Shared HTTP client for Connecting Hands
 */

export { createApiClient, ApiClient } from './client';
export type { ApiClientConfig } from './types';
export { createHandDetectionApi } from './endpoints/handDetection';
export { createHealthApi } from './endpoints/health';
