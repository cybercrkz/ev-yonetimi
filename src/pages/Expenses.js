import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

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
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Giderler getirilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, fetchExpenses]);

  // Yeni gider ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            category: newExpense.category,
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            date: newExpense.date,
            payment_method: newExpense.payment_method
          }
        ])
        .select();

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
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

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
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Yeni Gider Ekle</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    id="category"
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
                  <label htmlFor="description" className="form-label">Açıklama</label>
                  <input
                    type="text"
                    className="form-control"
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">Tutar (₺)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    min="0"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Tarih</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="payment_method" className="form-label">Ödeme Yöntemi</label>
                  <select
                    className="form-select"
                    id="payment_method"
                    value={newExpense.payment_method}
                    onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>{method.label}</option>
                    ))}
                  </select>
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
              <div className="mb-3">
                <h6 className="mb-3">Kategorilere Göre</h6>
                {Object.entries(totalsByCategory).map(([category, total]) => (
                  <div key={category} className="d-flex justify-content-between mb-2">
                    <span>{category}:</span>
                    <span className="fw-bold">
                      {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Toplam:</span>
                  <span className="fw-bold text-primary">
                    {grandTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
              <div>
                <h6 className="mb-3">Ödeme Yöntemlerine Göre</h6>
                {Object.entries(totalsByPaymentMethod).map(([method, total]) => {
                  const paymentMethod = paymentMethods.find(m => m.id === method);
                  return (
                    <div key={method} className="d-flex justify-content-between mb-2">
                      <span>{paymentMethod?.label || method}:</span>
                      <span className="fw-bold">
                        {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Giderler</h5>
              {expenses.length === 0 ? (
                <p className="text-muted text-center">Henüz gider eklenmemiş.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Kategori</th>
                        <th>Açıklama</th>
                        <th>Tutar</th>
                        <th>Ödeme</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(expense => (
                        <tr key={expense.id}>
                          <td>{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                          <td>{expense.category}</td>
                          <td>{expense.description}</td>
                          <td>
                            {expense.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </td>
                          <td>
                            {paymentMethods.find(m => m.id === expense.payment_method)?.label}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteExpense(expense.id)}
                              title="Sil"
                            >
                              <i className="fas fa-trash"></i>
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