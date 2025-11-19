import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getShoppingItems, saveShoppingItem, updateShoppingItem, deleteShoppingItem } from '../utils/localStorage';
import { toast } from 'react-toastify';

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

  const fetchItems = useCallback(() => {
    try {
      setLoading(true);
      if (user) {
        const data = getShoppingItems(user.id);
        setItems(data || []);
      }
    } catch (error) {
      console.error('Market listesi getirilirken hata:', error.message);
      toast.error('Market listesi yüklenirken hata oluştu');
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
      const newItemData = {
        item_name: newItem.item_name,
        quantity: newItem.quantity,
        category: newItem.category || 'Diğer'
      };

      const savedItem = saveShoppingItem(user.id, newItemData);
      setItems([savedItem, ...items]);
      setNewItem({ item_name: '', quantity: 1, category: '' });
      toast.success('Ürün eklendi');
    } catch (error) {
      console.error('Ürün eklenirken hata:', error.message);
      toast.error('Ürün eklenirken hata oluştu');
    }
  };

  // Ürün durumunu güncelle
  const toggleStatus = async (item) => {
    try {
      const newCompleted = !item.completed;
      updateShoppingItem(user.id, item.id, { completed: newCompleted });

      setItems(items.map(i => 
        i.id === item.id ? { ...i, completed: newCompleted } : i
      ));
    } catch (error) {
      console.error('Durum güncellenirken hata:', error.message);
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  // Ürün sil
  const deleteItemHandler = async (id) => {
    try {
      deleteShoppingItem(user.id, id);
      setItems(items.filter(i => i.id !== id));
      toast.success('Ürün silindi');
    } catch (error) {
      console.error('Ürün silinirken hata:', error.message);
      toast.error('Ürün silinirken hata oluştu');
    }
  };

  // Miktar güncelle
  const updateQuantity = async (item, change) => {
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      updateShoppingItem(user.id, item.id, { quantity: newQuantity });

      setItems(items.map(i => 
        i.id === item.id ? { ...i, quantity: newQuantity } : i
      ));
    } catch (error) {
      console.error('Miktar güncellenirken hata:', error.message);
      toast.error('Miktar güncellenirken hata oluştu');
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
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Yeni Ürün Ekle</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="item_name" className="form-label">Ürün Adı</label>
                  <input
                    type="text"
                    className="form-control"
                    id="item_name"
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">Miktar</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <i className="fas fa-plus me-2"></i>Ekle
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Market Listesi</h5>
              {items.length === 0 ? (
                <p className="text-muted text-center">Henüz listeye ürün eklenmemiş.</p>
              ) : (
                Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category} className="mb-4">
                    <h6 className="border-bottom pb-2 mb-3">
                      <i className="fas fa-tag me-2"></i>{category}
                    </h6>
                    <div className="list-group">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div className="form-check flex-grow-1">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleStatus(item)}
                              id={`item-${item.id}`}
                            />
                            <label
                              className="form-check-label ms-2"
                              htmlFor={`item-${item.id}`}
                              style={{
                                textDecoration: item.completed ? 'line-through' : 'none'
                              }}
                            >
                              {item.item_name}
                            </label>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="btn-group me-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item, -1)}
                              >
                                -
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" disabled>
                                {item.quantity}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item, 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteItemHandler(item.id)}
                            >
                              <i className="fas fa-trash"></i>
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
