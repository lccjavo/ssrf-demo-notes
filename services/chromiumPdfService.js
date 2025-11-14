// services/chromiumPdfService.js
const puppeteer = require('puppeteer');

async function generatePdfWithChromium(html) {
  const browser = await puppeteer.launch({
    headless: true,                             // uses classic mode to avoid issues
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Load HTML; networkidle0 = when there are no pending network requests
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
    });

    await page.close();
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generatePdfWithChromium };
