import type { Smoke, Item, WeightLog } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null, error: error as Error };
  }
}

// Smokes API
export async function getSmokes(): Promise<{ data: Smoke[] | null; error: Error | null }> {
  return fetchApi<Smoke[]>('/smokes');
}

export async function getSmoke(id: number): Promise<{ data: Smoke | null; error: Error | null }> {
  return fetchApi<Smoke>(`/smokes/${id}`);
}

export async function createSmoke(
  smoke: Pick<Smoke, 'name' | 'notes'>
): Promise<{ data: Smoke | null; error: Error | null }> {
  return fetchApi<Smoke>('/smokes', {
    method: 'POST',
    body: JSON.stringify(smoke),
  });
}

export async function updateSmoke(
  id: number,
  smoke: Partial<Pick<Smoke, 'name' | 'notes'>>
): Promise<{ data: Smoke | null; error: Error | null }> {
  return fetchApi<Smoke>(`/smokes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(smoke),
  });
}

// Items API
export async function getItems(
  smokeId?: number
): Promise<{ data: Item[] | null; error: Error | null }> {
  const query = smokeId ? `?smoke_id=${smokeId}` : '';
  return fetchApi<Item[]>(`/items${query}`);
}

export async function getItem(id: number): Promise<{ data: Item | null; error: Error | null }> {
  return fetchApi<Item>(`/items/${id}`);
}

export async function createItem(
  item: Omit<Item, 'id' | 'created_at'>
): Promise<{ data: Item | null; error: Error | null }> {
  return fetchApi<Item>('/items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function updateItem(
  id: number,
  item: Partial<Omit<Item, 'id' | 'created_at' | 'smoke_id'>>
): Promise<{ data: Item | null; error: Error | null }> {
  return fetchApi<Item>(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

export async function deleteItem(id: number): Promise<{ data: null; error: Error | null }> {
  return fetchApi<null>(`/items/${id}`, {
    method: 'DELETE',
  });
}

// Weight Logs API
export async function getWeightLogs(
  itemId: number
): Promise<{ data: WeightLog[] | null; error: Error | null }> {
  return fetchApi<WeightLog[]>(`/weight-logs?item_id=${itemId}`);
}

export async function createWeightLogs(
  logs: Omit<WeightLog, 'id'>[]
): Promise<{ data: WeightLog[] | null; error: Error | null }> {
  return fetchApi<WeightLog[]>('/weight-logs', {
    method: 'POST',
    body: JSON.stringify(logs),
  });
}

export async function deleteWeightLog(id: number): Promise<{ data: null; error: Error | null }> {
  return fetchApi<null>(`/weight-logs/${id}`, {
    method: 'DELETE',
  });
}
