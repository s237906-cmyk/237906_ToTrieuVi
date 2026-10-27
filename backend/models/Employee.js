
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Mã nhân viên là bắt buộc'],
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Phòng ban là bắt buộc'],
      trim: true
    },
    position: {
      type: String,
      required: [true, 'Chức vụ là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Đang làm việc', 'Tạm nghỉ', 'Đã nghỉ việc'],
      default: 'Đang làm việc'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
