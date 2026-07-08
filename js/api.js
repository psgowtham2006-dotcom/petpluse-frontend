/**
 * PetPlus API Client
 * Covers all backend endpoints with JWT auth attached automatically.
 */
const API = (() => {
  const BASE = 'http://localhost:8080/api';

  /** Attach auth header if token exists */
  function headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const token = localStorage.getItem('petplus_token');
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  /** Generic fetch wrapper */
  async function request(method, path, body = null) {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) {
      const msg = data.message || data.error || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  function get(path)    { return request('GET', path); }
  function post(path,b) { return request('POST', path, b); }
  function put(path,b)  { return request('PUT', path, b); }
  function del(path)    { return request('DELETE', path); }

  // ===== AUTH =====
  const auth = {
    login:  (u, p)          => post('/auth/login',  { username: u, password: p }),
    register: (data)        => post('/auth/register', data),
    getUsers: ()            => get('/auth/users'),
    updateUser: (id, data)  => put(`/auth/users/${id}`, data),
    deleteUser: (id)        => del(`/auth/users/${id}`),
    getVets: ()             => get('/auth/vets'),
  };

  // ===== PETS =====
  const pets = {
    list:          ()        => get('/pets'),
    getById:       (id)      => get(`/pets/${id}`),
    create:        (data)    => post('/pets', data),
    update:        (id,data) => put(`/pets/${id}`, data),
    delete:        (id)      => del(`/pets/${id}`),
    forAdoption:   ()        => get('/pets/adoption'),
  };

  // ===== APPOINTMENTS =====
  const appointments = {
    list:       ()               => get('/appointments'),
    schedule:   (data)           => post('/appointments', data),
    updateStatus: (id, status)   => put(`/appointments/${id}?status=${encodeURIComponent(status)}`),
  };

  // ===== MEDICAL RECORDS =====
  const medicalRecords = {
    list:       ()          => get('/medical-records'),
    create:     (data)      => post('/medical-records', data),
    byPet:      (petId)     => get(`/medical-records/pet/${petId}`),
    approve:    (id)        => put(`/medical-records/${id}/approve`),
  };

  // ===== ADOPTIONS =====
  const adoptions = {
    list:       ()               => get('/adoptions'),
    create:     (data)           => post('/adoptions', data),
    updateStatus: (id, status)   => put(`/adoptions/${id}?status=${encodeURIComponent(status)}`),
  };

  // ===== VACCINATIONS =====
  const vaccinations = {
    list:       ()          => get('/vaccinations'),
    create:     (data)      => post('/vaccinations', data),
    update:     (id, data)  => put(`/vaccinations/${id}`, data),
    delete:     (id)        => del(`/vaccinations/${id}`),
    reminders:  ()          => get('/vaccinations/reminders'),
  };

  return { auth, pets, appointments, medicalRecords, adoptions, vaccinations };
})();
