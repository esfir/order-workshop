import { items, type Item } from './data';
export function ItemImage({ type, className = '' }: { type: Item; className?: string }) {
  return <img className={`item-image ${className}`} src={`${import.meta.env.BASE_URL}assets/items/item_${type}.png`} alt={items[type].name} draggable={false} />;
}
export function Shortcut({ mac }: { mac: boolean }) { return <span className="shortcut"><kbd>{mac ? '⌘' : 'Ctrl'}</kbd><span>+</span><kbd>D</kbd></span>; }
export function Confetti() { return <div className="confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ left: `${(i * 41) % 100}%`, background: ['#aaa0ef','#fac76d','#7fcdbb'][i%3], animationDelay: `${i * .055}s`, rotate: `${i * 23}deg` }} />)}</div>; }
