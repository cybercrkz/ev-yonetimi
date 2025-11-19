import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

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
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
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
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            user_id: user.id,
            title: newTodo.title,
            description: newTodo.description,
            due_date: newTodo.due_date || null,
            status: 'pending'
          }
        ])
        .select();

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
      const { error } = await supabase
        .from('todos')
        .update({ status: newStatus })
        .eq('id', todo.id);

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
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

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
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Yeni Yapılacak Ekle</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Başlık</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Açıklama</label>
                  <textarea
                    className="form-control"
                    id="description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    rows="3"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="due_date" className="form-label">Son Tarih</label>
                  <input
                    type="date"
                    className="form-control"
                    id="due_date"
                    value={newTodo.due_date}
                    onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                  />
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
              <h5 className="card-title mb-4">Yapılacaklar Listesi</h5>
              {todos.length === 0 ? (
                <p className="text-muted text-center">Henüz yapılacak bir şey yok.</p>
              ) : (
                <div className="list-group">
                  {todos.map(todo => (
                    <div
                      key={todo.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div className="form-check flex-grow-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={todo.status === 'completed'}
                          onChange={() => toggleStatus(todo)}
                          id={`todo-${todo.id}`}
                        />
                        <label
                          className="form-check-label ms-2"
                          htmlFor={`todo-${todo.id}`}
                          style={{
                            textDecoration: todo.status === 'completed' ? 'line-through' : 'none'
                          }}
                        >
                          <div className="fw-bold">{todo.title}</div>
                          {todo.description && (
                            <small className="text-muted d-block">{todo.description}</small>
                          )}
                          {todo.due_date && (
                            <small className="text-danger d-block">
                              <i className="fas fa-calendar-alt me-1"></i>
                              Son Tarih: {new Date(todo.due_date).toLocaleDateString('tr-TR')}
                            </small>
                          )}
                        </label>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <i className="fas fa-trash"></i>
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