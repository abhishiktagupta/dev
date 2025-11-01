export type EventItem = {
  id: string;
  timestamp: string; // ISO
  type: string;
  severity?: string;
  kill_chain_phase?: string;
  attacker: { id: string; ip: string; name: string; port?: number };
  decoy: { id?: number; name: string; group?: string; ip?: string; port?: number; type?: string };
};

export type TableResponse = {
  items: EventItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
