import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBills, getExpenses, getIncomes, getTodos, getShoppingItems } from '../utils/localStorage';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bills: { total: 0, paid: 0, pending: 0 },
    expenses: { total: 0, categories: {} },
    incomes: { total: 0, categories: {} },
    todos: { total: 0, completed: 0, pending: 0 },
    shoppingItems: { total: 0, completed: 0, pending: 0 }
  });
  const [upcomingBills, setUpcomingBills] = useState([]);

  // Tüm istatistikleri getir
  const fetchStats = useCallback(() => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Yaklaşan faturaları getir
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);

      const allBills = getBills(user.id);
      const upcoming = allBills
        .filter(bill => {
          const dueDate = new Date(bill.due_date);
          return bill.status === 'pending' && dueDate >= today && dueDate <= thirtyDaysLater;
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);

      setUpcomingBills(upcoming);

      // Faturalar istatistikleri
      const billsStats = allBills.reduce((acc, bill) => {
        acc.total += bill.amount;
        if (bill.status === 'completed') {
          acc.paid += bill.amount;
        } else {
          acc.pending += bill.amount;
        }
        return acc;
      }, { total: 0, paid: 0, pending: 0 });

      // Giderler istatistikleri
      const allExpenses = getExpenses(user.id);
      const expensesStats = allExpenses.reduce((acc, expense) => {
        acc.total += expense.amount;
        acc.categories[expense.category] = (acc.categories[expense.category] || 0) + expense.amount;
        return acc;
      }, { total: 0, categories: {} });

      // Gelirler istatistikleri
      const allIncomes = getIncomes(user.id);
      const incomesStats = allIncomes.reduce((acc, income) => {
        acc.total += income.amount;
        acc.categories[income.category] = (acc.categories[income.category] || 0) + income.amount;
        return acc;
      }, { total: 0, categories: {} });

      // Yapılacaklar istatistikleri
      const allTodos = getTodos(user.id);
      const todosStats = allTodos.reduce((acc, todo) => {
        acc.total++;
        if (todo.completed) {
          acc.completed++;
        } else {
          acc.pending++;
        }
        return acc;
      }, { total: 0, completed: 0, pending: 0 });

      // Market listesi istatistikleri
      const allItems = getShoppingItems(user.id);
      const shoppingStats = allItems.reduce((acc, item) => {
        acc.total++;
        if (item.completed) {
          acc.completed++;
        } else {
          acc.pending++;
        }
        return acc;
      }, { total: 0, completed: 0, pending: 0 });

      setStats({
        bills: billsStats,
        expenses: expensesStats,
        incomes: incomesStats,
        todos: todosStats,
        shoppingItems: shoppingStats
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
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Faturalar Özeti */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title mb-0">Faturalar</h6>
                <i className="fas fa-file-invoice-dollar fs-4 text-primary"></i>
              </div>
              <div className="mb-2">
                <span className="fs-4 fw-bold text-primary">
                  {stats.bills.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="text-muted ms-2">Toplam</span>
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <span className="text-success">
                    {stats.bills.paid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  <br />
                  <small className="text-muted">Ödenen</small>
                </div>
                <div className="text-end">
                  <span className="text-danger">
                    {stats.bills.pending.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  <br />
                  <small className="text-muted">Bekleyen</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gelirler Özeti */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title mb-0">Gelirler</h6>
                <i className="fas fa-money-bill-wave fs-4 text-success"></i>
              </div>
              <div className="mb-2">
                <span className="fs-4 fw-bold text-success">
                  {stats.incomes.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="text-muted ms-2">Toplam</span>
              </div>
              <div className="small">
                {Object.entries(stats.incomes.categories).slice(0, 3).map(([category, amount]) => (
                  <div key={category} className="d-flex justify-content-between mb-1">
                    <span>{category}</span>
                    <span>{amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Giderler Özeti */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title mb-0">Giderler</h6>
                <i className="fas fa-wallet fs-4 text-danger"></i>
              </div>
              <div className="mb-2">
                <span className="fs-4 fw-bold text-danger">
                  {stats.expenses.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="text-muted ms-2">Toplam</span>
              </div>
              <div className="small">
                {Object.entries(stats.expenses.categories).slice(0, 3).map(([category, amount]) => (
                  <div key={category} className="d-flex justify-content-between mb-1">
                    <span>{category}</span>
                    <span>{amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Net Bakiye */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title mb-0">Net Bakiye</h6>
                <i className="fas fa-balance-scale fs-4 text-info"></i>
              </div>
              <div className="mb-2">
                <span className={`fs-4 fw-bold ${stats.incomes.total - stats.expenses.total >= 0 ? 'text-success' : 'text-danger'}`}>
                  {(stats.incomes.total - stats.expenses.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="text-muted ms-2">Gelir - Gider</span>
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <span className="text-success">
                    {stats.incomes.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  <br />
                  <small className="text-muted">Gelir</small>
                </div>
                <div className="text-end">
                  <span className="text-danger">
                    {stats.expenses.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  <br />
                  <small className="text-muted">Gider</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yapılacaklar Özeti */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title mb-0">Yapılacaklar</h6>
                <i className="fas fa-tasks fs-4 text-warning"></i>
              </div>
              <div className="mb-2">
                <span className="fs-4 fw-bold text-warning">{stats.todos.total}</span>
                <span className="text-muted ms-2">Toplam</span>
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <span className="text-success">{stats.todos.completed}</span>
                  <br />
                  <small className="text-muted">Tamamlanan</small>
                </div>
                <div className="text-end">
                  <span className="text-danger">{stats.todos.pending}</span>
                  <br />
                  <small className="text-muted">Bekleyen</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Listesi Özeti */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title mb-0">Market Listesi</h6>
                <i className="fas fa-shopping-basket fs-4 text-info"></i>
              </div>
              <div className="mb-2">
                <span className="fs-4 fw-bold text-info">{stats.shoppingItems.total}</span>
                <span className="text-muted ms-2">Toplam</span>
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <span className="text-success">{stats.shoppingItems.completed}</span>
                  <br />
                  <small className="text-muted">Alınan</small>
                </div>
                <div className="text-end">
                  <span className="text-danger">{stats.shoppingItems.pending}</span>
                  <br />
                  <small className="text-muted">Bekleyen</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gider Dağılımı Grafiği */}
        {Object.keys(stats.expenses.categories).length > 0 && (
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                <h6 className="card-title mb-3">Gider Dağılımı</h6>
                <div style={{ height: '300px' }}>
                  <Doughnut
                    data={{
                      labels: Object.keys(stats.expenses.categories),
                      datasets: [
                        {
                          data: Object.values(stats.expenses.categories),
                          backgroundColor: [
                            '#4e73df',
                            '#1cc88a',
                            '#36b9cc',
                            '#f6c23e',
                            '#e74a3b',
                            '#858796',
                          ],
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yaklaşan Faturalar */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h6 className="card-title mb-3">Yaklaşan Faturalar (30 Gün)</h6>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Fatura</th>
                      <th>Tutar</th>
                      <th>Son Ödeme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBills.map((bill) => (
                      <tr key={bill.id}>
                        <td>{bill.bill_type}</td>
                        <td>{bill.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                        <td>{new Date(bill.due_date).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    ))}
                    {upcomingBills.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          Yaklaşan fatura bulunmuyor
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
