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
  observer.observe(document.querySelector('.metrics'));
  const sections = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));
  }), { rootMargin: '-15% 0px -55% 0px' });
  ['overview','media','demo','approach','results'].forEach(id => sections.observe(document.getElementById(id)));
}
// All content below is authored example data for a presentation, not model output.
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
  steps.forEach((step, i) => { step.className = ''; step.querySelector('.step-index').textContent = i + 1; step.querySelector('.step-state').textContent = '待演示'; });
  document.querySelector('#output-empty').hidden = false;
  document.querySelector('#output-result').hidden = true;
  document.querySelector('#process-insight').textContent = '把零散的图像与文字，连接成一份完整的商品草稿。';
  document.querySelector('#copy-result').textContent = '复制示例商品信息 ↗';
  status.textContent = '准备就绪，选择菜品开始演示。';
  run.innerHTML = '开始流程演示 <span>→</span>';
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
  run.textContent = '正在播放预设流程…';
  const item = examples[selected];
  const insights = [item.ingredient, item.range + '。演示价格仅供流程说明。', '商品信息与价格保持固定，演示营销表达生成及审查步骤。', '图文理解、定价与文案整理完成，示例商品草稿已准备好。'];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]; step.className = 'current'; step.querySelector('.step-state').textContent = '演示中';
    status.textContent = `步骤 ${i + 1}/4：${step.querySelector('strong').textContent}`;
    document.querySelector('#process-insight').textContent = insights[i];
    await delay(matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 780);
    step.className = 'done'; step.querySelector('.step-index').textContent = '✓'; step.querySelector('.step-state').textContent = '已展示';
  }
  document.querySelector('#result-name').textContent = item.name;
  document.querySelector('#result-tags').replaceChildren(...item.tags.map(text => { const span = document.createElement('span'); span.textContent = text; return span; }));
  document.querySelector('#result-price').textContent = item.price;
  document.querySelector('#result-range').textContent = item.range;
  document.querySelector('#result-copy').textContent = item.copy;
  document.querySelector('#output-empty').hidden = true;
  document.querySelector('#output-result').hidden = false;
  status.textContent = '演示完成。所有字段均为预设示例，未发布真实商品。';
  playing = false; run.disabled = false; choices.forEach(b => b.disabled = false);
  run.innerHTML = '重新播放演示 <span>↻</span>';
});
document.querySelector('#copy-result').addEventListener('click', async event => {
  const button = event.currentTarget;
  const item = examples[selected];
  const text = `【演示示例，非真实商品】\n${item.name}\n${item.tags.join(' · ')}\n${item.price}\n${item.copy}`;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '已复制 ✓';
    status.textContent = '示例商品信息已复制。';
  } catch {
    status.textContent = '浏览器未允许复制，请选择商品信息手动复制。';
  }
});

// Connect the real-photography gallery to the authored demonstration.
document.querySelectorAll('[data-preview]').forEach(link => link.addEventListener('click', () => {
  if (!playing) document.querySelector('[data-dish=' + link.dataset.preview + ']').click();
}));
