import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { browserData } from '../lib/browserData';

const Shopping = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    item_name: '',
    quantity: 1,
    category: ''
  });

  const categories = [
    'Meyve & Sebze',
    'Et & Tavuk',
    'Süt & Kahvaltılık',
    'İçecek',
    'Temizlik',
    'Kişisel Bakım',
    'Atıştırmalık',
    'Diğer'
  ];

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await browserData.getShoppingItemsForUser(user.id);
      if (error) throw error;
      const sorted = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setItems(sorted);
    } catch (error) {
      console.error('Market listesi getirilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, fetchItems]);

  // Yeni ürün ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await browserData.insertInto('shopping_items', [
        {
          user_id: user.id,
          item_name: newItem.item_name,
          quantity: newItem.quantity,
          category: newItem.category || 'Diğer',
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setItems([data[0], ...items]);
      setNewItem({ item_name: '', quantity: 1, category: '' });
    } catch (error) {
      console.error('Ürün eklenirken hata:', error.message);
    }
  };

  // Ürün durumunu güncelle
  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'completed' ? 'pending' : 'completed';
      const { error } = await browserData.updateById('shopping_items', item.id, { status: newStatus });
      if (error) throw error;

      setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
    } catch (error) {
      console.error('Durum güncellenirken hata:', error.message);
    }
  };

  // Ürün sil
  const deleteItem = async (id) => {
    try {
      const { error } = await browserData.deleteById('shopping_items', id);
      if (error) throw error;

      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error('Ürün silinirken hata:', error.message);
    }
  };

  // Miktar güncelle
  const updateQuantity = async (item, change) => {
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      const { error } = await browserData.updateById('shopping_items', item.id, { quantity: newQuantity });
      if (error) throw error;

      setItems(items.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i));
    } catch (error) {
      console.error('Miktar güncellenirken hata:', error.message);
    }
  };

  // Kategoriye göre ürünleri grupla
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Diğer';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

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
    <div className="container py-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Market Listesi</h2>
          <p className="text-muted mb-0">Evin eksiklerini listeleyin ve alışverişinizi planlayın.</p>
        </div>
        <div className="text-end">
          <div className="glass-pro-max p-3 rounded-4 border-0">
            <small className="text-muted d-block mb-1">Listede</small>
            <span className="fs-3 fw-bold text-info">{items.length} Ürün</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden">
            <div className="card-header bg-primary text-white py-3 border-0">
              <h5 className="card-title mb-0">Ürün Ekle</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Ürün Adı</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Miktar</label>
                  <input
                    type="number"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small text-muted">Kategori</label>
                  <select
                    className="form-select border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-pro-max w-100 py-3 shadow-sm">
                  <i className="fas fa-plus-circle me-2"></i>Listeye Ekle
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom border-light">
              <h5 className="card-title mb-0">Harcama Listesi</h5>
            </div>
            <div className="card-body p-4">
              {items.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-shopping-basket fs-1 mb-3 opacity-25"></i>
                  <p>Henüz listeye ürün eklenmemiş.</p>
                </div>
              ) : (
                Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category} className="mb-5">
                    <h6 className="fw-bold mb-3 text-primary d-flex align-items-center">
                      <span className="p-1 px-2 rounded-2 bg-primary bg-opacity-10 me-2">
                        <i className="fas fa-tag small"></i>
                      </span>
                      {category}
                    </h6>
                    <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className="list-group-item bg-white px-4 py-3 d-flex justify-content-between align-items-center border-light transition-all"
                          style={{ opacity: item.status === 'completed' ? 0.6 : 1 }}
                        >
                          <div className="d-flex align-items-center flex-grow-1">
                            <div className="form-check custom-checkbox">
                              <input
                                className="form-check-input border-2"
                                type="checkbox"
                                checked={item.status === 'completed'}
                                onChange={() => toggleStatus(item)}
                                id={`item-${item.id}`}
                                style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                              />
                            </div>
                            <label
                              className="form-check-label mb-0 ms-3 fw-bold"
                              htmlFor={`item-${item.id}`}
                              style={{
                                textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                                cursor: 'pointer',
                                color: item.status === 'completed' ? '#94a3b8' : '#1e293b'
                              }}
                            >
                              {item.item_name}
                            </label>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1">
                              <button
                                className="btn btn-sm btn-link text-muted p-0 border-0"
                                onClick={() => updateQuantity(item, -1)}
                              >
                                <i className="fas fa-minus-circle"></i>
                              </button>
                              <span className="mx-3 fw-bold small">{item.quantity}</span>
                              <button
                                className="btn btn-sm btn-link text-muted p-0 border-0"
                                onClick={() => updateQuantity(item, 1)}
                              >
                                <i className="fas fa-plus-circle"></i>
                              </button>
                            </div>
                            <button
                              className="btn btn-link text-danger p-0 border-0 ms-2"
                              onClick={() => deleteItem(item.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shopping; 