import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';

export type ServiceHealthStatus = 'healthy' | 'degraded' | 'down';

export interface SystemStatusReport {
  checked_at: string;
  overall: ServiceHealthStatus;
  services: {
    api: {
      status: ServiceHealthStatus;
      uptime_sec: number;
      node_version: string;
      memory_mb: { rss: number; heapUsed: number; heapTotal: number };
    };
    postgres: {
      status: ServiceHealthStatus;
      latency_ms: number | null;
      pool: { total: number; idle: number; waiting: number } | null;
      error?: string;
    };
    redis: {
      status: ServiceHealthStatus;
      latency_ms: number | null;
      memory_used_mb: number | null;
      connected_clients: number | null;
      error?: string;
    };
    integrations: {
      cloudinary: { configured: boolean };
      brevo: { configured: boolean };
      google_places: { configured: boolean };
      firebase: { configured: boolean };
    };
  };
  host: {
    platform: string;
    hostname: string;
    loadavg: number[];
    free_memory_mb: number;
  };
}

export async function fetchSystemStatus(): Promise<SystemStatusReport> {
  const res = await clientFetch<SystemStatusReport>(bffPaths.admin.systemStatus);
  return res.data!;
}
