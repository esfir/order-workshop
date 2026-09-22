import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gameConfig, items, orders, type Item } from './order-game/data';
import { duplicate, initialOrder, type State } from './order-game/engine';
import { audio } from './order-game/audio';
import { Confetti, ItemImage, Shortcut } from './order-game/visuals';

export function App() {
  const [stage, setStage] = useState<'start' | 'game' | 'finish'>('start');
  const [state, setState] = useState(initialOrder);
  const live = useRef(state);
  const [muted, setMuted] = useState(false);
  const [music, setMusic] = useState(false);
  const [idle, setIdle] = useState(false);
  const [focused, setFocused] = useState(true);
  const activity = useRef(Date.now());
  const root = useRef<HTMLDivElement>(null);
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const update = (s: State) => { live.current = s; setState(s); };
  const focus = () => root.current?.focus({ preventScroll: true });
  const active = () => { activity.current = Date.now(); setIdle(false); };
  const start = () => { audio.play('ui_click'); update(initialOrder()); setStage('game'); active(); focus(); };
  useEffect(() => {
    if (stage !== 'game') return;
    focus();
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !(e.code === 'KeyD' || e.key.toLowerCase() === 'd')) return;
      e.preventDefault(); e.stopPropagation();
      if (e.repeat || e.altKey || e.shiftKey) return;
      active();
      const before = live.current; const after = duplicate(before); update(after);
      if (after.copies > before.copies) { audio.play(after.complete ? 'order_complete' : 'duplicate'); }
      else if (!before.complete) audio.play(before.selected ? 'wrong_item' : 'nothing_selected');
    };
    window.addEventListener('keydown', onKey, true);
    const interval = window.setInterval(() => { const should = Date.now() - activity.current > (live.current.index >= 8 ? 12000 : 6500); setIdle(should); }, 500);
    return () => { window.removeEventListener('keydown', onKey, true); clearInterval(interval); };
  }, [stage]);
  useEffect(() => {
    if (!state.complete || stage !== 'game') return;
    const timer = window.setTimeout(() => {
      if (state.index === orders.length - 1) { audio.play('finish'); setStage('finish'); }
      else { update(initialOrder(state.index + 1, state.score, state.copies)); active(); }
      focus();
    }, 1900);
    return () => clearTimeout(timer);
  }, [state.complete, state.index, stage]);
  const choose = (type: Item) => { if (state.complete) return; update({ ...live.current, selected: type, message: '' }); audio.play('item_select'); active(); focus(); };
  useEffect(() => { if (idle && stage === 'game' && state.index >= 5 && !state.complete) audio.play('hint'); }, [idle, stage]);
  const order = orders[state.index];
  const done = state.index + Number(state.complete);
  const hintVisible = state.index < 5 || idle;
  const logo = gameConfig.logoUrl ? <img className="brand-logo" src={gameConfig.logoUrl} alt={gameConfig.schoolName || 'Логотип'} /> : null;
  return <div ref={root} tabIndex={-1} className={`game-shell stage-${stage}`} style={{ '--accent': gameConfig.accentColor || '#7460d6' } as CSSProperties} onPointerDown={e => { if (!(e.target as HTMLElement).closest('button')) focus(); }} onFocus={() => setFocused(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
    <header className="topbar"><button className="wordmark" onClick={() => { setStage('start'); audio.play('ui_click'); }} aria-label="На главный экран"><span className="brand-icon">▧</span><span>Собери заказ<span className="brand-sub">МАСТЕРСКАЯ КОПИЙ</span></span></button><div className="top-right"><span className="age-tag">7+</span><button className={`icon-button ${music ? 'enabled' : ''}`} aria-label={music ? 'Выключить музыку' : 'Включить музыку'} aria-pressed={music} onClick={() => { audio.unlock(); audio.setMusic(!music); setMusic(!music); focus(); }}>♫</button><button className="icon-button" aria-label={muted ? 'Включить звук' : 'Выключить звук'} aria-pressed={!muted} onClick={() => { audio.mute(!muted); setMuted(!muted); focus(); }}>{muted ? '♪̸' : '♪'}</button></div></header>
    {stage === 'start' && <main className="start-layout"><section className="intro"><div className="eyebrow"><span /> МАЛЕНЬКИЕ КОПИИ. БОЛЬШИЕ ПОБЕДЫ.</div><h1>{gameConfig.gameTitle.split(' ').slice(0,-1).join(' ')}<br /><em>{gameConfig.gameTitle.split(' ').slice(-1)}</em><span className="title-spark">✦</span></h1><p className="lead">Один предмет — много возможностей.<br />Создавай копии и собирай заказы<br className="desktop-break" /> в своей маленькой мастерской.</p><div className="intro-shortcut"><Shortcut mac={mac} /><span>Твоя суперсила —<br /><strong>сделать копию</strong></span></div><button className="primary play" aria-label="Играть" onClick={start}>Играть <span>→</span></button><div className="start-meta"><span>◷ В своём темпе</span><span>▧ 10 заказов</span><span>⌨ Нужна клавиатура</span></div>{logo}</section><section className="hero-art" aria-label="Мастерская предметов"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="art-spark spark-a">✦</span><span className="art-spark spark-b">✧</span><div className="floating-label"><span className="green-dot" /> Всё начинается с одного предмета</div><div className="hero-platform"><div className="platform-top" /></div><ItemImage type="crystal" className="hero-crystal" /><ItemImage type="cube" className="hero-cube" /><ItemImage type="crate" className="hero-crate" /><div className="mini-order"><span className="mini-order-icon">✓</span><div><strong>Копия готова!</strong><span>Ещё на шаг ближе к заказу</span></div><b>+10</b></div><div className="hero-key"><Shortcut mac={mac} /><span>Нажми — и получится ещё один!</span></div></section><section className="steps"><div><b>01</b><p><strong>Выбери предмет</strong><span>Просто нажми на него</span></p><span>↗</span></div><div><b>02</b><p><strong>Создай копию</strong><span>Нажми {mac ? '⌘' : 'Ctrl'} + D на клавиатуре</span></p><span>▣</span></div><div><b>03</b><p><strong>Собери заказ</strong><span>Заполни все ячейки и получи звёзды</span></p><span>✧</span></div></section></main>}
    {stage === 'game' && <main className="game-layout"><div className="session-heading"><div><div className="eyebrow">МАСТЕРСКАЯ ОТКРЫТА</div><h2>{state.index === 0 ? 'Начнём с маленькой копии' : state.index === 9 ? 'Последний заказ. Ты справишься!' : 'Новый заказ — за дело!'}</h2></div><div className="session-stats"><span>Готово <b>{done} / 10</b></span><span className="score">★ <b>{state.score}</b></span></div></div><div className="journey" aria-label={`Выполнено заказов: ${done} из 10`}>{orders.map((_,i)=><span key={i} className={i < done ? 'done' : i === state.index ? 'current' : ''}>{i < done ? '✓' : i+1}</span>)}</div><div className="work-layout"><aside className="order-card"><div className="order-heading"><span>▧</span><div className="eyebrow">ЗАКАЗ №{String(state.index+1).padStart(2,'0')}</div></div><h3>{state.index === 0 ? 'Пара кубиков' : 'Нужно собрать'}</h3><p className="muted">Один уже есть. Добавь копии!</p>{order.items.map(target=><div className="order-line" key={target.type}><div className="order-line-title"><ItemImage type={target.type} /><strong>{items[target.type].name}</strong><b>{state.counts[target.type]} <span>/ {target.count}</span></b></div><div className="slots">{Array.from({length:target.count},(_,i)=><div className={`slot ${i < (state.counts[target.type] || 0) ? 'filled' : ''}`} key={i}>{i < (state.counts[target.type] || 0) ? <ItemImage type={target.type} /> : <span>+</span>}</div>)}</div></div>)}<div className="order-reward"><span>Награда за заказ</span><b>★ +50</b></div></aside><section className={`workbench ${state.message && !state.selected ? 'attention' : ''}`}><div className="bench-label"><span className="green-dot" /> РАБОЧИЙ СТОЛ <span>{state.complete ? 'Готово к отправке' : 'Выбери → скопируй'}</span></div><div className={`objects objects-${order.available.length}`}>{order.available.map(type=><button key={type} aria-label={`Выбрать: ${items[type].name}`} aria-pressed={state.selected === type} className={`object ${state.selected === type ? 'selected' : ''} ${state.message === 'Сейчас нужен другой предмет' && order.items.some(i=>i.type===type) ? 'needed' : ''}`} onClick={()=>choose(type)}><div className="object-pedestal" /><ItemImage type={type} /><span className="object-name">{items[type].name}</span>{state.selected === type && <span className="selected-tick">✓</span>}</button>)}</div><div className="bench-instruction">{state.selected ? <><span className="selected-dot" /> {items[state.selected].name} выбран. Можно копировать!</> : <>↖ {state.index === 0 ? '1. Выбери кубик — нажми на него' : 'Выбери предмет для заказа'}</>}</div>{state.copies > 0 && <span key={state.copies} className="floating-points">+10</span>}{state.complete && <div className="success-overlay"><Confetti /><span className="success-check">✓</span><h2>Заказ готов!</h2><p>Отличная работа! <b>★ +50</b></p></div>}</section></div><div className={`hint-bar ${state.index < 2 ? 'large' : ''}`} aria-live="polite">{!focused ? <button className="focus-button" onClick={focus}>Нажми здесь, чтобы вернуться в игру</button> : state.message && !state.complete ? <span key={state.serial} className="feedback">{state.message}</span> : <span>{state.selected ? (state.index === 0 ? '2. Сделай копию выбранного предмета' : 'Каждая копия приближает тебя к цели') : 'Сначала выбери предмет на рабочем столе'}</span>}{hintVisible && <Shortcut mac={mac} />}{!hintVisible && <button className="text-button" onClick={()=>{ setIdle(true); activity.current = 0; focus(); }}>Напомнить клавиши</button>}</div></main>}
    {stage === 'finish' && <main className="finish-layout"><Confetti />{logo}<div className="finish-medal">★</div><div className="eyebrow">МАСТЕР КОПИЙ</div><h1>Все заказы<br /><em>готовы!</em></h1><p className="lead">Отличная работа! Ты освоил настоящую суперсилу.</p><div className="finish-stats"><div><b>10 / 10</b><span>заказов собрано</span></div><div><b>★ {state.score}</b><span>очков заработано</span></div><div><b>{state.copies}</b><span>копии создано</span></div></div><div className="finish-reminder">Выбери предмет <span>→</span> <Shortcut mac={mac} /><span>→</span> Получи копию</div><button className="primary" onClick={start}>Играть ещё раз <span>↻</span></button></main>}
    <footer><span>СОЗДАВАЙ. КОПИРУЙ. СОБИРАЙ.</span><span>Маленький навык, который пригодится в большом мире <span className="footer-spark">✦</span></span></footer>
  </div>;
}
