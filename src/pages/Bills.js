import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { browserData } from '../lib/browserData';

const Bills = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBill, setNewBill] = useState({
    bill_type: '',
    amount: '',
    due_date: '',
    notes: ''
  });

  const billTypes = [
    'Elektrik',
    'Su',
    'Doğalgaz',
    'İnternet',
    'Telefon',
    'Kira',
    'Aidat',
    'Diğer'
  ];

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await browserData.getBillsForUser(user.id);
      if (error) throw error;
      const sorted = (data || []).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setBills(sorted);
    } catch (error) {
      console.error('Faturalar getirilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBills();
    }
  }, [user, fetchBills]);

  // Yeni fatura ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await browserData.insertInto('bills', [
        {
          user_id: user.id,
          bill_type: newBill.bill_type,
          amount: parseFloat(newBill.amount),
          due_date: newBill.due_date,
          notes: newBill.notes,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setBills([...bills, data[0]]);
      setNewBill({
        bill_type: '',
        amount: '',
        due_date: '',
        notes: ''
      });
    } catch (error) {
      console.error('Fatura eklenirken hata:', error.message);
    }
  };

  // Fatura durumunu güncelle
  const toggleStatus = async (bill) => {
    try {
      const newStatus = bill.status === 'completed' ? 'pending' : 'completed';
      const payment_date = newStatus === 'completed' ? new Date().toISOString() : null;

      const { error } = await browserData.updateById('bills', bill.id, { status: newStatus, payment_date });
      if (error) throw error;

      setBills(bills.map(b =>
        b.id === bill.id ? { ...b, status: newStatus, payment_date } : b
      ));
    } catch (error) {
      console.error('Durum güncellenirken hata:', error.message);
    }
  };

  // Fatura sil
  const deleteBill = async (id) => {
    try {
      const { error } = await browserData.deleteById('bills', id);
      if (error) throw error;

      setBills(bills.filter(b => b.id !== id));
    } catch (error) {
      console.error('Fatura silinirken hata:', error.message);
    }
  };

  // Fatura durumuna göre stil belirleme
  const getBillStatusStyle = (bill) => {
    const today = new Date();
    const dueDate = new Date(bill.due_date);

    if (bill.status === 'completed') {
      return 'success';
    } else if (dueDate < today) {
      return 'danger';
    } else if (dueDate.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000) { // 3 gün
      return 'warning';
    }
    return 'primary';
  };

  // Toplam tutarları hesapla
  const calculateTotals = () => {
    return bills.reduce((acc, bill) => {
      if (bill.status === 'completed') {
        acc.paid += bill.amount;
      } else {
        acc.unpaid += bill.amount;
      }
      return acc;
    }, { paid: 0, unpaid: 0 });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Fatura Yönetimi</h2>
          <p className="text-muted mb-0">Ödemelerinizi takip edin ve son ödeme tarihlerini kaçırmayın.</p>
        </div>
        <div className="text-end">
          <div className="glass-pro-max p-3 rounded-4 border-0">
            <small className="text-muted d-block mb-1">Bekleyen Toplam</small>
            <span className="fs-3 fw-bold text-danger">
              {totals.unpaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden">
            <div className="card-header bg-primary text-white py-3 border-0">
              <h5 className="card-title mb-0">Yeni Fatura Ekle</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Fatura Türü</label>
                  <select
                    className="form-select border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newBill.bill_type}
                    onChange={(e) => setNewBill({ ...newBill, bill_type: e.target.value })}
                    required
                  >
                    <option value="">Fatura Türü Seçin</option>
                    {billTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Tutar (₺)</label>
                  <input
                    type="number"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    min="0"
                    step="0.01"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Son Ödeme Tarihi</label>
                  <input
                    type="date"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newBill.due_date}
                    onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small text-muted">Notlar</label>
                  <textarea
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newBill.notes}
                    onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                    rows="2"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-pro-max w-100 py-3 shadow-sm">
                  <i className="fas fa-plus-circle me-2"></i>Fatura Kaydet
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom border-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Faturalarım</h5>
                <span className="badge bg-light text-dark">{bills.length} Kayıt</span>
              </div>
            </div>
            <div className="card-body p-0">
              {bills.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-file-invoice fs-1 mb-3 opacity-25"></i>
                  <p>Henüz fatura eklenmemiş.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4 border-0">Tür & Not</th>
                        <th className="border-0">Tutar</th>
                        <th className="border-0 text-center">Durum</th>
                        <th className="border-0 text-center">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => {
                        const statusStyle = getBillStatusStyle(bill);
                        return (
                          <tr key={bill.id}>
                            <td className="ps-4">
                              <div className="fw-bold text-primary">{bill.bill_type}</div>
                              {bill.notes && <div className="small text-muted">{bill.notes}</div>}
                            </td>
                            <td>
                              <div className="fw-bold">{bill.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                              <div className="small text-muted">Son: {new Date(bill.due_date).toLocaleDateString('tr-TR')}</div>
                            </td>
                            <td className="text-center">
                              <span className={`badge rounded-pill px-3 py-2 bg-${statusStyle === 'success' ? 'success' : statusStyle === 'danger' ? 'danger' : 'warning-subtle text-warning'}`}>
                                {bill.status === 'completed' ? 'Ödendi' : 'Bekliyor'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  className={`btn btn-sm shadow-sm ${bill.status === 'completed' ? 'btn-light' : 'btn-success'}`}
                                  onClick={() => toggleStatus(bill)}
                                >
                                  <i className={`fas fa-${bill.status === 'completed' ? 'undo' : 'check'}`}></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger border-0"
                                  onClick={() => deleteBill(bill.id)}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills; 