import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIncomes, saveIncome, deleteIncome as deleteIncomeLS } from '../utils/localStorage';
import { toast } from 'react-toastify';

const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIncome, setNewIncome] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'banka_havalesi'
  });

  const categories = [
    'Maaş',
    'İkramiye',
    'Freelance',
    'Yatırım Getirisi',
    'Kira Geliri',
    'Satış',
    'Hediye',
    'Diğer'
  ];

  const paymentMethods = [
    { id: 'banka_havalesi', label: 'Banka Havalesi' },
    { id: 'nakit', label: 'Nakit' },
    { id: 'kredi_karti', label: 'Kredi Kartı' },
    { id: 'cek', label: 'Çek' }
  ];

  const fetchIncomes = useCallback(() => {
    try {
      setLoading(true);
      if (user) {
        const data = getIncomes(user.id);
        setIncomes(data || []);
      }
    } catch (error) {
      console.error('Gelirler getirilirken hata:', error.message);
      toast.error('Gelirler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchIncomes();
    }
  }, [user, fetchIncomes]);

  // Yeni gelir ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newIncomeData = {
        category: newIncome.category,
        description: newIncome.description,
        amount: parseFloat(newIncome.amount),
        date: newIncome.date,
        payment_method: newIncome.payment_method
      };

      const savedIncome = saveIncome(user.id, newIncomeData);
      setIncomes([savedIncome, ...incomes]);
      setNewIncome({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'banka_havalesi'
      });
      toast.success('Gelir eklendi');
    } catch (error) {
      console.error('Gelir eklenirken hata:', error.message);
      toast.error('Gelir eklenirken hata oluştu');
    }
  };

  // Gelir sil
  const deleteIncomeHandler = async (id) => {
    try {
      deleteIncomeLS(user.id, id);
      setIncomes(incomes.filter(i => i.id !== id));
      toast.success('Gelir silindi');
    } catch (error) {
      console.error('Gelir silinirken hata:', error.message);
      toast.error('Gelir silinirken hata oluştu');
    }
  };

  // Kategori bazında toplam hesapla
  const calculateTotalsByCategory = () => {
    return incomes.reduce((acc, income) => {
      acc[income.category] = (acc[income.category] || 0) + income.amount;
      return acc;
    }, {});
  };

  // Ödeme yöntemine göre toplam hesapla
  const calculateTotalsByPaymentMethod = () => {
    return incomes.reduce((acc, income) => {
      acc[income.payment_method] = (acc[income.payment_method] || 0) + income.amount;
      return acc;
    }, {});
  };

  // Aylık toplam hesapla
  const calculateMonthlyTotal = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return incomes
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
      })
      .reduce((sum, income) => sum + income.amount, 0);
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
  const monthlyTotal = calculateMonthlyTotal();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Yeni Gelir Ekle</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    id="category"
                    value={newIncome.category}
                    onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
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
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                    placeholder="Örn: Ocak ayı maaşı"
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
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Tarih</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="payment_method" className="form-label">Ödeme Yöntemi</label>
                  <select
                    className="form-select"
                    id="payment_method"
                    value={newIncome.payment_method}
                    onChange={(e) => setNewIncome({ ...newIncome, payment_method: e.target.value })}
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>{method.label}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-success w-100">
                  <i className="fas fa-plus me-2"></i>Ekle
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow mt-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Özet</h5>
              
              <div className="mb-3 p-3 bg-success bg-opacity-10 rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Bu Ay:</span>
                  <span className="fs-5 fw-bold text-success">
                    {monthlyTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>

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
                  <span className="fw-bold text-success">
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
              <h5 className="card-title mb-4">
                <i className="fas fa-money-bill-wave text-success me-2"></i>
                Gelirler
              </h5>
              {incomes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Henüz gelir eklenmemiş.</p>
                  <p className="text-muted">Sol taraftaki formu kullanarak ilk gelirinizi ekleyin.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Kategori</th>
                        <th>Açıklama</th>
                        <th>Tutar</th>
                        <th>Ödeme Yöntemi</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomes.map(income => (
                        <tr key={income.id}>
                          <td>{new Date(income.date).toLocaleDateString('tr-TR')}</td>
                          <td>
                            <span className="badge bg-success">{income.category}</span>
                          </td>
                          <td>{income.description}</td>
                          <td className="text-success fw-bold">
                            +{income.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </td>
                          <td>
                            <small>{paymentMethods.find(m => m.id === income.payment_method)?.label}</small>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteIncomeHandler(income.id)}
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

export default Income;

