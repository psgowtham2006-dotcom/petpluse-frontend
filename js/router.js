/**
 * PetPlus SPA Router
 * Hash-based routing with role-based access control.
 */
const Router = (() => {
  /** Route definitions — only login & register are public */
  const routes = {
    '':           { page: 'home',     label: 'Home',        public: false },
    'home':       { page: 'home',     label: 'Home',        public: false },
    'login':      { page: 'login',    label: 'Login',       public: true },
    'register':   { page: 'register', label: 'Register',    public: true },
    'dashboard':  { page: 'dashboard',label: 'Dashboard',   public: false },
    'pets':       { page: 'pets',     label: 'Pets',        public: false },
    'pets/adoption': { page: 'pets-adoption', label: 'Adoption Pets', public: false },
    'appointments':  { page: 'appointments',  label: 'Appointments',  public: false },
    'medical-records': { page: 'medical-records', label: 'Medical Records', public: false },
    'adoptions':  { page: 'adoptions', label: 'Adoptions',  public: false },
    'vaccinations': { page: 'vaccinations', label: 'Vaccinations', public: false },
    'users':      { page: 'users',    label: 'Users',       public: false },
    'vets':       { page: 'vets',     label: 'Veterinarians', public: false },
  };

  /** Get the current hash (without #) */
  function getHash() {
    const hash = window.location.hash.replace(/^#\/*/, '');
    return hash || 'home';
  }

  /** Resolve route config for given hash */
  function resolveRoute(hash) {
    // exact match first
    if (routes[hash]) return routes[hash];
    return null;
  }

  /** Navigate to a given page (hash) */
  function navigate(page) {
    window.location.hash = page;
  }

  /** Handle hash change event */
  function onHashChange() {
    const hash = getHash();
    const route = resolveRoute(hash);

    if (!route) {
      navigate('home');
      return;
    }

    const authenticated = Auth.isAuthenticated();

    // Check auth requirement
    if (!route.public && !authenticated) {
      navigate('login');
      return;
    }

    // Redirect authenticated users away from login, register, and landing home to dashboard
    if (authenticated && (route.page === 'login' || route.page === 'register' || route.page === 'home')) {
      navigate('dashboard');
      return;
    }

    // Render the page
    App.renderPage(route.page);
    App.updateSidebar(route.page);
  }

  /** Initialize the router */
  function init() {
    window.addEventListener('hashchange', onHashChange);
    // Initial load
    onHashChange();
  }

  return { init, navigate, getHash };
})();
