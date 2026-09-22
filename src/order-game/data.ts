export const gameConfig = { gameTitle: 'Собери заказ', schoolName: '', logoUrl: '', accentColor: null as string | null };
export const items = {
  cube: { name: 'Кубик', color: '#6799ef' }, crystal: { name: 'Кристалл', color: '#a78ae7' },
  crate: { name: 'Ящик', color: '#eab16c' }, battery: { name: 'Батарея', color: '#75c9aa' },
  wheel: { name: 'Колесо', color: '#8297bb' }, lamp: { name: 'Лампа', color: '#f2ce69' },
  chip: { name: 'Чип', color: '#71bfbe' }, robot_part: { name: 'Модуль', color: '#9c9cd6' },
};
export type Item = keyof typeof items;
export type Order = { items: { type: Item; count: number }[]; available: Item[] };
export const orders: Order[] = [
  { items: [{ type: 'cube', count: 2 }], available: ['cube'] },
  { items: [{ type: 'crystal', count: 3 }], available: ['crystal'] },
  { items: [{ type: 'crate', count: 4 }], available: ['crate'] },
  { items: [{ type: 'battery', count: 4 }], available: ['battery'] },
  { items: [{ type: 'crystal', count: 5 }], available: ['cube', 'crystal', 'chip'] },
  { items: [{ type: 'wheel', count: 4 }], available: ['battery', 'robot_part', 'wheel'] },
  { items: [{ type: 'lamp', count: 5 }], available: ['lamp', 'cube', 'chip'] },
  { items: [{ type: 'crystal', count: 3 }, { type: 'crate', count: 2 }], available: ['crate', 'wheel', 'crystal'] },
  { items: [{ type: 'battery', count: 3 }, { type: 'wheel', count: 3 }], available: ['lamp', 'battery', 'wheel'] },
  { items: [{ type: 'crystal', count: 4 }, { type: 'crate', count: 3 }, { type: 'lamp', count: 2 }], available: ['crystal', 'crate', 'lamp', 'chip'] },
];
