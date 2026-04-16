// main.js - работа с данными и общие функции

// ---------- Хранилище (localStorage) ----------
let users = JSON.parse(localStorage.getItem('python_users')) || [];
let applications = JSON.parse(localStorage.getItem('python_applications')) || [];
let currentUserId = localStorage.getItem('python_current_user') || null;

// Создание админа при первом запуске
if (users.length === 0) {
    users.push({
        id: 1,
        login: 'admin',
        password: '1234',
        fullName: 'Администратор',
        phone: '+70000000000',
        email: 'admin@school25.ru',
        isAdmin: true,
        createdAt: Date.now()
    });
    saveUsers();
}

// Функции сохранения
function saveUsers() { 
    localStorage.setItem('python_users', JSON.stringify(users)); 
}

function saveApps() { 
    localStorage.setItem('python_applications', JSON.stringify(applications)); 
}

// Функции чтения
function getUserById(id) { 
    return users.find(u => u.id == id); 
}

function getUserApps(userId) { 
    return applications.filter(a => a.userId == userId).sort((a,b) => b.createdAt - a.createdAt); 
}

function getAllApps() { 
    return applications.sort((a,b) => b.createdAt - a.createdAt); 
}

// Проверка на админа
function isAdmin() {
    if (!currentUserId) return false;
    const user = getUserById(currentUserId);
    return user && user.isAdmin === true;
}

// Функция для отображения сообщений
function showMsg(containerId, text, type) {
    const div = document.getElementById(containerId);
    if (div) {
        div.innerHTML = `<div class="alert ${type}">${text}</div>`;
        setTimeout(() => { div.innerHTML = ''; }, 3000);
    }
}

// Защита от XSS
function escapeHtml(str) { 
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m){ 
        if(m === '&') return '&amp;'; 
        if(m === '<') return '&lt;'; 
        if(m === '>') return '&gt;'; 
        return m;
    }); 
}

// Обновление шапки и меню
function updateHeaderAndMenu() {
    const headerBlock = document.getElementById('headerAuthBlock');
    if (headerBlock) {
        if (currentUserId) {
            const user = getUserById(currentUserId);
            const adminBadge = (user && user.isAdmin) ? '<span class="badge-admin" style="background:#dc2626; color:white; padding:2px 8px; border-radius:20px; margin-left:8px; font-size:12px;">Админ</span>' : '';
            headerBlock.innerHTML = `
                <span style="color:white;"><i class="fas fa-user-graduate"></i> ${user ? escapeHtml(user.fullName) : 'Ученик'} ${adminBadge}</span>
                <a href="logout.html"><i class="fas fa-sign-out-alt"></i> Выйти</a>
            `;
        } else {
            headerBlock.innerHTML = `<a href="login.html"><i class="fas fa-sign-in-alt"></i> Вход</a><a href="register.html"><i class="fas fa-user-plus"></i> Регистрация</a>`;
        }
    }

    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar) {
        if (currentUserId) {
            const isAdminUser = isAdmin();
            let menuItems = `
                <a href="index.html"><i class="fas fa-home"></i> Главная</a>
                <a href="about.html"><i class="fas fa-book"></i> О пособии</a>
                <a href="create_app.html"><i class="fas fa-file-signature"></i> Заявка на пособие</a>
                <a href="my_apps.html"><i class="fas fa-list-ul"></i> Мои заявки</a>
            `;
            if (isAdminUser) {
                menuItems += `<a href="admin.html"><i class="fas fa-user-shield"></i> Админ-панель</a>`;
            }
            menuItems += `<a href="logout.html"><i class="fas fa-sign-out-alt"></i> Выйти</a>`;
            sidebar.innerHTML = menuItems;
        } else {
            sidebar.innerHTML = `
                <a href="index.html"><i class="fas fa-home"></i> Главная</a>
                <a href="about.html"><i class="fas fa-book"></i> О пособии</a>
                <a href="login.html"><i class="fas fa-sign-in-alt"></i> Вход</a>
                <a href="register.html"><i class="fas fa-user-plus"></i> Регистрация</a>
            `;
        }
    }
}

// Проверка авторизации
function requireAuth() {
    if (!currentUserId) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Проверка админа
function requireAdmin() {
    if (!requireAuth()) return false;
    if (!isAdmin()) {
        alert('Доступ запрещён. Требуются права администратора.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Админ-функции
function updateRequestStatus(requestId, newStatus) {
    const request = applications.find(r => r.id == requestId);
    if (request) {
        request.status = newStatus;
        saveApps();
        return true;
    }
    return false;
}

function deleteRequest(requestId) {
    const index = applications.findIndex(r => r.id == requestId);
    if (index !== -1) {
        applications.splice(index, 1);
        saveApps();
        return true;
    }
    return false;
}

function getStats() {
    const totalUsers = users.length;
    const totalApps = applications.length;
    const newApps = applications.filter(a => a.status === 'новая').length;
    const acceptedApps = applications.filter(a => a.status === 'принята').length;
    const rejectedApps = applications.filter(a => a.status === 'отклонена').length;
    return { totalUsers, totalApps, newApps, acceptedApps, rejectedApps };
}