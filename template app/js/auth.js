document.addEventListener('DOMContentLoaded', () => {
    // If user is already logged in, redirect to dashboard
    if (api.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');
    
    // Switch Tabs
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
        document.getElementById('login-error').innerText = '';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.remove('hidden');
        formLogin.classList.add('hidden');
        document.getElementById('register-error').innerText = '';
    });

    // Handle Login
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('login-username').value;
        const passwordInput = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            errorDiv.innerText = '';
            const submitBtn = formLogin.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Loading...';
            
            await api.login(usernameInput, passwordInput);
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorDiv.innerText = error.message;
            formLogin.querySelector('button').innerText = 'Login →';
        }
    });

    // Handle Registration
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('reg-username').value;
        const passwordInput = document.getElementById('reg-password').value;
        const errorDiv = document.getElementById('register-error');

        try {
            errorDiv.innerText = '';
            const submitBtn = formRegister.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Loading...';

            await api.register(usernameInput, passwordInput);
            // Auto login after registration
            await api.login(usernameInput, passwordInput);
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorDiv.innerText = error.message;
            formRegister.querySelector('button').innerText = 'Register →';
        }
    });
});
