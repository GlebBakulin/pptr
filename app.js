const puppeteer = require('puppeteer');
const MicroMQ = require('micromq');

// Хранилище запросов
const reqs = [];

const app = new MicroMQ({
  name: 'pptr',
  rabbit: {
    // ссылка для подключения к rabbitmq (default: amqp://guest:guest@localhost:5672)
    url: process.env.RABBIT_URL,
  },
});
app.post('/pptr', async (req, res) => {
    await getPageData(req.body.url);
    res.status(200);
    return res;
});


async function getPageData(url) {
  // Проверка аналогичного запроса сегодня, 
  const cachedReq = reqs.find(req => req.url === url);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (cachedReq && !(cachedReq.date < today)) {
    console.warn('url сегодня был получен ранее, вывод сохранённых данных');
    console.log('cookies', cachedReq.cookies);
    console.log('height', cachedReq.height);
    console.log('width', cachedReq.width);
    return;
  }
  // Новый запрос
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);
  } catch (e) {
    console.log('Введён некорректный url адрес');
    return;
  }
  let cookies = await page.cookies();
  let {height, width} = await page.evaluate(() => {
      let [height, width] = [document.documentElement.scrollHeight, document.documentElement.scrollWidth]
      return {height, width};
  });
  console.log('cookies', cookies);
  console.log('height', height);
  console.log('width', width);
  reqs.push({
    url: url,
    date: today,
    cookies: cookies,
    height: height,
    width: width,
  });
  browser.close();
  return;
}

app.start();
