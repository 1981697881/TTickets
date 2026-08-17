import fs from 'node:fs';

const files = [
  'pages/index/index.vue',
  'pages/app/merchant/index.vue',
  'pages/user/sign/index.vue',
  'pages/order/after-sale/refund.vue',
  'pages/order/distribution.vue',
  'pages/user/wallet/index.vue'
];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  let next = text
    .replace(/<block\s+slot="modalContent">/g, '<template #modalContent>')
    .replace(/<\/block>(\s*)<\/app-modal>/g, '</template>$1</app-modal>');

  if (file === 'pages/index/index.vue') {
    next = next.replace(/tip:\s*'[^'\n]*'/, "tip: '当前暂无活动，敬请期待'");
  }

  if (next !== text) {
    fs.writeFileSync(file, next, 'utf8');
    console.log('updated', file);
  } else {
    console.log('unchanged', file);
  }

  const check = fs.readFileSync(file, 'utf8');
  const tipLine = check.split(/\r?\n/).find((line) => line.includes('tip:'));
  console.log(
    '  ',
    tipLine ? JSON.stringify(tipLine.trim()) : 'no-tip',
    check.includes('<template #modalContent>') ? 'slot-ok' : 'slot-old'
  );
}
