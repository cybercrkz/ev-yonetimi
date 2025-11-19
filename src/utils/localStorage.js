// localStorage yönetimi için yardımcı fonksiyonlar

// Kullanıcı verileri
export const getUsers = () => {
  const users = localStorage.getItem('ev_yonetimi_users');
  return users ? JSON.parse(users) : [];
};

export const saveUser = (email, password) => {
  const users = getUsers();
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    throw new Error('Bu e-posta adresi zaten kayıtlı');
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // Gerçek uygulamada şifre hash'lenmeli
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('ev_yonetimi_users', JSON.stringify(users));
  return newUser;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('E-posta veya şifre hatalı');
  }
  
  // Oturum bilgisini kaydet
  const session = {
    userId: user.id,
    email: user.email,
    loginTime: new Date().toISOString()
  };
  
  localStorage.setItem('ev_yonetimi_session', JSON.stringify(session));
  return { user: { id: user.id, email: user.email }, session };
};

export const getSession = () => {
  const session = localStorage.getItem('ev_yonetimi_session');
  return session ? JSON.parse(session) : null;
};

export const logoutUser = () => {
  localStorage.removeItem('ev_yonetimi_session');
};

// Faturalar
export const getBills = (userId) => {
  const key = `ev_yonetimi_bills_${userId}`;
  const bills = localStorage.getItem(key);
  return bills ? JSON.parse(bills) : [];
};

export const saveBill = (userId, bill) => {
  const key = `ev_yonetimi_bills_${userId}`;
  const bills = getBills(userId);
  
  const newBill = {
    id: Date.now().toString(),
    ...bill,
    createdAt: new Date().toISOString()
  };
  
  bills.push(newBill);
  localStorage.setItem(key, JSON.stringify(bills));
  return newBill;
};

export const updateBill = (userId, billId, updates) => {
  const key = `ev_yonetimi_bills_${userId}`;
  const bills = getBills(userId);
  const index = bills.findIndex(b => b.id === billId);
  
  if (index === -1) {
    throw new Error('Fatura bulunamadı');
  }
  
  bills[index] = { ...bills[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(bills));
  return bills[index];
};

export const deleteBill = (userId, billId) => {
  const key = `ev_yonetimi_bills_${userId}`;
  const bills = getBills(userId);
  const filtered = bills.filter(b => b.id !== billId);
  localStorage.setItem(key, JSON.stringify(filtered));
};

// Giderler
export const getExpenses = (userId) => {
  const key = `ev_yonetimi_expenses_${userId}`;
  const expenses = localStorage.getItem(key);
  return expenses ? JSON.parse(expenses) : [];
};

export const saveExpense = (userId, expense) => {
  const key = `ev_yonetimi_expenses_${userId}`;
  const expenses = getExpenses(userId);
  
  const newExpense = {
    id: Date.now().toString(),
    ...expense,
    createdAt: new Date().toISOString()
  };
  
  expenses.push(newExpense);
  localStorage.setItem(key, JSON.stringify(expenses));
  return newExpense;
};

export const updateExpense = (userId, expenseId, updates) => {
  const key = `ev_yonetimi_expenses_${userId}`;
  const expenses = getExpenses(userId);
  const index = expenses.findIndex(e => e.id === expenseId);
  
  if (index === -1) {
    throw new Error('Gider bulunamadı');
  }
  
  expenses[index] = { ...expenses[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(expenses));
  return expenses[index];
};

export const deleteExpense = (userId, expenseId) => {
  const key = `ev_yonetimi_expenses_${userId}`;
  const expenses = getExpenses(userId);
  const filtered = expenses.filter(e => e.id !== expenseId);
  localStorage.setItem(key, JSON.stringify(filtered));
};

// Yapılacaklar
export const getTodos = (userId) => {
  const key = `ev_yonetimi_todos_${userId}`;
  const todos = localStorage.getItem(key);
  return todos ? JSON.parse(todos) : [];
};

export const saveTodo = (userId, todo) => {
  const key = `ev_yonetimi_todos_${userId}`;
  const todos = getTodos(userId);
  
  const newTodo = {
    id: Date.now().toString(),
    ...todo,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  localStorage.setItem(key, JSON.stringify(todos));
  return newTodo;
};

export const updateTodo = (userId, todoId, updates) => {
  const key = `ev_yonetimi_todos_${userId}`;
  const todos = getTodos(userId);
  const index = todos.findIndex(t => t.id === todoId);
  
  if (index === -1) {
    throw new Error('Yapılacak bulunamadı');
  }
  
  todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(todos));
  return todos[index];
};

export const deleteTodo = (userId, todoId) => {
  const key = `ev_yonetimi_todos_${userId}`;
  const todos = getTodos(userId);
  const filtered = todos.filter(t => t.id !== todoId);
  localStorage.setItem(key, JSON.stringify(filtered));
};

// Alışveriş listesi
export const getShoppingItems = (userId) => {
  const key = `ev_yonetimi_shopping_${userId}`;
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
};

export const saveShoppingItem = (userId, item) => {
  const key = `ev_yonetimi_shopping_${userId}`;
  const items = getShoppingItems(userId);
  
  const newItem = {
    id: Date.now().toString(),
    ...item,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  localStorage.setItem(key, JSON.stringify(items));
  return newItem;
};

export const updateShoppingItem = (userId, itemId, updates) => {
  const key = `ev_yonetimi_shopping_${userId}`;
  const items = getShoppingItems(userId);
  const index = items.findIndex(i => i.id === itemId);
  
  if (index === -1) {
    throw new Error('Ürün bulunamadı');
  }
  
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(items));
  return items[index];
};

export const deleteShoppingItem = (userId, itemId) => {
  const key = `ev_yonetimi_shopping_${userId}`;
  const items = getShoppingItems(userId);
  const filtered = items.filter(i => i.id !== itemId);
  localStorage.setItem(key, JSON.stringify(filtered));
};

// Gelirler
export const getIncomes = (userId) => {
  const key = `ev_yonetimi_incomes_${userId}`;
  const incomes = localStorage.getItem(key);
  return incomes ? JSON.parse(incomes) : [];
};

export const saveIncome = (userId, income) => {
  const key = `ev_yonetimi_incomes_${userId}`;
  const incomes = getIncomes(userId);
  
  const newIncome = {
    id: Date.now().toString(),
    ...income,
    createdAt: new Date().toISOString()
  };
  
  incomes.push(newIncome);
  localStorage.setItem(key, JSON.stringify(incomes));
  return newIncome;
};

export const updateIncome = (userId, incomeId, updates) => {
  const key = `ev_yonetimi_incomes_${userId}`;
  const incomes = getIncomes(userId);
  const index = incomes.findIndex(i => i.id === incomeId);
  
  if (index === -1) {
    throw new Error('Gelir bulunamadı');
  }
  
  incomes[index] = { ...incomes[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(incomes));
  return incomes[index];
};

export const deleteIncome = (userId, incomeId) => {
  const key = `ev_yonetimi_incomes_${userId}`;
  const incomes = getIncomes(userId);
  const filtered = incomes.filter(i => i.id !== incomeId);
  localStorage.setItem(key, JSON.stringify(filtered));
};

