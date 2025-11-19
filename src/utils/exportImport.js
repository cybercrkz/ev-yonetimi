// Veri İçe/Dışa Aktarma Yardımcıları

/**
 * Kullanıcının tüm verilerini dışa aktarır
 */
export const exportUserData = (userId) => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userId: userId,
    bills: localStorage.getItem(`ev_yonetimi_bills_${userId}`),
    expenses: localStorage.getItem(`ev_yonetimi_expenses_${userId}`),
    todos: localStorage.getItem(`ev_yonetimi_todos_${userId}`),
    shopping: localStorage.getItem(`ev_yonetimi_shopping_${userId}`)
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ev-yonetimi-yedek-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Dışa aktarılan veriyi içe aktarır
 */
export const importUserData = (file, userId) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Versiyon kontrolü
        if (!data.version) {
          reject(new Error('Geçersiz yedek dosyası formatı'));
          return;
        }

        // Verileri localStorage'a yaz
        if (data.bills) {
          localStorage.setItem(`ev_yonetimi_bills_${userId}`, data.bills);
        }
        if (data.expenses) {
          localStorage.setItem(`ev_yonetimi_expenses_${userId}`, data.expenses);
        }
        if (data.todos) {
          localStorage.setItem(`ev_yonetimi_todos_${userId}`, data.todos);
        }
        if (data.shopping) {
          localStorage.setItem(`ev_yonetimi_shopping_${userId}`, data.shopping);
        }

        resolve({
          success: true,
          exportDate: data.exportDate,
          itemCount: {
            bills: data.bills ? JSON.parse(data.bills).length : 0,
            expenses: data.expenses ? JSON.parse(data.expenses).length : 0,
            todos: data.todos ? JSON.parse(data.todos).length : 0,
            shopping: data.shopping ? JSON.parse(data.shopping).length : 0
          }
        });
      } catch (error) {
        reject(new Error('Dosya okunamadı veya geçersiz format'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okuma hatası'));
    };

    reader.readAsText(file);
  });
};

/**
 * Tüm kullanıcı verilerini temizler
 */
export const clearAllUserData = (userId) => {
  localStorage.removeItem(`ev_yonetimi_bills_${userId}`);
  localStorage.removeItem(`ev_yonetimi_expenses_${userId}`);
  localStorage.removeItem(`ev_yonetimi_todos_${userId}`);
  localStorage.removeItem(`ev_yonetimi_shopping_${userId}`);
};

/**
 * Kullanıcı verilerinin istatistiklerini döndürür
 */
export const getUserDataStats = (userId) => {
  const bills = localStorage.getItem(`ev_yonetimi_bills_${userId}`);
  const expenses = localStorage.getItem(`ev_yonetimi_expenses_${userId}`);
  const todos = localStorage.getItem(`ev_yonetimi_todos_${userId}`);
  const shopping = localStorage.getItem(`ev_yonetimi_shopping_${userId}`);

  return {
    bills: bills ? JSON.parse(bills).length : 0,
    expenses: expenses ? JSON.parse(expenses).length : 0,
    todos: todos ? JSON.parse(todos).length : 0,
    shopping: shopping ? JSON.parse(shopping).length : 0,
    total: 
      (bills ? JSON.parse(bills).length : 0) +
      (expenses ? JSON.parse(expenses).length : 0) +
      (todos ? JSON.parse(todos).length : 0) +
      (shopping ? JSON.parse(shopping).length : 0)
  };
};

