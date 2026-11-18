import logo from './assets/pony-white.svg';
import './login.css';

// Presentation-only gate: credentials and application files remain public.
const sessionKey = 'ponyops.demo-login.v1';

export function requireDemoLogin(host, onSuccess) {
  try {
    if (sessionStorage.getItem(sessionKey) === 'Arthur') {
      onSuccess();
      return;
    }
  } catch { /* A blocked storage API must not prevent the demo from opening. */ }

  document.title = 'Connexion · PonyOps';
  document.body.classList.add('demo-login-page');
  host.innerHTML = `
    <main class="demo-login" aria-labelledby="login-title">
      <div class="demo-login-brand"><img src="${logo}" alt="Pony" /><span>Ops</span></div>
      <section class="demo-login-card">
        <h1 id="login-title">Connexion</h1>
        <form class="demo-login-form">
          <label for="login-username">Nom d’utilisateur</label>
          <input id="login-username" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required />
          <label for="login-password">Mot de passe</label>
          <input id="login-password" name="password" type="password" autocomplete="current-password" required />
          <p id="login-error" class="demo-login-error" role="alert" aria-live="polite"></p>
          <button type="submit">Se connecter <span aria-hidden="true">→</span></button>
        </form>
      </section>
    </main>`;

  const form = host.querySelector('form');
  const username = form.elements.username;
  const password = form.elements.password;
  const error = host.querySelector('#login-error');

  form.addEventListener('input', () => {
    error.textContent = '';
    for (const input of [username, password]) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (username.value.trim() !== 'Arthur' || password.value !== 'Pony') {
      error.textContent = 'Nom d’utilisateur ou mot de passe incorrect.';
      for (const input of [username, password]) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'login-error');
      }
      password.value = '';
      password.focus();
      return;
    }
    try { sessionStorage.setItem(sessionKey, 'Arthur'); } catch { /* Continue in memory. */ }
    document.body.classList.remove('demo-login-page');
    host.replaceChildren();
    onSuccess();
  });
}
