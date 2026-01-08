import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const ordersFilePath = path.join(__dirname, 'public', 'orders.json');

app.get('/api/orders', (req, res) => {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('读取订单失败:', error);
    res.status(500).json({ error: '读取订单失败' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const orders = req.body;
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('保存订单失败:', error);
    res.status(500).json({ error: '保存订单失败' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
