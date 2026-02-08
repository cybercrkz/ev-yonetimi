import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { browserData } from '../lib/browserData';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'nakit'
  });

  const categories = [
    'Market',
    'Gıda',
    'Ulaşım',
    'Sağlık',
    'Giyim',
    'Eğitim',
    'Eğlence',
    'Bakım/Onarım',
    'Diğer'
  ];

  const paymentMethods = [
    { id: 'nakit', label: 'Nakit' },
    { id: 'kredi_karti', label: 'Kredi Kartı' },
    { id: 'banka_karti', label: 'Banka Kartı' },
    { id: 'havale_eft', label: 'Havale/EFT' }
  ];

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await browserData.getExpensesForUser(user.id);
      if (error) throw error;
      const sorted = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sorted);
    } catch (error) {
      console.error('Giderler getirilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    if (user) fetchExpenses();
  }, [user, fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await browserData.insertInto('expenses', [
        {
          user_id: user.id,
          category: newExpense.category,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          date: newExpense.date,
          payment_method: newExpense.payment_method
        }
      ]);

      if (error) throw error;

      setExpenses([data[0], ...expenses]);
      setNewExpense({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'nakit'
      });
    } catch (error) {
      console.error('Gider eklenirken hata:', error.message);
    }
  };

  // Gider sil
  const deleteExpense = async (id) => {
    try {
      const { error } = await browserData.deleteById('expenses', id);
      if (error) throw error;

      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      console.error('Gider silinirken hata:', error.message);
    }
  };

  // Kategori bazında toplam hesapla
  const calculateTotalsByCategory = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
  };

  // Ödeme yöntemine göre toplam hesapla
  const calculateTotalsByPaymentMethod = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.payment_method] = (acc[expense.payment_method] || 0) + expense.amount;
      return acc;
    }, {});
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

  const totalsByCategory = calculateTotalsByCategory();
  const totalsByPaymentMethod = calculateTotalsByPaymentMethod();
  const grandTotal = Object.values(totalsByCategory).reduce((a, b) => a + b, 0);

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Gider Takibi</h2>
          <p className="text-muted mb-0">Harcamalarınızı kategorize edin ve bütçenizi kontrol altında tutun.</p>
        </div>
        <div className="text-end">
          <div className="glass-pro-max p-3 rounded-4 border-0">
            <small className="text-muted d-block mb-1">Toplam Harcama</small>
            <span className="fs-3 fw-bold text-primary">
              {grandTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden mb-4">
            <div className="card-header bg-primary text-white py-3 border-0">
              <h5 className="card-title mb-0">Harcama Ekle</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Kategori</label>
                  <select
                    className="form-select border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Açıklama</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Tutar (₺)</label>
                  <input
                    type="number"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    min="0"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Tarih</label>
                  <input
                    type="date"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small text-muted">Ödeme Yöntemi</label>
                  <select
                    className="form-select border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newExpense.payment_method}
                    onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>{method.label}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-pro-max w-100 py-3 shadow-sm">
                  <i className="fas fa-plus-circle me-2"></i>Harcama Kaydet
                </button>
              </form>
            </div>
          </div>

          <div className="card card-pro border-0 shadow-sm glass-pro-max p-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Kategori Özetleri</h6>
            {Object.entries(totalsByCategory).map(([category, total]) => (
              <div key={category} className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">{category}:</span>
                <span className="fw-bold">{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom border-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Harcama Listesi</h5>
                <span className="badge bg-light text-dark">{expenses.length} Harcama</span>
              </div>
            </div>
            <div className="card-body p-0">
              {expenses.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-receipt fs-1 mb-3 opacity-25"></i>
                  <p>Henüz harcama eklenmemiş.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4 border-0">Harcama & Kategori</th>
                        <th className="border-0">Tutar</th>
                        <th className="border-0 text-center">Ödeme</th>
                        <th className="border-0 text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(expense => (
                        <tr key={expense.id}>
                          <td className="ps-4">
                            <div className="fw-bold text-primary">{expense.description}</div>
                            <span className="badge bg-primary-subtle text-primary small">{expense.category}</span>
                          </td>
                          <td>
                            <div className="fw-bold">{expense.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                            <small className="text-muted">{new Date(expense.date).toLocaleDateString('tr-TR')}</small>
                          </td>
                          <td className="text-center">
                            <span className="small text-muted">
                              {paymentMethods.find(m => m.id === expense.payment_method)?.label}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-danger p-0 border-0"
                              onClick={() => deleteExpense(expense.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
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

export default Expenses; 