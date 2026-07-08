/**
 * PetPlus Authentication Module
 * Manages JWT token storage, user session, login, register, and logout.
 */
const Auth = (() => {
  const TOKEN_KEY = 'petplus_token';
  const USER_KEY  = 'petplus_user';

  /** Store auth data after login */
  function saveSession(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: data.id,
      username: data.username,
      role: data.role,
    }));
  }

  /** Clear auth data */
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /** Get current user object (parsed) */
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch { return null; }
  }

  /** Get current user's ID */
  function getUserId() {
    const u = getUser();
    return u ? u.id : null;
  }

  /** Get raw JWT token */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Check if user is authenticated */
  function isAuthenticated() {
    return !!getToken() && !!getUser();
  }

  /** Get the user's role (e.g. 'ROLE_ADMIN') */
  function getRole() {
    const u = getUser();
    return u ? u.role : null;
  }

  /** Display-friendly role name */
  function roleDisplay(role) {
    if (!role) return '';
    return role.replace('ROLE_', '').charAt(0) + role.replace('ROLE_', '').slice(1).toLowerCase();
  }

  /** CSS class for role badge */
  function roleBadgeClass(role) {
    if (!role) return '';
    return 'role-' + role.replace('ROLE_', '').toLowerCase();
  }

  /** Check if user has a specific role */
  function hasRole(role) { return getRole() === role; }
  function isAdmin()    { return hasRole('ROLE_ADMIN'); }
  function isOwner()    { return hasRole('ROLE_OWNER'); }
  function isVet()      { return hasRole('ROLE_VET'); }
  function isShelter()  { return hasRole('ROLE_SHELTER'); }

  /** Login — calls API, saves session, returns user data */
  async function login(username, password) {
    const data = await API.auth.login(username, password);
    saveSession(data);
    return data;
  }

  /** Register — calls API */
  async function register(formData) {
    return await API.auth.register(formData);
  }

  /** Logout — clears session and redirects */
  function logout() {
    clearSession();
    App.renderPage('login');
  }

  return {
    getUser, getUserId, getToken, getRole, isAuthenticated,
    isAdmin, isOwner, isVet, isShelter, hasRole,
    roleDisplay, roleBadgeClass,
    login, register, logout,
  };
})();
