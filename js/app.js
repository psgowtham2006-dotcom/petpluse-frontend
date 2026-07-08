/**
 * PetPlus Application — Redesigned Main Logic
 * - Auth pages have NO sidebar (full-screen glass card)
 * - Strict role-based UI: every page checks role before rendering
 * - Role routing: Vet → appointments/medical/vaccinations only
 *                 Owner → pets/appointments/adoptions
 *                 Shelter → shelter pets/adoptions
 *                 Admin → everything
 * - Premium visual components throughout
 */
const App = (() => {

  function postRender() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconName = 'info';
    if (type === 'success') iconName = 'circle-check';
    if (type === 'error') iconName = 'circle-alert';
    if (type === 'warning') iconName = 'triangle-alert';
    toast.innerHTML = `<span class="toast-icon"><i data-lucide="${iconName}"></i></span><span>${message}</span>`;
    container.appendChild(toast);
    postRender();
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(24px)';
      toast.style.transition = 'opacity .3s, transform .3s';
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  // ============================================================
  //  MODAL
  // ============================================================
  function openModal(html) {
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    postRender();
    requestAnimationFrame(() => overlay.classList.add('open'));

    // Focus trap — focus first input
    const firstInput = overlay.querySelector('input, select, textarea, button');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);

    // Escape key handler
    if (!overlay._keyHandler) {
      overlay._keyHandler = (e) => { if (e.key === 'Escape') closeModal(); };
      document.addEventListener('keydown', overlay._keyHandler);
    }
  }

  function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      if (overlay._keyHandler) {
        document.removeEventListener('keydown', overlay._keyHandler);
        delete overlay._keyHandler;
      }
      setTimeout(() => overlay.remove(), 200);
    }
  }

  // ============================================================
  //  LAYOUT: AUTH vs APP
  //  Auth pages (login, register, home-public) → no sidebar,
  //  full dark background
  // ============================================================
  const AUTH_PAGES = new Set(['login', 'register']);

  function applyLayout(pageName) {
    const authed = Auth.isAuthenticated();
    const isAuthPage = AUTH_PAGES.has(pageName);

    if (isAuthPage || !authed) {
      if (isAuthPage) {
        document.body.classList.add('auth-layout');
        document.body.classList.remove('sidebar-open');
      } else {
        // public pages (home, pets/adoption, vets) keep sidebar but no auth
        document.body.classList.remove('auth-layout');
      }
    } else {
      document.body.classList.remove('auth-layout');
    }
  }

  // ============================================================
  //  SIDEBAR
  // ============================================================
  function updateSidebar(activePage) {
    const nav = document.getElementById('sidebarNav');
    const badge = document.getElementById('userBadge');
    const logoutBtn = document.getElementById('logoutBtn');
    const authed = Auth.isAuthenticated();

    let html = '';

    if (!authed) {
      html += navSection('General');
      html += navLink('home', 'home', 'Home', activePage);
      html += navLink('pets/adoption', 'paw-print', 'Adoption Pets', activePage);
      html += navLink('vets', 'stethoscope', 'Veterinarians', activePage);
      html += navSection('Account');
      html += navLink('login', 'log-in', 'Sign In', activePage);
      html += navLink('register', 'user-plus', 'Register', activePage);
    } else {
      const role = Auth.getRole();

      html += navSection('Navigation');

      if (role === 'ROLE_ADMIN') {
        html += navLink('dashboard', 'layout-dashboard', 'Dashboard', activePage);
        html += navSection('Management');
        html += navLink('pets', 'dog', 'All Pets', activePage);
        html += navLink('appointments', 'calendar', 'Appointments', activePage);
        html += navLink('medical-records', 'clipboard-list', 'Medical Records', activePage);
        html += navLink('adoptions', 'file-signature', 'Adoptions', activePage);
        html += navLink('vaccinations', 'syringe', 'Vaccinations', activePage);
        html += navSection('Administration');
        html += navLink('users', 'users', 'Users', activePage);
        html += navLink('vets', 'stethoscope', 'Veterinarians', activePage);

      } else if (role === 'ROLE_OWNER') {
        html += navLink('dashboard', 'layout-dashboard', 'My Dashboard', activePage);
        html += navSection('My Pets');
        html += navLink('pets', 'dog', 'My Pets', activePage);
        html += navLink('pets/adoption', 'paw-print', 'Adopt a Pet', activePage);
        html += navSection('Services');
        html += navLink('appointments', 'calendar', 'My Appointments', activePage);
        html += navLink('adoptions', 'file-signature', 'My Requests', activePage);
        html += navLink('vaccinations', 'syringe', 'Vaccinations', activePage);

      } else if (role === 'ROLE_VET') {
        html += navLink('dashboard', 'layout-dashboard', 'Dashboard', activePage);
        html += navSection('Clinical');
        html += navLink('appointments', 'calendar', 'Appointments', activePage);
        html += navLink('medical-records', 'clipboard-list', 'Medical Records', activePage);
        html += navLink('vaccinations', 'syringe', 'Vaccinations', activePage);

      } else if (role === 'ROLE_SHELTER') {
        html += navLink('dashboard', 'layout-dashboard', 'Dashboard', activePage);
        html += navSection('Shelter');
        html += navLink('pets', 'dog', 'Shelter Pets', activePage);
        html += navLink('pets/adoption', 'paw-print', 'Adoption Board', activePage);
        html += navLink('adoptions', 'file-signature', 'Adoption Requests', activePage);
      }
    }

    nav.innerHTML = html;

    // Footer
    if (authed) {
      const u = Auth.getUser();
      badge.style.display = 'flex';
      document.getElementById('userAvatar').textContent = (u.username || 'U')[0].toUpperCase();
      document.getElementById('userName').textContent = u.username;
      document.getElementById('userRole').textContent = Auth.roleDisplay(u.role);
      logoutBtn.style.display = 'block';
    } else {
      badge.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
    postRender();
  }

  function navLink(page, icon, label, activePage) {
    const href = page === 'home' ? '#/' : `#/${page}`;
    const isActive = (activePage === page) || (page === 'home' && !activePage) ? ' active' : '';
    return `<a href="${href}" class="${isActive}"><span class="nav-icon"><i data-lucide="${icon}"></i></span>${label}</a>`;
  }

  function navSection(label) {
    return `<div class="nav-section"><span class="nav-label">${label}</span></div>`;
  }

  // ============================================================
  //  PAGE RENDERER DISPATCH
  // ============================================================
  function renderPage(pageName) {
    const body = document.getElementById('pageBody');
    const title = document.getElementById('pageTitle');

    applyLayout(pageName);
    updateSidebar(pageName);

    const pageTitles = {
      home: 'Home',
      login: 'Sign In',
      register: 'Create Account',
      dashboard: 'Dashboard',
      pets: 'Pets',
      'pets-adoption': 'Adoption Pets',
      appointments: 'Appointments',
      'medical-records': 'Medical Records',
      adoptions: 'Adoptions',
      vaccinations: 'Vaccinations',
      users: 'Users',
      vets: 'Veterinarians',
    };

    // Role-specific overrides
    const role = Auth.getRole();
    if (role === 'ROLE_OWNER') {
      pageTitles.pets = 'My Pets';
      pageTitles.appointments = 'My Appointments';
      pageTitles.adoptions = 'My Requests';
    } else if (role === 'ROLE_SHELTER') {
      pageTitles.pets = 'Shelter Pets';
    }

    const titleIcons = {
      home: 'home', login: 'key-round', register: 'user-plus', dashboard: 'layout-dashboard',
      pets: 'dog', 'pets-adoption': 'paw-print', appointments: 'calendar',
      'medical-records': 'heart-pulse', adoptions: 'file-signature',
      vaccinations: 'syringe', users: 'users', vets: 'stethoscope'
    };
    const tIcon = titleIcons[pageName] || 'paw-print';
    const pageTitle = pageTitles[pageName] || 'PetPlus';

    if (title) {
      title.innerHTML = `<i data-lucide="${tIcon}" style="margin-right:.5rem;vertical-align:middle;color:var(--brand)"></i><span style="vertical-align:middle">${pageTitle}</span>`;
    }

    // Dynamic document title
    document.title = `${pageTitle} — PetPlus`;

    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      document.body.classList.remove('sidebar-open');
    }

    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show skeleton loading while content loads
    body.innerHTML = renderSkeleton(pageName);

    const pageMap = {
      home: renderHome,
      login: renderLogin,
      register: renderRegister,
      dashboard: renderDashboard,
      pets: renderPets,
      'pets-adoption': renderPetsAdoption,
      appointments: renderAppointments,
      'medical-records': renderMedicalRecords,
      adoptions: renderAdoptions,
      vaccinations: renderVaccinations,
      users: renderUsers,
      vets: renderVets,
    };

    Promise.resolve((pageMap[pageName] || renderHome)(body)).then(() => {
      postRender();
    });
  }

  // Deny access guard for role-restricted pages
  function accessDenied(body, message = 'You do not have permission to view this page.') {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i data-lucide="lock"></i></div>
        <h3>Access Denied</h3>
        <p>${message}</p>
      </div>
    `;
  }

  // ============================================================
  //  PAGE — HOME
  // ============================================================
  async function renderHome(body) {
    try {
      const [pets, vets] = await Promise.all([
        API.pets.forAdoption().catch(() => []),
        API.auth.getVets().catch(() => []),
      ]);
      const authed = Auth.isAuthenticated();

      body.innerHTML = `
        <div class="hero-section fade-up">
          <div style="margin-bottom:1rem;color:var(--brand)"><i data-lucide="paw-print" style="width: 48px; height: 48px;"></i></div>
          <h1>Welcome to PetPlus</h1>
          ${!authed ? `
          <div class="hero-actions">
            <a href="#/login"    class="btn btn-primary btn-lg"><i data-lucide="log-in"></i><span>Sign In</span></a>
            <a href="#/register" class="btn btn-outline btn-lg"><i data-lucide="user-plus"></i><span>Register</span></a>
          </div>` : ''}
        </div>

        <div class="page-bar fade-up-2">
          <h2>Pets Available for Adoption</h2>
          ${authed && Auth.isOwner() ? '<button class="btn btn-primary btn-sm" onclick="App.showAdoptionForm()"><i data-lucide="file-signature"></i><span>Submit Request</span></button>' : ''}
        </div>

        ${pets.length === 0
          ? emptyState('paw-print', 'No pets available for adoption right now.')
          : `<div class="pet-grid fade-up-2">${pets.map(p => petCardHtml(p)).join('')}</div>`
        }

        <div class="page-bar mt-3 fade-up-3">
          <h2>Our Veterinarians</h2>
        </div>
        ${vets.length === 0
          ? emptyState('stethoscope', 'No veterinarians listed yet.')
          : `<div class="grid-2 fade-up-3">${vets.map(v => `
              <div class="vet-card">
                <div class="vet-avatar"><i data-lucide="stethoscope"></i></div>
                <div class="vet-info">
                  <h4>${esc(v.fullName)}</h4>
                  <p>${esc(v.email)}${v.phone ? ` · ${esc(v.phone)}` : ''}</p>
                </div>
              </div>`).join('')}</div>`
        }
      `;
    } catch (e) {
      body.innerHTML = emptyState('alert-circle', 'Could not load content. Check your connection.');
    }
  }

  // ============================================================
  //  PAGE — LOGIN
  // ============================================================
  function renderLogin(body) {
    body.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-logo">
          <div class="auth-logo-icon"><i data-lucide="paw-print" style="width: 24px; height: 24px; color:#fff"></i></div>
          <div class="auth-logo-text">PetPlus</div>
        </div>
        <div class="auth-card">
          <h2>Welcome back</h2>
          <p class="subtitle">Sign in to your PetPlus account</p>

          <form id="loginForm">
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" id="loginUsername" placeholder="Enter username" required autocomplete="username">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" id="loginPassword" placeholder="Enter password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary w-full btn-lg" id="loginBtn">Sign In</button>
          </form>
          <div class="auth-link">Don't have an account? <a href="#/register">Register here</a></div>
        </div>
      </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        const data = await Auth.login(
          document.getElementById('loginUsername').value,
          document.getElementById('loginPassword').value
        );
        showToast(`Welcome back, ${data.username}!`);
        Router.navigate('dashboard');
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    });
  }

  // ============================================================
  //  PAGE — REGISTER
  // ============================================================
  function renderRegister(body) {
    body.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-logo">
          <div class="auth-logo-icon"><i data-lucide="paw-print" style="width: 24px; height: 24px; color:#fff"></i></div>
          <div class="auth-logo-text">PetPlus</div>
        </div>
        <div class="auth-card">
          <h2>Create your account</h2>
          <p class="subtitle">Join the PetPlus community today</p>
          <form id="registerForm">
            <div class="form-row">
              <div class="form-group">
                <label>Username</label>
                <input type="text" class="form-control" id="regUsername" placeholder="Username" required>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" class="form-control" id="regPassword" placeholder="Min 6 chars" required minlength="6">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" class="form-control" id="regFullName" placeholder="Your full name" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control" id="regEmail" placeholder="you@email.com" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone <span style="opacity:.5">(optional)</span></label>
                <input type="tel" class="form-control" id="regPhone" placeholder="Phone number">
              </div>
              <div class="form-group">
                <label>I am a…</label>
                <select class="form-control" id="regRole" required>
                  <option value="">Select role…</option>
                  <option value="ROLE_OWNER">Pet Owner</option>
                  <option value="ROLE_VET">Veterinarian</option>
                  <option value="ROLE_SHELTER">Shelter Staff</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-full btn-lg" id="registerBtn">Create Account</button>
          </form>
          <div class="auth-link">Already have an account? <a href="#/login">Sign in</a></div>
        </div>
      </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerBtn');
      btn.disabled = true; btn.textContent = 'Creating…';
      try {
        await Auth.register({
          username: document.getElementById('regUsername').value,
          password: document.getElementById('regPassword').value,
          fullName: document.getElementById('regFullName').value,
          email: document.getElementById('regEmail').value,
          phone: document.getElementById('regPhone').value,
          role: document.getElementById('regRole').value,
        });
        showToast('Account created! Please sign in.');
        Router.navigate('login');
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    });
  }

  // ============================================================
  //  PAGE — DASHBOARD  (role-dispatched)
  // ============================================================
  async function renderDashboard(body) {
    const role = Auth.getRole();
    const u = Auth.getUser();
    if (role === 'ROLE_ADMIN') return renderAdminDashboard(body, u);
    if (role === 'ROLE_OWNER') return renderOwnerDashboard(body, u);
    if (role === 'ROLE_VET') return renderVetDashboard(body, u);
    if (role === 'ROLE_SHELTER') return renderShelterDashboard(body, u);
    body.innerHTML = emptyState('smile', 'Welcome to PetPlus!');
  }

  async function renderAdminDashboard(body, u) {
    try {
      const [pets, appointments, adoptions, records, vaccinations, users, reminders] = await Promise.all([
        API.pets.list().catch(() => []),
        API.appointments.list().catch(() => []),
        API.adoptions.list().catch(() => []),
        API.medicalRecords.list().catch(() => []),
        API.vaccinations.list().catch(() => []),
        API.auth.getUsers().catch(() => []),
        API.vaccinations.reminders().catch(() => []),
      ]);

      const pendingAdoptions = adoptions.filter(a => a.status === 'PENDING');
      const pendingRecords = records.filter(r => r.status !== 'APPROVED');
      const todayAppts = appointments.filter(a => {
        try { return new Date(a.appointmentDate).toDateString() === new Date().toDateString(); }
        catch { return false; }
      });

      body.innerHTML = `
        <div class="dash-welcome fade-up">
          <div class="dash-welcome-text">
            <h2>Admin Dashboard</h2>
            <p>Full system oversight &nbsp;·&nbsp; ${esc(u.username)}</p>
          </div>
          <div class="dash-welcome-badge">ROLE_ADMIN</div>
        </div>

        <div class="stats-grid fade-up-2">
          ${statCard('dog', 'Total Pets', pets.length, '', 'Registered in system')}
          ${statCard('calendar', "Today's Appointments", todayAppts.length, 'stat-green', '')}
          ${statCard('file-signature', 'Pending Adoptions', pendingAdoptions.length, 'stat-yellow', '')}
          ${statCard('syringe', 'Vaccine Reminders', reminders.length, 'stat-red', 'Due within 7 days')}
          ${statCard('users', 'Total Users', users.length, 'stat-blue', '')}
          ${statCard('heart-pulse', 'Pending Records', pendingRecords.length, 'stat-yellow', '')}
        </div>

        <div class="grid-2 fade-up-3">
          <div class="card">
            <div class="card-header"><h3>Pending Adoptions</h3><a href="#/adoptions" class="text-sm">View all →</a></div>
            ${pendingAdoptions.length === 0
          ? '<p class="text-sm">No pending adoption requests.</p>'
          : pendingAdoptions.slice(0, 5).map(a => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(a.applicant?.fullName || '?')}</span>
                      <span class="quick-item-sub">wants ${esc(a.pet?.petName || '?')} · ${a.requestDate || ''}</span>
                    </div>
                    <div class="btn-group">
                      <button class="action-btn approve" onclick="App.updateAdoptionStatus(${a.id},'APPROVED')">Approve</button>
                      <button class="action-btn delete"  onclick="App.updateAdoptionStatus(${a.id},'REJECTED')"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
                    </div>
                  </div>`).join('')
        }
          </div>
          <div class="card">
            <div class="card-header"><h3>Pending Medical Records</h3><a href="#/medical-records" class="text-sm">View all →</a></div>
            ${pendingRecords.length === 0
          ? '<p class="text-sm">All records approved</p>'
          : pendingRecords.slice(0, 5).map(r => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(r.diagnosis)}</span>
                      <span class="quick-item-sub">for ${esc(r.pet?.petName || '?')} · ${r.visitDate || ''}</span>
                    </div>
                    <button class="action-btn approve" onclick="App.approveMedicalRecord(${r.id})">Approve</button>
                  </div>`).join('')
        }
          </div>
        </div>

        <div class="action-cards fade-up-3">
          <div class="action-card" onclick="Router.navigate('pets')"><span class="action-icon"><i data-lucide="dog"></i></span><div class="action-title">Manage Pets</div></div>
          <div class="action-card" onclick="Router.navigate('users')"><span class="action-icon"><i data-lucide="users"></i></span><div class="action-title">Manage Users</div></div>
          <div class="action-card" onclick="Router.navigate('appointments')"><span class="action-icon"><i data-lucide="calendar"></i></span><div class="action-title">Appointments</div></div>
          <div class="action-card" onclick="Router.navigate('adoptions')"><span class="action-icon"><i data-lucide="file-signature"></i></span><div class="action-title">Adoptions</div></div>
          <div class="action-card" onclick="Router.navigate('vaccinations')"><span class="action-icon"><i data-lucide="syringe"></i></span><div class="action-title">Vaccinations</div></div>
          <div class="action-card" onclick="Router.navigate('medical-records')"><span class="action-icon"><i data-lucide="heart-pulse"></i></span><div class="action-title">Medical Records</div></div>
        </div>
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Could not load dashboard.'); }
  }

  async function renderOwnerDashboard(body, u) {
    try {
      const [allPets, allAppts, allAdoptions] = await Promise.all([
        API.pets.list().catch(() => []),
        API.appointments.list().catch(() => []),
        API.adoptions.list().catch(() => []),
      ]);
      const myPets = allPets.filter(p => p.owner?.id === u.id);
      const myAppts = allAppts.filter(a => a.pet?.owner?.id === u.id);
      const myAdopts = allAdoptions.filter(a => a.applicant?.id === u.id);
      const upcoming = myAppts.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');

      body.innerHTML = `
        <div class="dash-welcome fade-up">
          <div class="dash-welcome-text">
            <h2>Welcome, ${esc(u.fullName || u.username)}</h2>
            <p>Pet Owner Dashboard</p>
          </div>
          <div class="dash-welcome-badge">ROLE_OWNER</div>
        </div>

        <div class="stats-grid fade-up-2">
          ${statCard('dog', 'My Pets', myPets.length, '', '')}
          ${statCard('calendar', 'Upcoming Appointments', upcoming.length, 'stat-green', '')}
          ${statCard('file-signature', 'Adoption Requests', myAdopts.length, 'stat-yellow', '')}
        </div>

        <div class="grid-2 fade-up-3">
          <div class="card">
            <div class="card-header"><h3>My Pets</h3><a href="#/pets" class="text-sm">View all →</a></div>
            ${myPets.length === 0
          ? `<p class="text-sm">No pets registered yet.</p><button class="btn btn-primary btn-sm mt-2" onclick="App.showPetForm()">+ Register a Pet</button>`
          : myPets.slice(0, 4).map(p => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(p.petName)}</span>
                      <span class="quick-item-sub">${esc(p.species)}${p.breed ? ` · ${esc(p.breed)}` : ''} · ${p.age} yr${p.age !== 1 ? 's' : ''}</span>
                    </div>
                    ${p.availableForAdoption ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-gray">Owner</span>'}
                  </div>`).join('')
        }
          </div>
          <div class="card">
            <div class="card-header"><h3>Upcoming Appointments</h3><a href="#/appointments" class="text-sm">View all →</a></div>
            ${upcoming.length === 0
          ? `<p class="text-sm">No upcoming appointments.</p><button class="btn btn-primary btn-sm mt-2" onclick="App.showAppointmentForm()">+ Schedule</button>`
          : upcoming.slice(0, 4).map(a => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(a.pet?.petName || '?')}</span>
                      <span class="quick-item-sub">Dr. ${esc(a.veterinarian?.fullName || '?')} · ${formatDateTime(a.appointmentDate)}</span>
                    </div>
                    ${statusBadge(a.status)}
                  </div>`).join('')
        }
          </div>
        </div>

        <div class="action-cards fade-up-3">
          <div class="action-card" onclick="App.showPetForm()"><span class="action-icon"><i data-lucide="dog"></i></span><div class="action-title">Register a Pet</div></div>
          <div class="action-card" onclick="App.showAppointmentForm()"><span class="action-icon"><i data-lucide="calendar"></i></span><div class="action-title">Book Appointment</div></div>
          <div class="action-card" onclick="Router.navigate('pets/adoption')"><span class="action-icon"><i data-lucide="paw-print"></i></span><div class="action-title">Adopt a Pet</div></div>
          <div class="action-card" onclick="App.showAdoptionForm()"><span class="action-icon"><i data-lucide="file-signature"></i></span><div class="action-title">Submit Adoption</div></div>
        </div>
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Could not load dashboard.'); }
  }

  async function renderVetDashboard(body, u) {
    try {
      const [appointments, records, reminders] = await Promise.all([
        API.appointments.list().catch(() => []),
        API.medicalRecords.list().catch(() => []),
        API.vaccinations.reminders().catch(() => []),
      ]);
      const myAppts = appointments.filter(a => a.veterinarian?.id === u.id);
      const today = myAppts.filter(a => {
        try { return new Date(a.appointmentDate).toDateString() === new Date().toDateString(); }
        catch { return false; }
      });
      const pending = records.filter(r => r.status !== 'APPROVED');
      const upcoming = myAppts.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');

      body.innerHTML = `
        <div class="dash-welcome fade-up">
          <div class="dash-welcome-text">
            <h2>Vet Dashboard</h2>
            <p>${esc(u.fullName || u.username)}</p>
          </div>
          <div class="dash-welcome-badge">ROLE_VET</div>
        </div>

        <div class="stats-grid fade-up-2">
          ${statCard('calendar', "Today's Appointments", today.length, '', '')}
          ${statCard('calendar-days', 'Upcoming', upcoming.length, 'stat-blue', '')}
          ${statCard('heart-pulse', 'Pending Records', pending.length, 'stat-yellow', 'Awaiting approval')}
          ${statCard('syringe', 'Vaccine Reminders', reminders.length, 'stat-red', 'Due within 7 days')}
        </div>

        <div class="grid-2 fade-up-3">
          <div class="card">
            <div class="card-header"><h3>Today's Appointments</h3><a href="#/appointments" class="text-sm">All →</a></div>
            ${today.length === 0
          ? '<p class="text-sm">No appointments today.</p>'
          : today.map(a => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(a.pet?.petName || '?')}</span>
                      <span class="quick-item-sub">${esc(a.purpose)} · ${formatTime(a.appointmentDate)}</span>
                    </div>
                    <button class="action-btn edit" onclick="App.showAppointmentStatusForm(${a.id},'${esc(a.status)}')">Update</button>
                  </div>`).join('')
        }
          </div>
          <div class="card">
            <div class="card-header"><h3>Vaccine Reminders</h3></div>
            ${reminders.length === 0
          ? '<p class="text-sm">No upcoming reminders.</p>'
          : reminders.slice(0, 5).map(r => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(r.vaccineName)}</span>
                      <span class="quick-item-sub">${esc(r.pet?.petName || '?')} · due ${r.nextDueDate}</span>
                    </div>
                    <span class="badge badge-warning">Due Soon</span>
                  </div>`).join('')
        }
          </div>
        </div>

        <div class="action-cards fade-up-3">
          <div class="action-card" onclick="App.showMedicalRecordForm()"><span class="action-icon"><i data-lucide="heart-pulse"></i></span><div class="action-title">New Medical Record</div></div>
          <div class="action-card" onclick="App.showVaccinationForm()"><span class="action-icon"><i data-lucide="syringe"></i></span><div class="action-title">Add Vaccination</div></div>
          <div class="action-card" onclick="Router.navigate('appointments')"><span class="action-icon"><i data-lucide="calendar"></i></span><div class="action-title">All Appointments</div></div>
          <div class="action-card" onclick="Router.navigate('medical-records')"><span class="action-icon"><i data-lucide="clipboard-list"></i></span><div class="action-title">Medical Records</div></div>
        </div>
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Could not load dashboard.'); }
  }

  async function renderShelterDashboard(body, u) {
    try {
      const [allPets, adoptions] = await Promise.all([
        API.pets.list().catch(() => []),
        API.adoptions.list().catch(() => []),
      ]);
      const shelterPets = allPets.filter(p => p.shelter != null);
      const available = shelterPets.filter(p => p.availableForAdoption);
      const pending = adoptions.filter(a => a.status === 'PENDING');

      body.innerHTML = `
        <div class="dash-welcome fade-up">
          <div class="dash-welcome-text">
            <h2>Shelter Dashboard</h2>
            <p>${esc(u.fullName || u.username)}</p>
          </div>
          <div class="dash-welcome-badge">ROLE_SHELTER</div>
        </div>

        <div class="stats-grid fade-up-2">
          ${statCard('dog', 'Pets in Shelter', shelterPets.length, '', '')}
          ${statCard('paw-print', 'Available for Adoption', available.length, 'stat-green', '')}
          ${statCard('file-signature', 'Pending Requests', pending.length, 'stat-yellow', '')}
        </div>

        <div class="grid-2 fade-up-3">
          <div class="card">
            <div class="card-header"><h3>Shelter Pets</h3><a href="#/pets" class="text-sm">Manage →</a></div>
            ${shelterPets.length === 0
          ? `<p class="text-sm">No pets in shelter.</p><button class="btn btn-primary btn-sm mt-2" onclick="App.showPetForm()">+ Add Pet</button>`
          : shelterPets.slice(0, 5).map(p => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(p.petName)}</span>
                      <span class="quick-item-sub">${esc(p.species)}${p.breed ? ` · ${esc(p.breed)}` : ''}</span>
                    </div>
                    ${p.availableForAdoption ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-gray">Taken</span>'}
                  </div>`).join('')
        }
          </div>
          <div class="card">
            <div class="card-header"><h3>Pending Adoptions</h3><a href="#/adoptions" class="text-sm">All →</a></div>
            ${pending.length === 0
          ? '<p class="text-sm">No pending requests.</p>'
          : pending.slice(0, 5).map(a => `
                  <div class="quick-item">
                    <div class="quick-item-left">
                      <span class="quick-item-name">${esc(a.applicant?.fullName || '?')}</span>
                      <span class="quick-item-sub">wants ${esc(a.pet?.petName || '?')} · ${a.requestDate || ''}</span>
                    </div>
                    <div class="btn-group">
                      <button class="action-btn approve" onclick="App.updateAdoptionStatus(${a.id},'APPROVED')"><i data-lucide="check" style="width:14px;height:14px;"></i></button>
                      <button class="action-btn delete"  onclick="App.updateAdoptionStatus(${a.id},'REJECTED')"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
                    </div>
                  </div>`).join('')
        }
          </div>
        </div>

        <div class="action-cards fade-up-3">
          <div class="action-card" onclick="App.showPetForm()"><span class="action-icon"><i data-lucide="dog"></i></span><div class="action-title">Add Pet to Shelter</div></div>
          <div class="action-card" onclick="Router.navigate('adoptions')"><span class="action-icon"><i data-lucide="file-signature"></i></span><div class="action-title">Review Adoptions</div></div>
          <div class="action-card" onclick="Router.navigate('pets/adoption')"><span class="action-icon"><i data-lucide="paw-print"></i></span><div class="action-title">Adoption Board</div></div>
        </div>
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Could not load dashboard.'); }
  }

  // ============================================================
  //  PAGE — PETS
  // ============================================================
  async function renderPets(body) {
    const role = Auth.getRole();
    const userId = Auth.getUserId();

    // Vets don't have a pets page
    if (role === 'ROLE_VET') { accessDenied(body, 'Veterinarians do not manage pet records directly.'); return; }

    try {
      const allPets = await API.pets.list();
      let pets, heading, canCreate;

      if (role === 'ROLE_ADMIN') {
        pets = allPets; heading = 'All Pets'; canCreate = true;
      } else if (role === 'ROLE_OWNER') {
        pets = allPets.filter(p => p.owner?.id === userId); heading = 'My Pets'; canCreate = true;
      } else if (role === 'ROLE_SHELTER') {
        pets = allPets.filter(p => p.shelter != null); heading = 'Shelter Pets'; canCreate = true;
      } else {
        pets = allPets; heading = 'Pets'; canCreate = false;
      }

      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>${heading} <span class="text-xs" style="font-weight:400;color:var(--text-muted)">(${pets.length})</span></h2>
          ${canCreate ? '<button class="btn btn-primary" onclick="App.showPetForm()">+ Add Pet</button>' : ''}
        </div>
        ${pets.length === 0
          ? emptyState('dog', 'No pets to display.', canCreate ? 'Add your first pet using the button above.' : '')
          : `<div class="pet-grid fade-up">${pets.map(p => petCardHtml(p, true)).join('')}</div>`
        }
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load pets.'); }
  }

  // ============================================================
  //  PAGE — PETS FOR ADOPTION (public)
  // ============================================================
  async function renderPetsAdoption(body) {
    try {
      const pets = await API.pets.forAdoption();
      const authed = Auth.isAuthenticated();
      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>Pets Available for Adoption</h2>
          ${authed && Auth.isOwner() ? '<button class="btn btn-primary" onclick="App.showAdoptionForm()">+ Submit Request</button>' : ''}
        </div>
        ${pets.length === 0
          ? emptyState('paw-print', 'No pets available for adoption right now.', 'Check back soon!')
          : `<div class="pet-grid fade-up">${pets.map(p => petCardHtml(p)).join('')}</div>`
        }
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load adoption pets.'); }
  }

  // ============================================================
  //  PAGE — APPOINTMENTS
  // ============================================================
  async function renderAppointments(body) {
    const role = Auth.getRole();
    const userId = Auth.getUserId();

    // Shelter staff don't have an appointments page
    if (role === 'ROLE_SHELTER') { accessDenied(body, 'Shelter staff do not manage appointments.'); return; }

    try {
      const allAppts = await API.appointments.list().catch(() => []);
      let appointments, heading, canCreate, canUpdate;

      if (role === 'ROLE_ADMIN') {
        appointments = allAppts; heading = 'All Appointments'; canCreate = true; canUpdate = true;
      } else if (role === 'ROLE_OWNER') {
        appointments = allAppts.filter(a => a.pet?.owner?.id === userId);
        heading = 'My Appointments'; canCreate = true; canUpdate = false;
      } else if (role === 'ROLE_VET') {
        appointments = allAppts.filter(a => a.veterinarian?.id === userId);
        heading = 'My Appointments'; canCreate = false; canUpdate = true;
      } else {
        appointments = allAppts; heading = 'Appointments'; canCreate = false; canUpdate = false;
      }

      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>${heading} <span class="text-xs" style="font-weight:400;color:var(--text-muted)">(${appointments.length})</span></h2>
          ${canCreate ? '<button class="btn btn-primary" onclick="App.showAppointmentForm()">+ Schedule</button>' : ''}
        </div>
        ${appointments.length === 0
          ? emptyState('calendar', 'No appointments to display.', canCreate ? 'Schedule your first appointment above.' : '')
          : `<div class="table-wrapper fade-up">
              <table>
                <thead><tr>
                  <th>Pet</th><th>Veterinarian</th><th>Date &amp; Time</th><th>Purpose</th><th>Status</th>
                  ${canUpdate ? '<th>Actions</th>' : ''}
                </tr></thead>
                <tbody>
                ${appointments.map(a => `<tr>
                  <td><strong>${esc(a.pet?.petName || 'N/A')}</strong>${a.pet?.species ? `<br><span class="text-xs">${esc(a.pet.species)}</span>` : ''}</td>
                  <td>${esc(a.veterinarian?.fullName || 'N/A')}</td>
                  <td>${formatDateTime(a.appointmentDate)}</td>
                  <td>${esc(a.purpose)}</td>
                  <td>${statusBadge(a.status)}</td>
                  ${canUpdate ? `<td><button class="action-btn edit" onclick="App.showAppointmentStatusForm(${a.id},'${esc(a.status)}')">Update Status</button></td>` : ''}
                </tr>`).join('')}
                </tbody>
              </table>
            </div>`
        }
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load appointments.'); }
  }

  async function showAppointmentForm() {
    const [pets, vets] = await Promise.all([
      API.pets.list().catch(() => []),
      API.auth.getVets().catch(() => []),
    ]);
    let petOptions = pets;
    if (Auth.isOwner()) {
      const uid = Auth.getUserId();
      petOptions = pets.filter(p => p.owner?.id === uid);
    }

    openModal(`
      <div class="modal-header">
        <h2>Schedule Appointment</h2>
        <button class="modal-close" type="button" onclick="App.closeModal()"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
      </div>
      <form id="appointmentForm">
        <div class="form-group">
          <label>Pet *</label>
          <select class="form-control" id="apptPet" required>
            <option value="">Select pet…</option>
            ${petOptions.map(p => `<option value="${p.id}">${esc(p.petName)} (${esc(p.species)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Veterinarian *</label>
          <select class="form-control" id="apptVet" required>
            <option value="">Select vet…</option>
            ${vets.map(v => `<option value="${v.id}">${esc(v.fullName)}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date &amp; Time *</label>
            <input type="datetime-local" class="form-control" id="apptDate" required>
          </div>
          <div class="form-group">
            <label>Purpose *</label>
            <input type="text" class="form-control" id="apptPurpose" placeholder="e.g. Wellness check" required>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Schedule Appointment</button>
        </div>
      </form>
    `);

    document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await API.appointments.schedule({
          pet: { id: parseInt(document.getElementById('apptPet').value) },
          veterinarian: { id: parseInt(document.getElementById('apptVet').value) },
          appointmentDate: document.getElementById('apptDate').value,
          purpose: document.getElementById('apptPurpose').value,
          status: 'SCHEDULED',
        });
        showToast('Appointment scheduled!');
        closeModal();
        App.renderPage('appointments');
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  function showAppointmentStatusForm(id, currentStatus) {
    openModal(`
      <div class="modal-header">
        <h2>Update Appointment Status</h2>
        <button class="modal-close" type="button" onclick="App.closeModal()"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
      </div>
      <form id="apptStatusForm">
        <div class="form-group">
          <label>New Status</label>
          <select class="form-control" id="apptNewStatus" required>
            <option value="SCHEDULED"  ${currentStatus === 'SCHEDULED' ? 'selected' : ''}>Scheduled</option>
            <option value="CONFIRMED"  ${currentStatus === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
            <option value="COMPLETED"  ${currentStatus === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            <option value="CANCELLED"  ${currentStatus === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
    `);
    document.getElementById('apptStatusForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await API.appointments.updateStatus(id, document.getElementById('apptNewStatus').value);
        showToast('Status updated!');
        closeModal();
        App.renderPage('appointments');
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  // ============================================================
  //  PAGE — MEDICAL RECORDS
  // ============================================================
  async function renderMedicalRecords(body) {
    const role = Auth.getRole();
    const userId = Auth.getUserId();

    // Owners and Shelter staff: no medical records page
    if (role === 'ROLE_SHELTER') { accessDenied(body, 'Shelter staff do not manage medical records.'); return; }

    try {
      const [records, pets] = await Promise.all([
        API.medicalRecords.list().catch(() => []),
        API.pets.list().catch(() => []),
      ]);
      let filtered, heading, canCreate, canApprove;

      if (role === 'ROLE_ADMIN') {
        filtered = records; heading = 'All Medical Records'; canCreate = true; canApprove = true;
      } else if (role === 'ROLE_VET') {
        filtered = records; heading = 'Medical Records'; canCreate = true; canApprove = true;
      } else if (role === 'ROLE_OWNER') {
        const myPetIds = pets.filter(p => p.owner?.id === userId).map(p => p.id);
        filtered = records.filter(r => r.pet && myPetIds.includes(r.pet.id));
        heading = "My Pets' Medical Records"; canCreate = false; canApprove = false;
      } else {
        filtered = records; heading = 'Medical Records'; canCreate = false; canApprove = false;
      }

      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>${heading} <span class="text-xs" style="font-weight:400;color:var(--text-muted)">(${filtered.length})</span></h2>
          ${canCreate ? '<button class="btn btn-primary" onclick="App.showMedicalRecordForm()">+ Add Record</button>' : ''}
        </div>
        ${canCreate ? `
          <div class="filter-bar fade-up">
            <span class="filter-label">Filter by pet:</span>
            <select class="form-control" id="medRecordFilter" onchange="App.filterMedicalRecords()">
              <option value="">All Pets</option>
              ${pets.map(p => `<option value="${p.id}">${esc(p.petName)}</option>`).join('')}
            </select>
          </div>` : ''}
        <div id="medRecordsContainer" class="fade-up">
          ${buildMedicalRecordsTable(filtered, canApprove)}
        </div>
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load medical records.'); }
  }

  function buildMedicalRecordsTable(records, canApprove) {
    if (records.length === 0) return emptyState('heart-pulse', 'No medical records found.');
    return `
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Pet</th><th>Diagnosis</th><th>Prescription</th><th>Visit Date</th><th>Vet</th><th>Status</th>
            ${canApprove ? '<th>Actions</th>' : ''}
          </tr></thead>
          <tbody>
          ${records.map(r => `<tr>
            <td><strong>${esc(r.pet?.petName || 'N/A')}</strong></td>
            <td>${esc(r.diagnosis)}</td>
            <td>${esc(r.prescription || '—')}</td>
            <td>${r.visitDate || '—'}</td>
            <td>${esc(r.veterinarian?.fullName || 'N/A')}</td>
            <td>${r.status === 'APPROVED' ? '<span class="badge badge-success">Approved</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
            ${canApprove ? `<td>${r.status !== 'APPROVED'
        ? `<button class="action-btn approve" onclick="App.approveMedicalRecord(${r.id})">Approve</button>`
        : '<span class="text-xs" style="color:var(--success)">Done</span>'
        }</td>` : ''}
          </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  async function filterMedicalRecords() {
    const petId = document.getElementById('medRecordFilter').value;
    const canApprove = Auth.isAdmin() || Auth.isVet();
    try {
      const records = petId
        ? await API.medicalRecords.byPet(parseInt(petId))
        : await API.medicalRecords.list();
      document.getElementById('medRecordsContainer').innerHTML = buildMedicalRecordsTable(records, canApprove);
    } catch { showToast('Failed to filter records', 'error'); }
  }

  async function showMedicalRecordForm() {
    const [pets, vets] = await Promise.all([
      API.pets.list().catch(() => []),
      API.auth.getVets().catch(() => []),
    ]);
    openModal(`
      <div class="modal-header">
        <h2>New Medical Record</h2>
        <button class="modal-close" type="button" onclick="App.closeModal()"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
      </div>
      <form id="medRecordForm">
        <div class="form-row">
          <div class="form-group">
            <label>Pet *</label>
            <select class="form-control" id="medRecordPet" required>
              <option value="">Select pet…</option>
              ${pets.map(p => `<option value="${p.id}">${esc(p.petName)} (${esc(p.species)})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Veterinarian *</label>
            <select class="form-control" id="medRecordVet" required>
              <option value="">Select vet…</option>
              ${vets.map(v => `<option value="${v.id}">${esc(v.fullName)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Diagnosis *</label>
          <input type="text" class="form-control" id="medRecordDiagnosis" placeholder="e.g. Healthy, Bacterial infection" required>
        </div>
        <div class="form-group">
          <label>Prescription</label>
          <textarea class="form-control" id="medRecordPrescription" placeholder="Medication and care instructions…"></textarea>
        </div>
        <div class="form-group">
          <label>Visit Date *</label>
          <input type="date" class="form-control" id="medRecordDate" required>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Record</button>
        </div>
      </form>
    `);

    document.getElementById('medRecordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await API.medicalRecords.create({
          pet: { id: parseInt(document.getElementById('medRecordPet').value) },
          veterinarian: { id: parseInt(document.getElementById('medRecordVet').value) },
          diagnosis: document.getElementById('medRecordDiagnosis').value,
          prescription: document.getElementById('medRecordPrescription').value,
          visitDate: document.getElementById('medRecordDate').value,
          status: 'PENDING',
        });
        showToast('Medical record created!');
        closeModal();
        App.renderPage('medical-records');
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  async function approveMedicalRecord(id) {
    try {
      await API.medicalRecords.approve(id);
      showToast('Record approved!');
      renderPage('medical-records');
    } catch (err) { showToast(err.message, 'error'); }
  }

  // ============================================================
  //  PAGE — ADOPTIONS
  // ============================================================
  async function renderAdoptions(body) {
    const role = Auth.getRole();
    const userId = Auth.getUserId();

    // Vets don't have an adoptions page
    if (role === 'ROLE_VET') { accessDenied(body, 'Veterinarians do not manage adoption requests.'); return; }

    try {
      const requests = await API.adoptions.list().catch(() => []);
      let filtered, heading, canCreate, canUpdate;

      if (role === 'ROLE_ADMIN') {
        filtered = requests; heading = 'All Adoption Requests'; canCreate = false; canUpdate = true;
      } else if (role === 'ROLE_OWNER') {
        filtered = requests.filter(r => r.applicant?.id === userId);
        heading = 'My Adoption Requests'; canCreate = true; canUpdate = false;
      } else if (role === 'ROLE_SHELTER') {
        filtered = requests; heading = 'Adoption Requests'; canCreate = false; canUpdate = true;
      } else {
        filtered = requests; heading = 'Adoption Requests'; canCreate = false; canUpdate = false;
      }

      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>${heading} <span class="text-xs" style="font-weight:400;color:var(--text-muted)">(${filtered.length})</span></h2>
          ${canCreate ? '<button class="btn btn-primary" onclick="App.showAdoptionForm()">+ New Request</button>' : ''}
        </div>
        ${filtered.length === 0
          ? emptyState('file-signature', 'No adoption requests to display.', canCreate ? 'Browse adoption pets and submit a request.' : '')
          : `<div class="table-wrapper fade-up">
              <table>
                <thead><tr>
                  <th>Applicant</th><th>Pet</th><th>Species</th><th>Request Date</th><th>Status</th>
                  ${canUpdate ? '<th>Actions</th>' : ''}
                </tr></thead>
                <tbody>
                ${filtered.map(r => `<tr>
                  <td><strong>${esc(r.applicant?.fullName || 'N/A')}</strong><br><span class="text-xs">${esc(r.applicant?.email || '')}</span></td>
                  <td><strong>${esc(r.pet?.petName || 'N/A')}</strong></td>
                  <td>${esc(r.pet?.species || '—')}</td>
                  <td>${r.requestDate || '—'}</td>
                  <td>${statusBadge(r.status)}</td>
                  ${canUpdate ? `<td>
                    ${r.status === 'PENDING'
                ? `<button class="action-btn approve" onclick="App.updateAdoptionStatus(${r.id},'APPROVED')">Approve</button>
                         <button class="action-btn delete"  onclick="App.updateAdoptionStatus(${r.id},'REJECTED')">Reject</button>`
                : `<span class="text-xs" style="color:var(--text-muted)">${r.status}</span>`}
                  </td>` : ''}
                </tr>`).join('')}
                </tbody>
              </table>
            </div>`
        }
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load adoptions.'); }
  }

  async function showAdoptionForm() {
    const pets = await API.pets.forAdoption().catch(() => []);
    openModal(`
      <div class="modal-header">
        <h2>Submit Adoption Request</h2>
        <button class="modal-close" type="button" onclick="App.closeModal()"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
      </div>
      <form id="adoptionForm">
        <div class="form-group">
          <label>Pet *</label>
          <select class="form-control" id="adoptPet" required>
            <option value="">Select a pet available for adoption…</option>
            ${pets.map(p => `<option value="${p.id}">${esc(p.petName)} — ${esc(p.species)}${p.breed ? ' (' + esc(p.breed) + ')' : ''}</option>`).join('')}
          </select>
        </div>
        <p class="text-xs mt-1" style="color:var(--text-muted)">Request date will be set to today.</p>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Request</button>
        </div>
      </form>
    `);
    document.getElementById('adoptionForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await API.adoptions.create({
          applicant: { id: Auth.getUserId() },
          pet: { id: parseInt(document.getElementById('adoptPet').value) },
          requestDate: new Date().toISOString().split('T')[0],
          status: 'PENDING',
        });
        showToast('Adoption request submitted!');
        closeModal();
        App.renderPage('adoptions');
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  async function updateAdoptionStatus(id, status) {
    try {
      await API.adoptions.updateStatus(id, status);
      showToast(`Adoption request ${status.toLowerCase()}!`, status === 'APPROVED' ? 'success' : 'warning');
      renderPage('adoptions');
    } catch (err) { showToast(err.message, 'error'); }
  }

  // ============================================================
  //  PAGE — VACCINATIONS
  // ============================================================
  async function renderVaccinations(body) {
    const role = Auth.getRole();
    const userId = Auth.getUserId();

    // Shelter staff: no vaccinations page
    if (role === 'ROLE_SHELTER') { accessDenied(body, 'Shelter staff do not manage vaccination records.'); return; }

    try {
      const [allVacc, reminders, pets] = await Promise.all([
        API.vaccinations.list().catch(() => []),
        API.vaccinations.reminders().catch(() => []),
        API.pets.list().catch(() => []),
      ]);
      let vaccinations, heading, canCreate, canUpdate, canDelete;

      if (role === 'ROLE_ADMIN') {
        vaccinations = allVacc; heading = 'All Vaccinations'; canCreate = true; canUpdate = true; canDelete = true;
      } else if (role === 'ROLE_VET') {
        vaccinations = allVacc; heading = 'Vaccinations'; canCreate = true; canUpdate = true; canDelete = false;
      } else if (role === 'ROLE_OWNER') {
        const myPetIds = pets.filter(p => p.owner?.id === userId).map(p => p.id);
        vaccinations = allVacc.filter(v => v.pet && myPetIds.includes(v.pet.id));
        heading = "My Pets' Vaccinations"; canCreate = false; canUpdate = false; canDelete = false;
      } else {
        vaccinations = allVacc; heading = 'Vaccinations'; canCreate = false; canUpdate = false; canDelete = false;
      }

      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>${heading} <span class="text-xs" style="font-weight:400;color:var(--text-muted)">(${vaccinations.length})</span></h2>
          ${canCreate ? '<button class="btn btn-primary" onclick="App.showVaccinationForm()">+ Add Vaccination</button>' : ''}
        </div>

        ${reminders.length > 0 ? `
          <div class="alert-banner alert-warning fade-up">
            <span class="alert-banner-icon"><i data-lucide="alert-triangle"></i></span>
            <div>
              <strong>Upcoming Reminders (due within 7 days)</strong>
              <div style="margin-top:.35rem;line-height:1.8;">
                ${reminders.map(r => `• <strong>${esc(r.vaccineName)}</strong> for ${esc(r.pet?.petName || '?')} — due ${r.nextDueDate}`).join('<br>')}
              </div>
            </div>
          </div>` : ''}

        ${vaccinations.length === 0
          ? emptyState('syringe', 'No vaccination records found.')
          : `<div class="table-wrapper fade-up">
              <table>
                <thead><tr>
                  <th>Pet</th><th>Vaccine</th><th>Date Given</th><th>Next Due</th><th>Status</th>
                  ${canUpdate || canDelete ? '<th>Actions</th>' : ''}
                </tr></thead>
                <tbody>
                ${vaccinations.map(v => `<tr>
                  <td><strong>${esc(v.pet?.petName || 'N/A')}</strong></td>
                  <td>${esc(v.vaccineName)}</td>
                  <td>${v.vaccinationDate || '—'}</td>
                  <td>${v.nextDueDate || '—'}</td>
                  <td>${statusBadge(v.status)}</td>
                  ${canUpdate || canDelete ? `<td>
                    ${canUpdate ? `<button class="action-btn edit" onclick="App.showVaccinationFormFromCard('${encodeURIComponent(JSON.stringify(v))}')">Edit</button> ` : ''}
                    ${canDelete ? `<button class="action-btn delete" onclick="App.deleteVaccination(${v.id})">Delete</button>` : ''}
                  </td>` : ''}
                </tr>`).join('')}
                </tbody>
              </table>
            </div>`
        }
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load vaccinations.'); }
  }

  function showVaccinationFormFromCard(enc) {
    try { showVaccinationForm(JSON.parse(decodeURIComponent(enc))); }
    catch { showVaccinationForm(null); }
  }

  async function showVaccinationForm(vacc) {
    const pets = await API.pets.list().catch(() => []);
    const isEdit = !!vacc;
    openModal(`
      <div class="modal-header">
        <h2>${isEdit ? 'Edit Vaccination' : 'Add Vaccination'}</h2>
        <button class="modal-close" type="button" onclick="App.closeModal()"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
      </div>
      <form id="vaccinationForm">
        <div class="form-group">
          <label>Pet *</label>
          <select class="form-control" id="vacPet" required>
            <option value="">Select pet…</option>
            ${pets.map(p => `<option value="${p.id}" ${isEdit && vacc.pet?.id === p.id ? 'selected' : ''}>${esc(p.petName)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Vaccine Name *</label>
          <input type="text" class="form-control" id="vacName" value="${isEdit ? esc(vacc.vaccineName) : ''}" placeholder="e.g. Rabies, FVRCP" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date Given *</label>
            <input type="date" class="form-control" id="vacDate" value="${isEdit ? vacc.vaccinationDate : ''}" required>
          </div>
          <div class="form-group">
            <label>Next Due Date *</label>
            <input type="date" class="form-control" id="vacNextDue" value="${isEdit ? vacc.nextDueDate : ''}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Status *</label>
          <select class="form-control" id="vacStatus" required>
            <option value="PENDING"   ${isEdit && vacc.status === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="COMPLETED" ${isEdit && vacc.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            <option value="OVERDUE"   ${isEdit && vacc.status === 'OVERDUE' ? 'selected' : ''}>Overdue</option>
          </select>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Vaccination</button>
        </div>
      </form>
    `);
    document.getElementById('vaccinationForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        pet: { id: parseInt(document.getElementById('vacPet').value) },
        vaccineName: document.getElementById('vacName').value,
        vaccinationDate: document.getElementById('vacDate').value,
        nextDueDate: document.getElementById('vacNextDue').value,
        status: document.getElementById('vacStatus').value,
      };
      try {
        if (isEdit) {
          await API.vaccinations.update(vacc.id, data);
          showToast('Vaccination updated!');
        } else {
          await API.vaccinations.create(data);
          showToast('Vaccination added!');
        }
        closeModal();
        App.renderPage('vaccinations');
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  async function deleteVaccination(id) {
    if (!confirm('Delete this vaccination record?')) return;
    try {
      await API.vaccinations.delete(id);
      showToast('Vaccination deleted!');
      renderPage('vaccinations');
    } catch (err) { showToast(err.message, 'error'); }
  }

  // ============================================================
  //  PAGE — USERS (admin only)
  // ============================================================
  async function renderUsers(body) {
    if (!Auth.isAdmin()) { accessDenied(body, 'User management is restricted to administrators.'); return; }
    try {
      const users = await API.auth.getUsers();
      const me = Auth.getUserId();
      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>User Management <span class="text-xs" style="font-weight:400;color:var(--text-muted)">(${users.length} users)</span></h2>
        </div>
        <div class="table-wrapper fade-up">
          <table>
            <thead><tr>
              <th>ID</th><th>Username</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th>
            </tr></thead>
            <tbody>
            ${users.map(u => `<tr>
              <td class="text-xs" style="color:var(--text-muted)">#${u.id}</td>
              <td><strong>${esc(u.username)}</strong>${u.id === me ? ' <span class="badge badge-info">You</span>' : ''}</td>
              <td>${esc(u.fullName)}</td>
              <td>${esc(u.email)}</td>
              <td>${esc(u.phone || '—')}</td>
              <td><span class="role-badge ${Auth.roleBadgeClass(u.role)}">${Auth.roleDisplay(u.role)}</span></td>
              <td>
                <button class="action-btn edit" onclick="App.showUserEditForm(${u.id})">Edit</button>
                ${u.id !== me ? `<button class="action-btn delete" onclick="App.deleteUser(${u.id})">Delete</button>` : ''}
              </td>
            </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load users.'); }
  }

  function showUserEditForm(id) {
    API.auth.getUsers().then(users => {
      const user = users.find(u => u.id === id);
      if (!user) { showToast('User not found', 'error'); return; }
      openModal(`
        <div class="modal-header">
          <h2>Edit User — ${esc(user.username)}</h2>
          <button class="modal-close" type="button" onclick="App.closeModal()"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
        </div>
        <form id="userEditForm">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="form-control" id="ueFullName" value="${esc(user.fullName)}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" id="ueEmail" value="${esc(user.email)}" required>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" class="form-control" id="uePhone" value="${esc(user.phone || '')}">
            </div>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select class="form-control" id="ueRole" required>
              ${['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_VET', 'ROLE_SHELTER'].map(r =>
        `<option value="${r}" ${user.role === r ? 'selected' : ''}>${Auth.roleDisplay(r)}</option>`
      ).join('')}
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Update User</button>
          </div>
        </form>
      `);
      document.getElementById('userEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await API.auth.updateUser(id, {
            fullName: document.getElementById('ueFullName').value,
            email: document.getElementById('ueEmail').value,
            phone: document.getElementById('uePhone').value,
            role: document.getElementById('ueRole').value,
          });
          showToast('User updated!');
          closeModal();
          App.renderPage('users');
        } catch (err) { showToast(err.message, 'error'); }
      });
    }).catch(() => showToast('Failed to load user data', 'error'));
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await API.auth.deleteUser(id);
      showToast('User deleted!', 'warning');
      renderPage('users');
    } catch (err) { showToast(err.message, 'error'); }
  }

  // ============================================================
  //  PAGE — VETS (public)
  // ============================================================
  async function renderVets(body) {
    try {
      const vets = await API.auth.getVets();
      body.innerHTML = `
        <div class="page-bar fade-up">
          <h2>Our Veterinarians</h2>
        </div>
        ${vets.length === 0
          ? emptyState('stethoscope', 'No veterinarians listed yet.')
          : `<div class="grid-2 fade-up">
              ${vets.map(v => `
                <div class="vet-card">
                  <div class="vet-avatar"><i data-lucide="stethoscope"></i></div>
                  <div class="vet-info">
                    <h4>${esc(v.fullName)}</h4>
                    <p>${esc(v.email)}${v.phone ? ` · ${esc(v.phone)}` : ''}</p>
                    <span class="badge badge-success" style="margin-top:.5rem">Available</span>
                  </div>
                </div>`).join('')}
            </div>`
        }
      `;
    } catch { body.innerHTML = emptyState('alert-circle', 'Failed to load veterinarians.'); }
  }

  // ============================================================
  //  PAGE — PETS FORM
  // ============================================================
  function showPetFormFromCard(encodedPet) {
    try { showPetForm(JSON.parse(decodeURIComponent(encodedPet))); }
    catch { showPetForm(null); }
  }

  async function showPetForm(pet) {
    const isEdit = !!pet;
    openModal(`
      <div class="modal-header">
        <h2>${isEdit ? 'Edit Pet' : 'Add New Pet'}</h2>
        <button class="modal-close" type="button" onclick="App.closeModal()"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
      </div>
      <form id="petForm" data-pet="${encodeURIComponent(JSON.stringify(pet))}">
        <div class="form-row">
          <div class="form-group">
            <label>Pet Name *</label>
            <input type="text" class="form-control" id="petName" value="${isEdit ? esc(pet.petName) : ''}" required>
          </div>
          <div class="form-group">
            <label>Species *</label>
            <select class="form-control" id="petSpecies" required>
              <option value="">Select…</option>
              ${['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Reptile', 'Other'].map(s =>
      `<option value="${s}" ${isEdit && pet.species === s ? 'selected' : ''}>${s}</option>`
    ).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Breed</label>
            <input type="text" class="form-control" id="petBreed" value="${isEdit ? esc(pet.breed || '') : ''}" placeholder="Optional">
          </div>
          <div class="form-group">
            <label>Age (years) *</label>
            <input type="number" class="form-control" id="petAge" value="${isEdit ? pet.age : ''}" min="0" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Gender</label>
            <select class="form-control" id="petGender">
              <option value="">Select…</option>
              ${['Male', 'Female'].map(g => `<option value="${g}" ${isEdit && pet.gender === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Available for Adoption</label>
            <select class="form-control" id="petAvailable">
              <option value="false" ${isEdit && !pet.availableForAdoption ? 'selected' : ''}>No</option>
              <option value="true"  ${isEdit && pet.availableForAdoption ? 'selected' : ''}>Yes</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Image URL</label>
          <input type="url" class="form-control" id="petImageUrl" value="${isEdit ? esc(pet.imageUrl || '') : ''}" placeholder="https://…">
        </div>
        <div class="form-group">
          <label>Shelter (optional)</label>
          <select class="form-control" id="petShelter">
            <option value="">No shelter</option>
            <option value="1" ${isEdit && pet.shelter?.id === 1 ? 'selected' : ''}>PetPulse City Shelter</option>
          </select>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update Pet' : 'Create Pet'}</button>
        </div>
      </form>
    `);

    document.getElementById('petForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      let existingPet = null;
      const attr = document.getElementById('petForm').getAttribute('data-pet');
      if (attr) { try { existingPet = JSON.parse(decodeURIComponent(attr)); } catch { } }

      const data = {
        petName: document.getElementById('petName').value,
        species: document.getElementById('petSpecies').value,
        breed: document.getElementById('petBreed').value,
        age: parseInt(document.getElementById('petAge').value),
        gender: document.getElementById('petGender').value,
        imageUrl: document.getElementById('petImageUrl').value,
        availableForAdoption: document.getElementById('petAvailable').value === 'true',
      };
      const shelterVal = document.getElementById('petShelter').value;
      if (shelterVal) data.shelter = { id: parseInt(shelterVal) };
      if (!existingPet && Auth.isOwner()) data.owner = { id: Auth.getUserId() };

      try {
        if (existingPet) {
          await API.pets.update(existingPet.id, data);
          showToast('Pet updated!');
        } else {
          await API.pets.create(data);
          showToast('Pet created!');
        }
        closeModal();
        App.renderPage('pets');
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  async function deletePet(id) {
    if (!confirm('Delete this pet? This action cannot be undone.')) return;
    try {
      await API.pets.delete(id);
      showToast('Pet deleted.', 'warning');
      renderPage('pets');
    } catch (err) { showToast(err.message, 'error'); }
  }

  // ============================================================
  //  SKELETON LOADING
  // ============================================================
  function renderSkeleton(pageName) {
    // Auth pages just get a simple spinner
    if (pageName === 'login' || pageName === 'register') {
      return '<div class="loading"><div class="spinner"></div></div>';
    }
    // Dashboard gets stat card skeletons
    if (pageName === 'dashboard') {
      return `
        <div class="skeleton-wrap">
          <div class="skeleton-stat" style="margin-bottom:1rem">
            <div class="skeleton skeleton-line-xs" style="width:60px"></div>
            <div class="skeleton skeleton-line" style="height:32px;width:80px;margin-top:4px"></div>
            <div class="skeleton skeleton-line-xs" style="width:100px;margin-top:8px"></div>
          </div>
          <div class="stats-grid">
            ${Array(4).fill('<div class="skeleton-stat"><div class="skeleton skeleton-line-xs" style="width:50px"></div><div class="skeleton skeleton-line" style="height:24px;width:60px"></div></div>').join('')}
          </div>
          <div class="grid-2">
            <div class="skeleton-card"><div class="skeleton-body"><div class="skeleton skeleton-line-xs" style="width:100px"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line-short"></div></div></div>
            <div class="skeleton-card"><div class="skeleton-body"><div class="skeleton skeleton-line-xs" style="width:100px"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line-short"></div></div></div>
          </div>
        </div>`;
    }
    // Pet grids get card skeletons
    if (pageName === 'pets' || pageName === 'pets-adoption') {
      return `
        <div class="skeleton-wrap">
          <div class="skeleton skeleton-line-xs" style="width:120px;height:16px;margin-bottom:1rem"></div>
          <div class="pet-grid">
            ${Array(4).fill('<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton skeleton-line" style="height:18px;width:70%"></div><div class="skeleton skeleton-line-xs" style="width:50%"></div></div></div>').join('')}
          </div>
        </div>`;
    }
    // Tables get row skeletons
    if (['appointments', 'medical-records', 'adoptions', 'vaccinations', 'users', 'vets'].includes(pageName)) {
      return `
        <div class="skeleton-wrap">
          <div class="skeleton skeleton-line-xs" style="width:120px;height:16px;margin-bottom:1rem"></div>
          <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
            ${Array(5).fill('<div style="display:flex;padding:.85rem 1rem;border-bottom:1px solid var(--border-2);gap:1rem"><div class="skeleton skeleton-line" style="flex:1;height:14px"></div><div class="skeleton skeleton-line" style="flex:1;height:14px"></div><div class="skeleton skeleton-line" style="flex:1;height:14px"></div><div class="skeleton skeleton-line" style="flex:.5;height:14px"></div></div>').join('')}
          </div>
        </div>`;
    }
    // Default spinner
    return '<div class="loading"><div class="spinner"></div></div>';
  }

  // ============================================================
  //  UTILITY HELPERS
  // ============================================================
  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatDateTime(dt) {
    if (!dt) return '—';
    try {
      return new Date(dt).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return dt; }
  }

  function formatTime(dt) {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }
    catch { return dt; }
  }

  function statusBadge(status) {
    if (!status) return '—';
    const s = status.toUpperCase();
    if (['APPROVED', 'COMPLETED', 'CONFIRMED'].includes(s)) return `<span class="badge badge-success">${status}</span>`;
    if (['PENDING', 'SCHEDULED'].includes(s)) return `<span class="badge badge-warning">${status}</span>`;
    if (['REJECTED', 'CANCELLED', 'OVERDUE'].includes(s)) return `<span class="badge badge-danger">${status}</span>`;
    return `<span class="badge badge-info">${status}</span>`;
  }

  function emptyState(icon, title, sub = '') {
    return `<div class="empty-state"><div class="empty-icon"><i data-lucide="${icon}"></i></div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>`;
  }

  function statCard(icon, label, value, cls = '', sub = '') {
    return `
      <div class="stat-card ${cls}">
        <div class="stat-icon"><i data-lucide="${icon}"></i></div>
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
      </div>`;
  }

  function petCardHtml(pet, showActions = false) {
    const userId = Auth.getUserId();
    const role = Auth.getRole();
    const canEdit = showActions && ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_SHELTER'].includes(role);
    const canDelete = showActions && (role === 'ROLE_ADMIN' || (role === 'ROLE_OWNER' && pet.owner?.id === userId));

    return `
      <div class="pet-card">
        ${pet.imageUrl
        ? `<img src="${esc(pet.imageUrl)}" alt="${esc(pet.petName)}" class="pet-img"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''
      }
        <div class="pet-img-placeholder" style="${pet.imageUrl ? 'display:none' : ''}"><i data-lucide="paw-print" style="width: 48px; height: 48px; color: var(--text-muted)"></i></div>
        <div class="pet-card-body">
          <h4>${esc(pet.petName)}</h4>
          <div class="pet-meta">
            <span class="pet-tag">${esc(pet.species)}</span>
            ${pet.breed ? `<span class="pet-tag">${esc(pet.breed)}</span>` : ''}
            <span class="pet-tag">${pet.age} yr${pet.age !== 1 ? 's' : ''}</span>
            ${pet.gender ? `<span class="pet-tag">${esc(pet.gender)}</span>` : ''}
          </div>
          ${pet.availableForAdoption
        ? '<span class="badge badge-success">Available for Adoption</span>'
        : '<span class="badge badge-gray">Not Available</span>'
      }
          ${pet.owner ? `<p class="text-xs mt-1">Owner: ${esc(pet.owner.fullName || pet.owner.username)}</p>` : ''}
          ${pet.shelter ? `<p class="text-xs">Shelter: ${esc(pet.shelter.shelterName)}</p>` : ''}
          ${showActions ? `
            <div class="pet-card-footer">
              ${canEdit ? `<button class="btn btn-outline btn-sm" onclick="App.showPetFormFromCard('${encodeURIComponent(JSON.stringify(pet))}')">Edit</button>` : ''}
              ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="App.deletePet(${pet.id})">Delete</button>` : ''}
            </div>` : ''}
        </div>
      </div>
    `;
  }

  // ============================================================
  //  MOBILE SIDEBAR TOGGLE
  // ============================================================
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });

  // ============================================================
  //  INIT
  // ============================================================
  function init() {
    Router.init();
  }

  // Expose to window for inline onclick handlers
  window.App = {
    renderPage, updateSidebar,
    showToast, openModal, closeModal,
    showPetForm, showPetFormFromCard, deletePet,
    showAppointmentForm, showAppointmentStatusForm,
    showMedicalRecordForm, approveMedicalRecord, filterMedicalRecords,
    showAdoptionForm, updateAdoptionStatus,
    showVaccinationForm, showVaccinationFormFromCard, deleteVaccination,
    showUserEditForm, deleteUser,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    renderPage, updateSidebar,
    showToast, openModal, closeModal,
    showPetForm, deletePet,
    showAppointmentForm, showAppointmentStatusForm,
    showMedicalRecordForm, approveMedicalRecord, filterMedicalRecords,
    showAdoptionForm, updateAdoptionStatus,
    showVaccinationForm, deleteVaccination,
    showUserEditForm, deleteUser,
    auth: Auth,
  };
})();
