'use strict';
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navlinks');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '展开导航');
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) menu.click(); });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  }), { threshold: .18 });
  const sections = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));
  }), { rootMargin: '-15% 0px -55% 0px' });
  ['overview','media','demo'].forEach(id => sections.observe(document.getElementById(id)));
}
// 菜品资料作为页面交互的预设内容。
const examples = {
  chicken: { name: '宫保鸡丁', note: '“一人份宫保鸡丁，鸡腿肉配花生，微辣。”', tags: ['川味家常菜','一人份','微辣'], price: '¥ 28 / 份', range: '预设同类价格区间：¥ 26–32', copy: '鲜嫩鸡腿肉遇上香脆花生，酱香浓郁，微辣开胃。配一碗米饭，认真吃好这一餐。', ingredient: '鸡腿肉、花生；口味微辣，规格为一人份。' },
  beef: { name: '家常炖牛肉', note: '“牛肉搭配胡萝卜、土豆慢炖，一人份，不辣。”', tags: ['炖煮热菜','一人份','不辣'], price: '¥ 36 / 份', range: '预设同类价格区间：¥ 32–40', copy: '牛肉与胡萝卜、土豆慢炖入味，浓郁汤汁包裹每一口。暖暖的一份，给忙碌的一天加点满足。', ingredient: '牛肉、胡萝卜、土豆；口味不辣，规格为一人份。' },
  salad: { name: '田园蔬菜轻食', note: '“生菜、番茄、洋葱搭配轻食酱，一人份。”', tags: ['蔬菜轻食','一人份','酱汁另配'], price: '¥ 22 / 份', range: '预设同类价格区间：¥ 20–26', copy: '清脆生菜搭配番茄与洋葱，色彩和口感一起上线。酱汁另配，按自己的喜好拌一拌。', ingredient: '生菜、番茄、洋葱；酱汁另配，规格为一人份。' }
};
let selected = 'chicken';
let playing = false;
const steps = [...document.querySelectorAll('.steps li')];
const run = document.querySelector('#run-demo');
const status = document.querySelector('#demo-status');
const choices = [...document.querySelectorAll('[data-dish]')];
function resetDemo() {
  steps.forEach((step, i) => { step.className = ''; step.querySelector('.step-index').textContent = i + 1; step.querySelector('.step-state').textContent = '待开始'; });
  document.querySelector('#output-empty').hidden = false;
  document.querySelector('#output-result').hidden = true;
  document.querySelector('#process-insight').textContent = '把零散的图像与文字，连接成一份完整的商品草稿。';
  document.querySelector('#copy-result').textContent = '复制商品资料 ↗';
  status.textContent = '准备就绪，选择菜品开始体验。';
  run.innerHTML = '体验一键上菜 <span>→</span>';
}
choices.forEach(button => button.addEventListener('click', () => {
  if (playing) return;
  selected = button.dataset.dish;
  choices.forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  document.querySelector('#input-note').textContent = examples[selected].note;
  document.querySelector('.demo-picture').dataset.kind = selected;
  document.querySelector('#demo-image').src = 'assets/photos/' + selected + '.jpg';
  document.querySelector('#demo-image').alt = examples[selected].name + '实拍素材照片';
  resetDemo();
}));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
run.addEventListener('click', async () => {
  if (playing) return;
  resetDemo(); playing = true; run.disabled = true;
  choices.forEach(b => b.disabled = true);
  run.textContent = '正在整理商品资料…';
  const item = examples[selected];
  const insights = [item.ingredient, item.range + '。', '整理商品介绍，准备清晰易读的菜品内容。', '菜品信息、价格与商品介绍已整理完成。'];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]; step.className = 'current'; step.querySelector('.step-state').textContent = '处理中';
    status.textContent = `步骤 ${i + 1}/4：${step.querySelector('strong').textContent}`;
    document.querySelector('#process-insight').textContent = insights[i];
    await delay(matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 780);
    step.className = 'done'; step.querySelector('.step-index').textContent = '✓'; step.querySelector('.step-state').textContent = '已完成';
  }
  document.querySelector('#result-name').textContent = item.name;
  document.querySelector('#result-tags').replaceChildren(...item.tags.map(text => { const span = document.createElement('span'); span.textContent = text; return span; }));
  document.querySelector('#result-price').textContent = item.price;
  document.querySelector('#result-range').textContent = item.range;
  document.querySelector('#result-copy').textContent = item.copy;
  document.querySelector('#output-empty').hidden = true;
  document.querySelector('#output-result').hidden = false;
  status.textContent = '商品资料已整理。内容来自页面预设菜品信息。';
  playing = false; run.disabled = false; choices.forEach(b => b.disabled = false);
  run.innerHTML = '重新体验一键上菜 <span>↻</span>';
});
document.querySelector('#copy-result').addEventListener('click', async event => {
  const button = event.currentTarget;
  const item = examples[selected];
  const text = `【商品资料预览】\n${item.name}\n${item.tags.join(' · ')}\n${item.price}\n${item.copy}`;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '已复制 ✓';
    status.textContent = '商品资料已复制。';
  } catch {
    status.textContent = '浏览器未允许复制，请选择商品信息手动复制。';
  }
});

// Connect each food photo to its matching menu-item preview.
document.querySelectorAll('[data-preview]').forEach(link => link.addEventListener('click', () => {
  if (!playing) document.querySelector('[data-dish=' + link.dataset.preview + ']').click();
}));
