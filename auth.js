import { supabase } from './lib/supabase.js';

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const confirmPasswordField = document.getElementById('confirmPasswordField');
const submitButton = document.getElementById('submitButton');
const toggleModeButton = document.getElementById('toggleMode');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const toggleText = document.getElementById('toggleText');
const errorMessage = document.getElementById('errorMessage');
const loadingOverlay = document.getElementById('loadingOverlay');

let isSignUpMode = false;

function showLoading() {
  loadingOverlay.classList.add('is-visible');
  submitButton.disabled = true;
}

function hideLoading() {
  loadingOverlay.classList.remove('is-visible');
  submitButton.disabled = false;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('is-visible');
}

function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('is-visible');
}

function toggleMode() {
  isSignUpMode = !isSignUpMode;

  if (isSignUpMode) {
    authTitle.textContent = 'Criar sua conta';
    authSubtitle.textContent = 'Comece a gerenciar seus laudos hoje';
    submitButton.textContent = 'Criar conta';
    toggleText.textContent = 'Já tem uma conta?';
    toggleModeButton.textContent = 'Fazer login';
    confirmPasswordField.style.display = 'grid';
    confirmPasswordInput.required = true;
    passwordInput.autocomplete = 'new-password';
  } else {
    authTitle.textContent = 'Faça login na sua conta';
    authSubtitle.textContent = 'Acesse o sistema de gestão de laudos';
    submitButton.textContent = 'Entrar';
    toggleText.textContent = 'Não tem uma conta?';
    toggleModeButton.textContent = 'Criar conta';
    confirmPasswordField.style.display = 'none';
    confirmPasswordInput.required = false;
    passwordInput.autocomplete = 'current-password';
  }

  hideError();
}

async function handleSignUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;

  return data;
}

async function handleSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
}

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    window.location.href = '/index.html';
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!email || !password) {
    showError('Por favor, preencha todos os campos.');
    return;
  }

  if (isSignUpMode && password !== confirmPassword) {
    showError('As senhas não coincidem.');
    return;
  }

  if (password.length < 6) {
    showError('A senha deve ter no mínimo 6 caracteres.');
    return;
  }

  showLoading();

  try {
    if (isSignUpMode) {
      await handleSignUp(email, password);

      hideLoading();
      alert('Conta criada com sucesso! Você pode fazer login agora.');
      toggleMode();
      authForm.reset();
    } else {
      await handleSignIn(email, password);

      window.location.href = '/index.html';
    }
  } catch (error) {
    hideLoading();

    let errorMsg = 'Ocorreu um erro. Tente novamente.';

    if (error.message.includes('Invalid login credentials')) {
      errorMsg = 'Email ou senha incorretos.';
    } else if (error.message.includes('User already registered')) {
      errorMsg = 'Este email já está cadastrado. Faça login.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMsg = 'Por favor, confirme seu email antes de fazer login.';
    } else if (error.message) {
      errorMsg = error.message;
    }

    showError(errorMsg);
  }
});

toggleModeButton.addEventListener('click', toggleMode);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    window.location.href = '/index.html';
  }
});

checkSession();
