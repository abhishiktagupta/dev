export type EventItem = {
  id: string;
  timestamp: string; // ISO
  type: string;
  severity?: string;
  kill_chain_phase?: string;
  attacker: { id: string; ip: string; name: string; port?: number };
  decoy: { id?: number; name: string; group?: string; ip?: string; port?: number; type?: string };
};

export type CountBucket = { timestamp: string; count: number };
