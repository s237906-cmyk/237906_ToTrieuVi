
import React, { useCallback, useEffect, useState } from 'react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/employees`;

const EMPTY_FORM = {
  employeeId: '',
  fullName: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  status: 'Đang làm việc'
};

async function requestApi(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Lỗi API: ${response.status}`);
  }

  return data;
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await requestApi(API_URL);
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const data = await requestApi(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(form)
      });

      setMessage(data.message || (editingId
        ? 'Cập nhật nhân viên thành công.'
        : 'Thêm nhân viên thành công.'));

      resetForm();
      await loadEmployees();
    } catch (err) {
      setError(err.message || 'Không thể lưu nhân viên.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(employee) {
    setEditingId(employee._id);
    setViewing(null);
    setForm({
      employeeId: employee.employeeId || '',
      fullName: employee.fullName || '',
      department: employee.department || '',
      position: employee.position || '',
      email: employee.email || '',
      phone: employee.phone || '',
      status: employee.status || 'Đang làm việc'
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteEmployee(employee) {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhân viên ${employee.fullName} (${employee.employeeId}) không?`
    );

    if (!confirmed) return;

    setMessage('');
    setError('');

    try {
      const data = await requestApi(`${API_URL}/${employee._id}`, {
        method: 'DELETE'
      });

      setMessage(data.message || 'Xóa nhân viên thành công.');
      if (editingId === employee._id) resetForm();
      if (viewing?._id === employee._id) setViewing(null);
      await loadEmployees();
    } catch (err) {
      setError(err.message || 'Không thể xóa nhân viên.');
    }
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredEmployees = employees.filter((employee) =>
    `${employee.employeeId || ''} ${employee.fullName || ''}`
      .toLowerCase()
      .includes(normalizedSearch)
  );

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">HỆ THỐNG QUẢN TRỊ</p>
          <h1>Quản lý nhân sự</h1>
          <p className="subtitle">Quản lý hồ sơ và trạng thái làm việc của nhân viên</p>
        </div>
        <div className="count-card">
          <span>Tổng nhân viên</span>
          <strong>{employees.length}</strong>
        </div>
      </header>

      {message && <div className="alert success" role="status">{message}</div>}
      {error && <div className="alert error" role="alert">{error}</div>}

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>{editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</h2>
            <p className="subtitle">Nhập đầy đủ thông tin có dấu sao</p>
          </div>
          {editingId && (
            <button type="button" className="btn secondary" onClick={resetForm}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Mã nhân viên *
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={updateField}
                placeholder="NV001"
                required
                maxLength={30}
              />
            </label>

            <label>
              Họ và tên *
              <input
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Nguyễn Văn A"
                required
                maxLength={100}
              />
            </label>

            <label>
              Phòng ban *
              <input
                name="department"
                value={form.department}
                onChange={updateField}
                placeholder="Công nghệ thông tin"
                required
                maxLength={100}
              />
            </label>

            <label>
              Chức vụ *
              <input
                name="position"
                value={form.position}
                onChange={updateField}
                placeholder="Nhân viên"
                required
                maxLength={100}
              />
            </label>

            <label>
              Email *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="nhanvien@example.com"
                required
              />
            </label>

            <label>
              Số điện thoại *
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={updateField}
                placeholder="0901234567"
                required
                maxLength={20}
              />
            </label>

            <label>
              Trạng thái làm việc *
              <select name="status" value={form.status} onChange={updateField} required>
                <option>Đang làm việc</option>
                <option>Tạm nghỉ</option>
                <option>Đã nghỉ việc</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm nhân viên'}
            </button>
            <button type="button" className="btn secondary" onClick={resetForm}>
              Làm mới biểu mẫu
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading list-heading">
          <div>
            <h2>Danh sách nhân viên</h2>
            <p className="subtitle">
              Đang hiển thị {filteredEmployees.length} / {employees.length} nhân viên
            </p>
          </div>
          <input
            className="search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã hoặc họ tên..."
            aria-label="Tìm kiếm nhân viên"
          />
        </div>

        {loading ? (
          <p className="empty-state">Đang tải dữ liệu nhân viên...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã nhân viên</th>
                  <th>Họ và tên</th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="employee-code">{employee.employeeId}</td>
                    <td className="employee-name">{employee.fullName}</td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>
                      <span className={`status ${
                        employee.status === 'Đang làm việc'
                          ? 'working'
                          : employee.status === 'Tạm nghỉ'
                            ? 'paused'
                            : 'left'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn small secondary" onClick={() => setViewing(employee)}>
                          Xem
                        </button>
                        <button className="btn small edit" onClick={() => startEdit(employee)}>
                          Sửa
                        </button>
                        <button className="btn small danger" onClick={() => deleteEmployee(employee)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      {search
                        ? 'Không tìm thấy nhân viên phù hợp.'
                        : 'Chưa có nhân viên. Hãy thêm hồ sơ đầu tiên ở biểu mẫu phía trên.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <h2 id="detail-title">Thông tin nhân viên</h2>
              <button className="btn secondary" onClick={() => setViewing(null)}>Đóng</button>
            </div>
            <dl className="details-grid">
              <dt>Mã nhân viên</dt><dd>{viewing.employeeId}</dd>
              <dt>Họ và tên</dt><dd>{viewing.fullName}</dd>
              <dt>Phòng ban</dt><dd>{viewing.department}</dd>
              <dt>Chức vụ</dt><dd>{viewing.position}</dd>
              <dt>Email</dt><dd>{viewing.email}</dd>
              <dt>Số điện thoại</dt><dd>{viewing.phone}</dd>
              <dt>Trạng thái</dt><dd>{viewing.status}</dd>
            </dl>
            <button className="btn primary" onClick={() => startEdit(viewing)}>
              Chỉnh sửa hồ sơ
            </button>
          </section>
        </div>
      )}

      <footer>Hệ thống quản lý nhân sự · React · Express · MongoDB</footer>
    </main>
  );
}
