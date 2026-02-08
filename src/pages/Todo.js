import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { browserData } from '../lib/browserData';

const Todo = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    due_date: ''
  });

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await browserData.getTodosForUser(user.id);
      if (error) throw error;
      const sorted = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTodos(sorted);
    } catch (error) {
      console.error('Yapılacaklar listesi getirilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user, fetchTodos]);

  // Yeni yapılacak ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await browserData.insertInto('todos', [
        {
          user_id: user.id,
          title: newTodo.title,
          description: newTodo.description,
          due_date: newTodo.due_date || null,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setTodos([data[0], ...todos]);
      setNewTodo({ title: '', description: '', due_date: '' });
    } catch (error) {
      console.error('Yapılacak eklenirken hata:', error.message);
    }
  };

  // Yapılacak durumunu güncelle
  const toggleStatus = async (todo) => {
    try {
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      const { error } = await browserData.updateById('todos', todo.id, { status: newStatus });
      if (error) throw error;

      setTodos(todos.map(t =>
        t.id === todo.id ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Durum güncellenirken hata:', error.message);
    }
  };

  // Yapılacak sil
  const deleteTodo = async (id) => {
    try {
      const { error } = await browserData.deleteById('todos', id);
      if (error) throw error;

      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Yapılacak silinirken hata:', error.message);
    }
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

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Yapılacaklar</h2>
          <p className="text-muted mb-0">Günlük işlerinizi organize edin ve verimliliğinizi artırın.</p>
        </div>
        <div className="text-end">
          <div className="glass-pro-max p-3 rounded-4 border-0 d-inline-flex gap-3 align-items-center">
            <div className="text-end">
              <small className="text-muted d-block mb-0">Bekleyen</small>
              <span className="fs-4 fw-bold text-warning">{todos.filter(t => t.status !== 'completed').length}</span>
            </div>
            <div className="vr opacity-25" style={{ height: '30px' }}></div>
            <div className="text-end">
              <small className="text-muted d-block mb-0">Biten</small>
              <span className="fs-4 fw-bold text-success">{todos.filter(t => t.status === 'completed').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden">
            <div className="card-header bg-primary text-white py-3 border-0">
              <h5 className="card-title mb-0">Yeni Görev Ekle</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Başlık</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Açıklama</label>
                  <textarea
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="form-label small text-muted">Son Tarih</label>
                  <input
                    type="date"
                    className="form-control border-0 bg-light py-2"
                    style={{ borderRadius: '12px' }}
                    value={newTodo.due_date}
                    onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-pro-max w-100 py-3 shadow-sm">
                  <i className="fas fa-plus-circle me-2"></i>Görev Kaydet
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card card-pro border-0 shadow-sm glass-pro-max overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom border-light">
              <h5 className="card-title mb-0">Görev Listesi</h5>
            </div>
            <div className="card-body p-0">
              {todos.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-tasks fs-1 mb-3 opacity-25"></i>
                  <p>Henüz yapılacak bir görev yok.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {todos.map(todo => (
                    <div
                      key={todo.id}
                      className="list-group-item bg-transparent px-4 py-3 d-flex justify-content-between align-items-center border-light transition-all"
                      style={{ opacity: todo.status === 'completed' ? 0.7 : 1 }}
                    >
                      <div className="d-flex align-items-center flex-grow-1">
                        <div className="form-check custom-checkbox">
                          <input
                            className="form-check-input border-2"
                            type="checkbox"
                            checked={todo.status === 'completed'}
                            onChange={() => toggleStatus(todo)}
                            id={`todo-${todo.id}`}
                            style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                          />
                        </div>
                        <div className="ms-3">
                          <label
                            className="form-check-label mb-0"
                            htmlFor={`todo-${todo.id}`}
                            style={{
                              textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                              cursor: 'pointer',
                              fontWeight: '600',
                              color: todo.status === 'completed' ? '#94a3b8' : '#1e293b'
                            }}
                          >
                            {todo.title}
                          </label>
                          {todo.description && (
                            <p className="small text-muted mb-0 mt-1">{todo.description}</p>
                          )}
                          {todo.due_date && (
                            <div className="small text-danger mt-1">
                              <i className="far fa-calendar-alt me-1"></i>
                              {new Date(todo.due_date).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="btn btn-link text-danger p-0 border-0 ms-3"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo; 