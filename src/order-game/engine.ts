import { orders, type Item } from './data';
export type State = { index: number; selected: Item | null; counts: Partial<Record<Item, number>>; score: number; copies: number; complete: boolean; message: string; serial: number };
export function initialOrder(index = 0, score = 0, copies = 0): State {
  return { index, selected: null, counts: Object.fromEntries(orders[index].items.map(i => [i.type, 1])), score, copies, complete: false, message: '', serial: 0 };
}
export function duplicate(s: State): State {
  if (s.complete) return s;
  if (!s.selected) return { ...s, message: 'Сначала выбери предмет', serial: s.serial + 1 };
  const target = orders[s.index].items.find(i => i.type === s.selected);
  if (!target) return { ...s, message: 'Сейчас нужен другой предмет', serial: s.serial + 1 };
  if ((s.counts[target.type] ?? 0) >= target.count) return { ...s, message: 'Этих предметов уже достаточно. Выбери следующий!', serial: s.serial + 1 };
  const counts = { ...s.counts, [target.type]: (s.counts[target.type] ?? 1) + 1 };
  const complete = orders[s.index].items.every(i => (counts[i.type] ?? 0) >= i.count);
  return { ...s, counts, complete, copies: s.copies + 1, score: s.score + 10 + (complete ? 50 : 0), message: complete ? 'Заказ готов!' : 'Отлично! Ещё одна копия', serial: s.serial + 1 };
}
