
const express = require('express');
const Employee = require('../models/Employee');

const router = express.Router();

// GET: Lấy danh sách hoặc tìm kiếm nhân viên
router.get('/', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();

    const filter = search
      ? {
          $or: [
            { employeeId: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tải danh sách nhân viên.' });
  }
});

// GET: Xem chi tiết nhân viên
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: 'Mã nhân viên không hợp lệ.' });
  }
});

// POST: Thêm nhân viên
router.post('/', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({
      message: 'Thêm nhân viên thành công.',
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Mã nhân viên hoặc email đã tồn tại.'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(', ')
      });
    }

    res.status(500).json({ message: 'Không thể thêm nhân viên.' });
  }
});

// PUT: Cập nhật nhân viên
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    res.json({
      message: 'Cập nhật nhân viên thành công.',
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Mã nhân viên hoặc email đã tồn tại.'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(', ')
      });
    }

    res.status(400).json({ message: 'Không thể cập nhật nhân viên.' });
  }
});

// DELETE: Xóa nhân viên
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    res.json({ message: 'Xóa nhân viên thành công.' });
  } catch (error) {
    res.status(400).json({ message: 'Không thể xóa nhân viên.' });
  }
});

module.exports = router;
