import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { browserData } from '../lib/browserData';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bills: { total: 0, paid: 0, pending: 0 },
    expenses: { total: 0, categories: {} },
    todos: { total: 0, completed: 0, pending: 0 },
    shoppingItems: { total: 0, completed: 0, pending: 0 }
  });
  const [upcomingBills, setUpcomingBills] = useState([]);

  // Tüm istatistikleri getir
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      // Yaklaşan faturaları getir
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);

      const { data: upcoming, error: upcomingError } = await browserData.getUpcomingBills(
        user.id,
        today.toISOString(),
        thirtyDaysLater.toISOString(),
        5
      );
      if (upcomingError) throw upcomingError;
      setUpcomingBills(upcoming || []);

      // Faturalar istatistikleri
      const { data: bills, error: billsError } = await browserData.getBillsForUser(user.id);
      if (billsError) throw billsError;

      const billsStats = bills.reduce((acc, bill) => {
        acc.total += bill.amount;
        if (bill.status === 'completed') {
          acc.paid += bill.amount;
        } else {
          acc.pending += bill.amount;
        }
        return acc;
      }, { total: 0, paid: 0, pending: 0 });

      // Giderler istatistikleri
      const { data: expenses, error: expensesError } = await browserData.getExpensesForUser(user.id);
      if (expensesError) throw expensesError;

      const expensesStats = expenses.reduce((acc, expense) => {
        acc.total += expense.amount;
        acc.categories[expense.category] = (acc.categories[expense.category] || 0) + expense.amount;
        return acc;
      }, { total: 0, categories: {} });

      // Yapılacaklar istatistikleri
      const { data: todos, error: todosError } = await browserData.getTodosForUser(user.id);
      if (todosError) throw todosError;

      const todosStats = todos.reduce((acc, todo) => {
        acc.total++;
        if (todo.status === 'completed') {
          acc.completed++;
        } else {
          acc.pending++;
        }
        return acc;
      }, { total: 0, completed: 0, pending: 0 });

      // Market listesi istatistikleri
      const { data: items, error: itemsError } = await browserData.getShoppingItemsForUser(user.id);
      if (itemsError) throw itemsError;

      const shoppingStats = items.reduce((acc, item) => {
        acc.total++;
        if (item.status === 'completed') {
          acc.completed++;
        } else {
          acc.pending++;
        }
        return acc;
      }, { total: 0, completed: 0, pending: 0 });

      setStats({
        bills: billsStats,
        expenses: expensesStats,
        todos: todosStats,
        shoppingItems: shoppingStats,
        incomes: { total: 0 } // default if fetch fails
      });

      // Gelirler istatistikleri
      const { data: incomes, error: incomesError } = await browserData.getIncomesForUser(user.id);
      if (incomesError) throw incomesError;

      const incomesTotal = (incomes || []).reduce((acc, inc) => acc + inc.amount, 0);

      setStats({
        bills: billsStats,
        expenses: expensesStats,
        todos: todosStats,
        shoppingItems: shoppingStats,
        incomes: { total: incomesTotal }
      });
    } catch (error) {
      console.error('İstatistikler getirilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  if (!user) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1>Ev Yönetimi Sistemine Hoş Geldiniz</h1>
          <p className="lead">
            Giriş yaparak tüm özelliklere erişebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-5 px-3">
        <div>
          <h1 className="fw-bold text-primary mb-1">Hoş Geldin, {user.email.split('@')[0]}</h1>
          <p className="text-muted mb-0">İşte evinin bugünkü finansal özeti.</p>
        </div>
        <div className="d-flex gap-3">
          <button className="btn btn-pro-max btn-accent shadow-sm" onClick={fetchStats}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Kasa Özeti - Ana Kart */}
        <div className="col-md-6 col-lg-4">
          <div className="glass-pro-max p-4 h-100 border-0" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 opacity-75">Eldeki Nakit</h5>
              <div className="p-2 rounded-3 bg-white bg-opacity-10">
                <i className="fas fa-hand-holding-usd fs-4 text-warning"></i>
              </div>
            </div>
            <div className="mb-4">
              <h2 className="stat-value text-white mb-1">
                {(stats.incomes?.total - stats.expenses?.total - stats.bills?.paid).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </h2>
              <p className="small opacity-50 mb-0">Gelir - Gider - Ödenen Faturalar</p>
            </div>
            <div className="pt-3 border-top border-white border-opacity-10">
              <div className="d-flex justify-content-between align-items-center">
                <span className="small opacity-75">Tüm Borçlar Çıkınca:</span>
                <span className="fw-bold">
                  {(stats.incomes?.total - stats.expenses?.total - stats.bills?.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Faturalar Özeti */}
        <div className="col-md-6 col-lg-4">
          <div className="card card-pro p-4 h-100 border-0 shadow-sm glass-pro-max">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 text-dark">Faturalar</h5>
                <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                  <i className="fas fa-file-invoice-dollar fs-4"></i>
                </div>
              </div>
              <div className="mb-3">
                <h2 className="stat-value text-primary mb-1">
                  {stats.bills.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </h2>
                <p className="small text-muted mb-0">Toplam Fatura Yükü</p>
              </div>
              <div className="d-flex gap-4">
                <div>
                  <span className="text-success fw-bold d-block">
                    {stats.bills.paid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  <small className="text-muted">Ödenen</small>
                </div>
                <div>
                  <span className="text-danger fw-bold d-block">
                    {stats.bills.pending.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  <small className="text-muted">Bekleyen</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Giderler Özeti */}
        <div className="col-md-6 col-lg-4">
          <div className="card card-pro p-4 h-100 border-0 shadow-sm glass-pro-max">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 text-dark">Giderler</h5>
                <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                  <i className="fas fa-wallet fs-4"></i>
                </div>
              </div>
              <div className="mb-3">
                <h2 className="stat-value text-success mb-1">
                  {stats.expenses.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </h2>
                <p className="small text-muted mb-0">Aylık Harcama</p>
              </div>
              <div className="small overflow-hidden" style={{ maxHeight: '60px' }}>
                {Object.entries(stats.expenses.categories).slice(0, 2).map(([category, amount]) => (
                  <div key={category} className="d-flex justify-content-between mb-1">
                    <span className="text-muted">{category}:</span>
                    <span className="fw-bold">{amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Market ve Yapılacaklar - Küçük Kartlar */}
        <div className="col-lg-3">
          <div className="card card-pro mb-4 border-0 shadow-sm p-4 glass-pro-max">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Yapılacaklar</h6>
              <i className="fas fa-tasks text-warning"></i>
            </div>
            <div className="d-flex justify-content-between align-items-end">
              <h3 className="stat-value mb-0 text-warning">{stats.todos.total}</h3>
              <div className="text-end">
                <small className="text-success d-block">{stats.todos.completed} Bitti</small>
                <small className="text-danger d-block">{stats.todos.pending} Kaldı</small>
              </div>
            </div>
          </div>
          <div className="card card-pro border-0 shadow-sm p-4 glass-pro-max">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Market Listesi</h6>
              <i className="fas fa-shopping-basket text-info"></i>
            </div>
            <div className="d-flex justify-content-between align-items-end">
              <h3 className="stat-value mb-0 text-info">{stats.shoppingItems.total}</h3>
              <div className="text-end">
                <small className="text-success d-block">{stats.shoppingItems.completed} Alındı</small>
                <small className="text-danger d-block">{stats.shoppingItems.pending} Eksik</small>
              </div>
            </div>
          </div>
        </div>

        {/* Gider Grafiği */}
        <div className="col-lg-5">
          <div className="card card-pro border-0 shadow-sm p-4 glass-pro-max h-100">
            <h5 className="card-title mb-4">Harcama Dağılımı</h5>
            <div style={{ height: '300px' }}>
              <Doughnut
                data={{
                  labels: Object.keys(stats.expenses.categories),
                  datasets: [
                    {
                      data: Object.values(stats.expenses.categories),
                      backgroundColor: ['#0F172A', '#CA8A04', '#1E293B', '#B45309', '#64748B', '#94A3B8'],
                      borderWidth: 0,
                      hoverOffset: 10
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10, font: { family: 'Inter', size: 12 } } },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Yaklaşan Faturalar */}
        <div className="col-lg-4">
          <div className="card card-pro border-0 shadow-sm p-4 glass-pro-max h-100">
            <h5 className="card-title mb-4">Yaklaşan Faturalar</h5>
            <div className="list-group list-group-flush">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="list-group-item bg-transparent px-0 border-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold">{bill.bill_type}</h6>
                    <small className="text-muted">{new Date(bill.due_date).toLocaleDateString('tr-TR')}</small>
                  </div>
                  <span className="badge bg-light text-primary rounded-pill px-3 py-2 fw-bold">
                    {bill.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              ))}
              {upcomingBills.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-check-circle fs-1 mb-3 opacity-25"></i>
                  <p>Ödenmeyi bekleyen fatura yok!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 