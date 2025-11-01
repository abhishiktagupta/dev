import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventItem } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cache: EventItem[] | null = null;

export function loadEvents(): EventItem[] {
  if (cache) return cache;
  const dataPath = path.resolve(__dirname, '../../../Data.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(raw) as any[];
  cache = parsed.map(normalizeItem);
  return cache;
}

function normalizeItem(src: any): EventItem {
  // Source has flat keys like "attacker.id"; build nested shape
  return {
    id: String(src.id),
    timestamp: String(src.timestamp),
    type: String(src.type ?? ''),
    severity: src.severity ? String(src.severity) : undefined,
    kill_chain_phase: src.kill_chain_phase ? String(src.kill_chain_phase) : undefined,
    attacker: {
      id: src['attacker.id'] ? String(src['attacker.id']) : '',
      ip: src['attacker.ip'] ? String(src['attacker.ip']) : '',
      name: src['attacker.name'] ? String(src['attacker.name']) : '',
      port: typeof src['attacker.port'] === 'number' ? src['attacker.port'] : undefined
    },
    decoy: {
      id: typeof src['decoy.id'] === 'number' ? src['decoy.id'] : undefined,
      name: src['decoy.name'] ? String(src['decoy.name']) : '',
      group: src['decoy.group'] ? String(src['decoy.group']) : undefined,
      ip: src['decoy.ip'] ? String(src['decoy.ip']) : undefined,
      port: typeof src['decoy.port'] === 'number' ? src['decoy.port'] : undefined,
      type: src['decoy.type'] ? String(src['decoy.type']) : undefined
    }
  };
}
