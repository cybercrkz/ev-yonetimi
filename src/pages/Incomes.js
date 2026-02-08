import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { browserData } from '../lib/browserData';

const Incomes = () => {
    const { user } = useAuth();
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newIncome, setNewIncome] = useState({
        category: 'Maaş',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
    });

    const categories = [
        'Maaş',
        'İkramiye',
        'Mesai',
        'Ek Gelir',
        'Yatırım Getirisi',
        'Diğer'
    ];

    const fetchIncomes = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await browserData.getIncomesForUser(user.id);
            if (error) throw error;
            const sorted = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
            setIncomes(sorted);
        } catch (error) {
            console.error('Gelirler getirilirken hata:', error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchIncomes();
    }, [user, fetchIncomes]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await browserData.insertInto('incomes', [
                {
                    user_id: user.id,
                    category: newIncome.category,
                    description: newIncome.description,
                    amount: parseFloat(newIncome.amount),
                    date: newIncome.date
                }
            ]);

            if (error) throw error;

            setIncomes([data[0], ...incomes]);
            setNewIncome({
                category: 'Maaş',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            console.error('Gelir eklenirken hata:', error.message);
        }
    };

    const deleteIncome = async (id) => {
        if (!window.confirm('Bu geliri silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await browserData.deleteById('incomes', id);
            if (error) throw error;
            setIncomes(incomes.filter(i => i.id !== id));
        } catch (error) {
            console.error('Gelir silinirken hata:', error.message);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    const grandTotal = incomes.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1">Kasa & Gelir Yönetimi</h2>
                    <p className="text-muted mb-0">Maas, ikramiye ve diğer para girişlerinizi takip edin.</p>
                </div>
                <div className="text-end">
                    <div className="glass-pro-max p-3 rounded-4 shadow-sm border-0">
                        <small className="text-muted d-block mb-1">Toplam Kasa Girişi</small>
                        <span className="fs-3 fw-bold text-success">
                            {grandTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-primary text-white py-3 border-0">
                            <h5 className="card-title mb-0">Para Girişi Ekle</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Gelir Türü</label>
                                    <select
                                        className="form-select border-0 bg-light py-2"
                                        style={{ borderRadius: '10px' }}
                                        value={newIncome.category}
                                        onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Açıklama</label>
                                    <input
                                        type="text"
                                        className="form-control border-0 bg-light py-2"
                                        style={{ borderRadius: '10px' }}
                                        placeholder="Örn: Şubat Ayı Maaşı"
                                        value={newIncome.description}
                                        onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Tutar (₺)</label>
                                    <input
                                        type="number"
                                        className="form-control border-0 bg-light py-2"
                                        style={{ borderRadius: '10px' }}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={newIncome.amount}
                                        onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small text-muted">Tarih</label>
                                    <input
                                        type="date"
                                        className="form-control border-0 bg-light py-2"
                                        style={{ borderRadius: '10px' }}
                                        value={newIncome.date}
                                        onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-pro-max w-100 py-3 shadow-sm">
                                    <i className="fas fa-plus-circle me-2"></i>Kasaya Ekle
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-white py-3 border-bottom border-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">Son Hareketler</h5>
                                <span className="badge bg-light text-dark">{incomes.length} İşlem</span>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 border-0">Tarih</th>
                                            <th className="border-0">Kategori</th>
                                            <th className="border-0">Açıklama</th>
                                            <th className="border-0 text-end pe-4">Tutar</th>
                                            <th className="border-0 text-center">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {incomes.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">Henüz para girişi kaydedilmemiş.</td>
                                            </tr>
                                        ) : (
                                            incomes.map(income => (
                                                <tr key={income.id}>
                                                    <td className="ps-4 small text-muted">{new Date(income.date).toLocaleDateString('tr-TR')}</td>
                                                    <td>
                                                        <span className="badge bg-success-subtle text-success px-3 py-2 rounded-3">
                                                            {income.category}
                                                        </span>
                                                    </td>
                                                    <td className="fw-medium">{income.description}</td>
                                                    <td className="text-end pe-4 fw-bold text-success">
                                                        + {income.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-link text-danger p-0 border-0"
                                                            onClick={() => deleteIncome(income.id)}
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
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

export default Incomes;
