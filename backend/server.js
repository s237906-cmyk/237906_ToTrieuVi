
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend đang hoạt động.' });
});

app.use('/api/employees', employeeRoutes);

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Chưa cấu hình MONGODB_URI trong file backend/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối MongoDB thành công.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động Backend:', error.message);
    process.exit(1);
  }
}

startServer();
