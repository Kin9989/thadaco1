const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Cấu hình CORS
app.use(cors());

// Phục vụ các file tĩnh trong thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// API lưu dữ liệu vào file JSON
app.post('/api/save', (req, res) => {
    const data = req.body;
    fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 4), (err) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi lưu dữ liệu', error: err });
        }
        res.json({ message: 'Dữ liệu đã được lưu thành công!' });
    });
});

// API lấy dữ liệu từ file JSON
app.get('/api/get_data', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi đọc dữ liệu', error: err });
        }
        res.json(JSON.parse(data));
    });
});

// Bắt đầu server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
