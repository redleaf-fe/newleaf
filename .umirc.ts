import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'newleaf',
  outputPath: 'docs-dist',
  mode: 'site',
  devServer: {
    port: 3333,
  },
  history: { type: 'hash' },
  favicon: 'https://gw.alicdn.com/imgextra/i3/O1CN01s3UDzQ1t5LdrmxVwF_!!6000000005850-2-tps-200-200.png',
});
