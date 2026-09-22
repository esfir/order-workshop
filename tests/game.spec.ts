import { test, expect } from '@playwright/test';
import { duplicate, initialOrder } from '../src/order-game/engine';
import { orders } from '../src/order-game/data';
test('all orders require 33 copies and score 830; errors and overflow never score', () => {
  let state = initialOrder();
  expect(duplicate(state).score).toBe(0);
  expect(duplicate({...state,selected:'wheel'}).copies).toBe(0);
  for(let i=0;i<orders.length;i++) {
    state=initialOrder(i,state.score,state.copies);
    for(const target of orders[i].items){state={...state,selected:target.type};for(let n=1;n<target.count;n++)state=duplicate(state);const score=state.score;state=duplicate(state);expect(state.score).toBe(score);}
    expect(state.complete).toBe(true);
  }
  expect(state.copies).toBe(33);expect(state.score).toBe(830);
});
test('complete game in iframe with physical D on Russian layout, focus, restart and assets', async ({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.evaluate(()=>{document.body.innerHTML='<iframe title="Game" src="/" width="1024" height="600"></iframe>';});
  const frame=page.frameLocator('iframe');
  await frame.getByRole('button',{name:'Играть',exact:true}).click();
  await page.keyboard.press('Control+d');await expect(frame.getByText('Сначала выбери предмет',{exact:true})).toBeVisible();
  const labels:Record<string,string>={cube:'Кубик',crystal:'Кристалл',crate:'Ящик',battery:'Батарея',wheel:'Колесо',lamp:'Лампа'};
  for(let i=0;i<orders.length;i++){
    await expect(frame.getByText(`ЗАКАЗ №${String(i+1).padStart(2,'0')}`)).toBeVisible();
    if(i===4){await frame.getByRole('button',{name:'Выбрать: Кубик',exact:true}).click();await page.keyboard.press('Control+d');await expect(frame.getByText('Сейчас нужен другой предмет',{exact:true})).toBeVisible();}
    for(const target of orders[i].items){await frame.getByRole('button',{name:`Выбрать: ${labels[target.type]}`,exact:true}).click();for(let n=1;n<target.count;n++) await page.keyboard.press(i%2?'Meta+d':'Control+d');}
    await expect(frame.getByRole('heading',{name:'Заказ готов!'})).toBeVisible();
  }
  await expect(frame.getByRole('heading',{name:'Все заказы готовы!'})).toBeVisible();
  await expect(frame.getByText('★ 830',{exact:true})).toBeVisible();
  await frame.getByRole('button',{name:'Играть ещё раз'}).click();
  await expect(frame.getByText('ЗАКАЗ №01')).toBeVisible();
  await frame.getByRole('button',{name:'Выбрать: Кубик',exact:true}).click();
  const gameFrame=page.frames()[1];
  const prevented=await gameFrame.evaluate(()=>{const e=new KeyboardEvent('keydown',{key:'в',code:'KeyD',ctrlKey:true,bubbles:true,cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;});expect(prevented).toBe(true);
  await expect(frame.getByRole('heading',{name:'Заказ готов!'})).toBeVisible();
  expect(errors).toEqual([]);
});
test('responsive screenshots and platform hint',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'platform',{get:()=> 'MacIntel'}));
  await page.goto('/');await expect(page.locator('.intro-shortcut')).toContainText('⌘');
  await page.screenshot({path:'test-results/start.png',fullPage:true});
  for(const size of [{width:1024,height:600},{width:640,height:600},{width:390,height:844}]){
    await page.setViewportSize(size);await page.getByRole('button',{name:'Играть',exact:true}).click();
    await expect(page.locator('.workbench')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole('button',{name:'Выбрать: Кубик',exact:true}).click();
    await page.screenshot({path:`test-results/game-${size.width}.png`,fullPage:true});
    await page.getByRole('button',{name:'На главный экран'}).click();
  }
  const assets=await page.locator('img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth>0));expect(assets).toBe(true);
});
test('hint fading, sound controls, keyboard repeat and local assets', async ({page,request})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'platform',{get:()=> 'Win32'}));
  await page.goto('/');await expect(page.locator('.intro-shortcut')).toContainText('Ctrl');
  await page.getByRole('button',{name:'Выключить звук',exact:true}).click();
  await expect(page.getByRole('button',{name:'Включить звук',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Играть',exact:true}).click();
  await page.getByRole('button',{name:'Выбрать: Кубик',exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'d',code:'KeyD',ctrlKey:true,repeat:true,bubbles:true,cancelable:true})));
  await expect(page.locator('.score')).toContainText('0');
  await page.clock.install();
  const labels:Record<string,string>={cube:'Кубик',crystal:'Кристалл',crate:'Ящик',battery:'Батарея'};
  for(let i=0;i<5;i++){
    await page.getByRole('button',{name:`Выбрать: ${labels[orders[i].items[0].type]}`,exact:true}).click();
    for(let n=1;n<orders[i].items[0].count;n++)await page.keyboard.press('Control+d');
    await page.clock.runFor(2000);
  }
  await expect(page.locator('.hint-bar .shortcut')).toHaveCount(0);
  await page.clock.runFor(7000);
  await expect(page.locator('.hint-bar .shortcut')).toBeVisible();
  for(const path of ['audio/background_loop.mp3','audio/duplicate.mp3','items/item_robot_part.png','backgrounds/bg_finish.png']) expect((await request.get('/assets/'+path)).ok()).toBe(true);
});
