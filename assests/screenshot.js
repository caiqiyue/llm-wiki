const { chromium } = require('playwright');
const path = require('path');

const htmlFiles = [
  'llm-wiki-概念到实现-架构图.html',
  'STKB与LLM-Wiki-对比图.html',
  'llm-wiki-深度分析-图表.html'
];

const outputFiles = [
  'llm-wiki-概念到实现-架构图.png',
  'STKB与LLM-Wiki-对比图.png',
  'llm-wiki-深度分析-图表.png'
];

async function screenshot(htmlFile, outputFile) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = 'file:///' + path.resolve(htmlFile).replace(/\\/g, '/');

  console.log('Opening:', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle' });

  // Wait for fonts and styles to load
  await page.waitForTimeout(2000);

  // Get content height and set viewport
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewportSize({ width: 1400, height: bodyHeight + 100 });

  await page.screenshot({
    path: outputFile,
    fullPage: true
  });

  console.log('Saved:', outputFile);
  await browser.close();
}

(async () => {
  for (let i = 0; i < htmlFiles.length; i++) {
    try {
      await screenshot(htmlFiles[i], outputFiles[i]);
    } catch (err) {
      console.error('Error processing', htmlFiles[i], ':', err.message);
    }
  }
  console.log('Done!');
})();