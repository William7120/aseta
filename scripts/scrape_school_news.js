const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://thpttranvangiau.hcm.edu.vn';

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
    https.get(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, rejectUnauthorized: false }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseArticlesFromList(html) {
  const regex = /<a[^>]+href=["']([^"']+\/ct(?:full)?\/[0-9]+\/[0-9]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const list = [];
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const link = match[1];
    const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();
    const title = decodeHtmlEntities(rawTitle);
    if (title && !seen.has(link) && title.length > 5 && !title.toLowerCase().includes('xem tiếp') && !title.toLowerCase().includes('chi tiết')) {
      seen.add(link);
      list.push({ title, link });
    }
  }
  return list;
}

function parseScheduleTable(html) {
  const tableMatch = html.match(/<div class=["']qi-bang-cuon["']>([\s\S]*?)<\/table>/i) || html.match(/<table[\s\S]*?<\/table>/i);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[0];
  const rowMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi);
  if (!rowMatches) return [];

  const rows = [];
  let currentDay = '';

  rowMatches.forEach((tr, idx) => {
    if (idx === 0) return; // Skip header
    const cells = tr.match(/<td[\s\S]*?<\/td>/gi) || tr.match(/<th[\s\S]*?<\/th>/gi);
    if (!cells || cells.length === 0) return;

    const cellTexts = cells.map(td => decodeHtmlEntities(td.replace(/<[^>]+>/g, ' ')));

    let day = '';
    let content = '';
    let assignee = '';
    let location = '';
    let onDuty = '';

    const firstCell = cellTexts[0] || '';
    const isDayHeader = /(thứ\s+[a-z0-9]+|chủ\s*nhật|trong\s*tuần|dự\s*kiến)/i.test(firstCell);

    if (isDayHeader) {
      currentDay = firstCell;
      day = firstCell;
      content = cellTexts[1] || '';
      assignee = cellTexts[2] || '';
      location = cellTexts[3] || '';
      onDuty = cellTexts[4] || '';
    } else {
      day = currentDay;
      content = cellTexts[0] || '';
      assignee = cellTexts[1] || '';
      location = cellTexts[2] || '';
      onDuty = cellTexts[3] || '';
    }

    if (content || (day && isDayHeader)) {
      rows.push({
        day: day || currentDay || 'Trong tuần',
        content: content || '',
        assignee: assignee || '',
        location: location || '',
        onDuty: onDuty || ''
      });
    }
  });

  return rows;
}

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, rejectUnauthorized: false }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => resolve(false));
  });
}

function parseBanTruDetail(html) {
  // Download link
  let downloadUrl = null;
  const dlMatch = html.match(/<a[^>]+href=["'](\/tai\/[^"']+)["'][^>]*>/i);
  if (dlMatch) {
    downloadUrl = BASE_URL + dlMatch[1];
  }

  // Viewer iframe src
  let viewerUrl = null;
  const ifMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (ifMatch) {
    viewerUrl = BASE_URL + ifMatch[1];
  }

  // Audio text (often contains the plain text summary of the menu if available)
  let audioText = '';
  const audioMatch = html.match(/PlayAudioContent\(['"]([\s\S]*?)['"]\)/i);
  if (audioMatch) {
    audioText = decodeHtmlEntities(audioMatch[1]);
  }

  return { downloadUrl, viewerUrl, audioText };
}

async function scrapeAll() {
  console.log('🚀 Bắt đầu quét thông báo từ Trường THPT Trần Văn Giàu...');

  const result = {
    source: BASE_URL,
    schoolName: 'Trường THPT Trần Văn Giàu',
    lastUpdated: new Date().toISOString(),
    lastUpdatedText: new Intl.DateTimeFormat('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'full', 
      timeStyle: 'medium' 
    }).format(new Date()),
    scheduleWeeks: [],
    mealsWeeks: [],
    generalNotices: []
  };

  // 1. Quét Lịch Công Tác Tuần
  try {
    console.log('📅 Đang quét Lịch công tác tuần...');
    const listHtml = await fetchPage('/lich-cong-tac-tuan/c/42158');
    const articles = parseArticlesFromList(listHtml);
    console.log(`-> Tìm thấy ${articles.length} bài Lịch công tác tuần`);

    for (let i = 0; i < Math.min(articles.length, 3); i++) {
      const art = articles[i];
      console.log(`   Đang tải chi tiết: ${art.title}...`);
      const detailHtml = await fetchPage(art.link);
      const tableRows = parseScheduleTable(detailHtml);

      // Extract week number if possible
      const weekMatch = art.title.match(/tuần\s*(\d+)/i);
      const weekNum = weekMatch ? parseInt(weekMatch[1], 10) : i + 1;

      result.scheduleWeeks.push({
        weekNum,
        title: art.title,
        link: BASE_URL + art.link,
        isLatest: (i === 0),
        tableRows: tableRows
      });
    }
  } catch (e) {
    console.error('Lỗi khi quét Lịch công tác tuần:', e.message);
  }

  // 2. Quét Thực Đơn & Bán Trú
  try {
    console.log('\n🍱 Đang quét Thực đơn & Bán trú...');
    const listHtml = await fetchPage('/ban-tru/c/84621');
    const articles = parseArticlesFromList(listHtml);
    console.log(`-> Tìm thấy ${articles.length} bài Bán trú & Thực đơn`);

    for (let i = 0; i < Math.min(articles.length, 3); i++) {
      const art = articles[i];
      console.log(`   Đang tải chi tiết: ${art.title}...`);
      const detailHtml = await fetchPage(art.link);
      const detail = parseBanTruDetail(detailHtml);

      const weekMatch = art.title.match(/tuần\s*(\d+)/i);
      const weekNum = weekMatch ? parseInt(weekMatch[1], 10) : i + 1;

      let localPdfUrl = null;
      if (detail.downloadUrl) {
        try {
          const pdfDir = path.join(__dirname, '..', 'data', 'pdf');
          if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
          const filename = `thuc_don_tuan_${weekNum}.pdf`;
          const dest = path.join(pdfDir, filename);
          console.log(`   Đang tải tệp PDF thực đơn: ${filename}...`);
          const ok = await downloadFile(detail.downloadUrl, dest);
          if (ok) {
            localPdfUrl = `data/pdf/${filename}`;
            if (i === 0) {
              fs.copyFileSync(dest, path.join(pdfDir, 'thuc_don_latest.pdf'));
            }
          }
        } catch (err) {
          console.warn('   Lỗi tải PDF:', err.message);
        }
      }

      result.mealsWeeks.push({
        weekNum,
        title: art.title,
        link: BASE_URL + art.link,
        isLatest: (i === 0),
        localPdfUrl: localPdfUrl,
        downloadUrl: detail.downloadUrl,
        viewerUrl: detail.viewerUrl,
        summary: detail.audioText
      });
    }
  } catch (e) {
    console.error('Lỗi khi quét Bán trú:', e.message);
  }

  // 3. Quét Thông Báo & Kế Hoạch Chung
  try {
    console.log('\n📢 Đang quét Thông báo & Kế hoạch...');
    const listHtml = await fetchPage('/thong-bao/c/42154');
    const articles = parseArticlesFromList(listHtml);
    console.log(`-> Tìm thấy ${articles.length} thông báo chung`);

    result.generalNotices = articles.slice(0, 10).map((art, idx) => ({
      id: `notice_${idx + 1}`,
      title: art.title,
      link: BASE_URL + art.link,
      isNew: (idx < 3)
    }));
  } catch (e) {
    console.error('Lỗi khi quét Thông báo chung:', e.message);
  }

  // Ghi ra file data/school_news.json
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'school_news.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✅ ĐÃ HOÀN TẤT! Dữ liệu đã lưu tại: ${outputPath}`);
  console.log(`- Lịch tuần: ${result.scheduleWeeks.length} tuần`);
  console.log(`- Thực đơn bán trú: ${result.mealsWeeks.length} tuần`);
  console.log(`- Thông báo chung: ${result.generalNotices.length} tin`);
  return result;
}

if (require.main === module) {
  scrapeAll().catch(err => {
    console.error('Lỗi thực thi:', err);
    process.exit(1);
  });
}

module.exports = { scrapeAll };
