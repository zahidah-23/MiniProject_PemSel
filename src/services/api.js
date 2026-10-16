import { getItem, setItem } from './idb';

const delay = ms => new Promise(r => setTimeout(r, ms));

function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const words1 = text1.toLowerCase().split(' ');
  const words2 = text2.toLowerCase().split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

// Simulasi Backend menggunakan IndexedDB
const api = {
  get: async (url) => {
    await delay(200);
    const users = JSON.parse(await getItem('db_users') || '[]');
    const reports = JSON.parse(await getItem('db_reports') || '[]');

    if (url === '/reports') {
      return { data: reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
    }

    if (url.startsWith('/reports/user/')) {
      const userId = parseInt(url.split('/').pop());
      return { data: reports.filter(r => r.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
    }

    if (url.startsWith('/matches/find/')) {
      const reportId = parseInt(url.split('/').pop());
      const currentReport = reports.find(r => r.id === reportId);
      if (!currentReport) throw { response: { data: { error: 'Laporan tidak ditemukan' } } };

      const oppositeType = currentReport.type === 'lost' ? 'found' : 'lost';
      const matches = reports
        .filter(r => r.type === oppositeType && r.status === 'pending')
        .map(row => {
           const u = users.find(user => user.id === row.user_id) || {};
           return {
             ...row,
             match_score: calculateSimilarity(currentReport.description, row.description),
             contact_name: u.username || 'Anonim',
             contact_phone: u.phone || '-',
             contact_email: u.email || '-'
           };
        })
        .filter(match => match.match_score >= 0.3)
        .sort((a, b) => b.match_score - a.match_score);
      return { data: matches };
    }

    if (url.startsWith('/reports/')) {
      const id = parseInt(url.split('/').pop());
      const r = reports.find(r => r.id === id);
      if (r) return { data: r };
      throw { response: { data: { message: 'Laporan tidak ditemukan' } } };
    }
  },

  post: async (url, data) => {
    await delay(300);
    if (url === '/auth/login') {
      const users = JSON.parse(await getItem('db_users') || '[]');
      const user = users.find(u => u.email === data.email && u.password === data.password);
      if (user) {
        return { data: { user: { id: user.id, username: user.username, email: user.email, phone: user.phone }, token: 'token-' + user.id } };
      }
      throw { response: { data: { message: 'Email atau password salah' } } };
    }

    if (url === '/auth/register') {
      const users = JSON.parse(await getItem('db_users') || '[]');
      if (!data.username || !data.email || !data.password || !data.phone) {
        throw { response: { data: { message: 'Semua field, termasuk Nomor HP, wajib diisi!' } } };
      }
      if (users.find(u => u.email === data.email)) {
        throw { response: { data: { error: 'Email sudah terdaftar' } } };
      }
      if (users.find(u => u.phone === data.phone)) {
        throw { response: { data: { error: 'Nomor HP ini sudah digunakan untuk mendaftar' } } };
      }
      const newUser = { id: Date.now(), ...data };
      users.push(newUser);
      await setItem('db_users', JSON.stringify(users));
      return { data: { id: newUser.id, username: newUser.username, email: newUser.email, phone: newUser.phone } };
    }

    if (url === '/reports') {
      const reports = JSON.parse(await getItem('db_reports') || '[]');
      const newReport = { id: Date.now(), user_id: data.user_id || 1, type: data.type, name: data.name, location: data.location, description: data.description, status: 'pending', created_at: new Date().toISOString() };
      reports.push(newReport);
      await setItem('db_reports', JSON.stringify(reports));
      return { data: newReport };
    }
  },

  put: async (url, data) => {
    await delay(300);
    if (url.startsWith('/reports/')) {
      const id = parseInt(url.split('/').pop());
      const reports = JSON.parse(await getItem('db_reports') || '[]');
      const idx = reports.findIndex(r => r.id === id);
      if (idx !== -1) {
        reports[idx] = { ...reports[idx], ...data };
        await setItem('db_reports', JSON.stringify(reports));
        return { data: { message: 'Laporan berhasil diupdate', id } };
      }
      throw { response: { data: { message: 'Laporan tidak ditemukan' } } };
    }
  },

  delete: async (url) => {
    await delay(300);
    if (url.startsWith('/reports/')) {
      const id = parseInt(url.split('/').pop());
      let reports = JSON.parse(await getItem('db_reports') || '[]');
      reports = reports.filter(r => r.id !== id);
      await setItem('db_reports', JSON.stringify(reports));
      return { data: { message: 'Laporan berhasil dihapus' } };
    }
  },

  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

export default api;