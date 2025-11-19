import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBills, saveBill, updateBill, deleteBill as deleteBillLS } from '../utils/localStorage';
import { toast } from 'react-toastify';

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

  const fetchBills = useCallback(() => {
    try {
      setLoading(true);
      if (user) {
        const data = getBills(user.id);
        setBills(data || []);
      }
    } catch (error) {
      console.error('Faturalar getirilirken hata:', error.message);
      toast.error('Faturalar yüklenirken hata oluştu');
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
      const newBillData = {
        bill_type: newBill.bill_type,
        amount: parseFloat(newBill.amount),
        due_date: newBill.due_date,
        notes: newBill.notes,
        status: 'pending'
      };
      
      const savedBill = saveBill(user.id, newBillData);
      setBills([...bills, savedBill]);
      setNewBill({
        bill_type: '',
        amount: '',
        due_date: '',
        notes: ''
      });
      toast.success('Fatura eklendi');
    } catch (error) {
      console.error('Fatura eklenirken hata:', error.message);
      toast.error('Fatura eklenirken hata oluştu');
    }
  };

  // Fatura durumunu güncelle
  const toggleStatus = async (bill) => {
    try {
      const newStatus = bill.status === 'completed' ? 'pending' : 'completed';
      const payment_date = newStatus === 'completed' ? new Date().toISOString() : null;
      
      updateBill(user.id, bill.id, { 
        status: newStatus,
        payment_date: payment_date
      });

      setBills(bills.map(b => 
        b.id === bill.id ? { ...b, status: newStatus, payment_date } : b
      ));
      toast.success('Durum güncellendi');
    } catch (error) {
      console.error('Durum güncellenirken hata:', error.message);
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  // Fatura sil
  const deleteBillHandler = async (id) => {
    try {
      deleteBillLS(user.id, id);
      setBills(bills.filter(b => b.id !== id));
      toast.success('Fatura silindi');
    } catch (error) {
      console.error('Fatura silinirken hata:', error.message);
      toast.error('Fatura silinirken hata oluştu');
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
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Yeni Fatura Ekle</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="bill_type" className="form-label">Fatura Türü</label>
                  <select
                    className="form-select"
                    id="bill_type"
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
                  <label htmlFor="amount" className="form-label">Tutar (₺)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    min="0"
                    step="0.01"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="due_date" className="form-label">Son Ödeme Tarihi</label>
                  <input
                    type="date"
                    className="form-control"
                    id="due_date"
                    value={newBill.due_date}
                    onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notlar</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    value={newBill.notes}
                    onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                    rows="2"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <i className="fas fa-plus me-2"></i>Ekle
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow mt-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Özet</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Ödenen Faturalar:</span>
                <span className="text-success fw-bold">
                  {totals.paid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Bekleyen Faturalar:</span>
                <span className="text-danger fw-bold">
                  {totals.unpaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Faturalar</h5>
              {bills.length === 0 ? (
                <p className="text-muted text-center">Henüz fatura eklenmemiş.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tür</th>
                        <th>Tutar</th>
                        <th>Son Ödeme</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => (
                        <tr key={bill.id}>
                          <td>
                            <div className="fw-bold">{bill.bill_type}</div>
                            {bill.notes && (
                              <small className="text-muted">{bill.notes}</small>
                            )}
                          </td>
                          <td>
                            {bill.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </td>
                          <td>
                            <div>{new Date(bill.due_date).toLocaleDateString('tr-TR')}</div>
                            {bill.payment_date && (
                              <small className="text-success">
                                Ödeme: {new Date(bill.payment_date).toLocaleDateString('tr-TR')}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className={`badge bg-${getBillStatusStyle(bill)}`}>
                              {bill.status === 'completed' ? 'Ödendi' : 'Bekliyor'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className={`btn btn-sm btn-outline-${bill.status === 'completed' ? 'warning' : 'success'}`}
                                onClick={() => toggleStatus(bill)}
                                title={bill.status === 'completed' ? 'Ödenmedi İşaretle' : 'Ödendi İşaretle'}
                              >
                                <i className={`fas fa-${bill.status === 'completed' ? 'times' : 'check'}`}></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteBillHandler(bill.id)}
                                title="Sil"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
