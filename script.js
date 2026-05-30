import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. KONFIGURASI FIREBASE ---
// Tempelkan konfigurasi dari Firebase Console Anda di bawah ini
const firebaseConfig = {
    apiKey: "AIzaSyDhBX7Qlwn4LapGvHA-OeznYeGBlWoKwxY",
    authDomain: "my-nafgyz-store.firebaseapp.com",
    projectId: "my-nafgyz-store",
    storageBucket: "my-nafgyz-store.firebasestorage.app",
    messagingSenderId: "128709994284",
    appId: "1:128709994284:web:1690a0313410b39a44ae89"
};

// --- 2. KONFIGURASI ADMIN ---
const ADMIN_EMAIL = "nafgyzstore@gmail.com"; // Ganti dengan email Google Anda
const ADMIN_PASS = "NAFGYZSTORE123";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

let currentUser = null;
let products = JSON.parse(localStorage.getItem('naf_marketplace_db')) || [];

// --- 3. SISTEM AUTHENTICATION ---
window.loginGoogle = () => {
    signInWithPopup(auth, provider).catch(err => alert("Gagal Login: " + err.message));
};

window.logout = () => {
    if(confirm("Apakah Anda ingin Logout?")) {
        signOut(auth).then(() => location.reload());
    }
};

onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    if (user) {
        currentUser = user;
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        document.getElementById('userPhoto').src = user.photoURL;
        document.getElementById('userName').innerText = user.displayName;
        document.getElementById('userPhoto').onclick = window.logout;
    } else {
        currentUser = null;
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

// --- 4. MANAJEMEN PRODUK (DISPLAY) ---
function renderProducts() {
    const mainBox = document.getElementById('productContainer');
    const bestBox = document.getElementById('bestSellerContainer');
    const adminBox = document.getElementById('adminProductList');
    
    if(!mainBox || !bestBox || !adminBox) return;

    mainBox.innerHTML = '';
    bestBox.innerHTML = '';
    adminBox.innerHTML = '';

    products.forEach(p => {
        // Render Produk Terlaris (Horizontal - Kanan ke Kiri)
        if (p.best) {
            bestBox.innerHTML += `
                <div class="best-seller-card product-item" data-name="${p.name.toLowerCase()}">
                    <img src="${p.img}" class="w-20 h-20 mx-auto object-contain bg-white rounded-xl mb-3 p-1">
                    <h4 class="font-bold text-[11px] truncate uppercase text-white">${p.name}</h4>
                    <p class="text-blue-400 font-black text-xs mb-3">${p.price}</p>
                    <button onclick="openBuyModal()" class="w-full bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition">ORDER</button>
                </div>
            `;
        }

        // Render Produk Biasa (Vertical - Atas ke Bawah)
        mainBox.innerHTML += `
            <div class="item-card product-item" data-name="${p.name.toLowerCase()}">
                <div class="w-20 h-20 bg-gray-50 rounded-2xl p-2 flex-shrink-0">
                    <img src="${p.img}" class="w-full h-full object-contain">
                </div>
                <div class="flex-1">
                    <h3 class="font-black text-sm text-gray-800 uppercase leading-tight">${p.name}</h3>
                    <p class="text-blue-600 font-extrabold text-sm mb-2">${p.price}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-gray-400 italic">STOK: ${p.stock}</span>
                        <button onclick="openBuyModal()" class="bg-black text-white px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-600 transition uppercase">Beli</button>
                    </div>
                </div>
            </div>
        `;

        // Render List di Admin Panel
        adminBox.innerHTML += `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div class="flex flex-col">
                    <span class="text-xs font-bold">${p.name}</span>
                    <span class="text-[9px] text-blue-500 font-bold">${p.best ? 'Bestseller ⭐' : 'Normal Item'}</span>
                </div>
                <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700 transition"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    });
    localStorage.setItem('naf_marketplace_db', JSON.stringify(products));
}

// --- 5. FUNGSI PENCARIAN ---
window.searchProduct = () => {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let items = document.querySelectorAll('.product-item');
    let found = false;
    items.forEach(item => {
        if (item.getAttribute('data-name').includes(input)) {
            item.style.display = item.classList.contains('best-seller-card') ? "block" : "flex";
            found = true;
        } else { 
            item.style.display = "none"; 
        }
    });
    document.getElementById('noProduct').classList.toggle('hidden', found);
};

// --- 6. ADMIN CONTROL (DENGAN VERIFIKASI EMAIL GOOGLE) ---
window.openAdmin = () => {
    // Cek Login
    if (!currentUser) {
        alert("Akses Ditolak: Silahkan Login dengan Google!");
        return;
    }

    // Cek Email Admin & Status Verifikasi Email Google
    if (currentUser.email === ADMIN_EMAIL && currentUser.emailVerified === true) {
        
        const passCheck = prompt("SECURITY CHECK\nMasukkan Password Admin:");
        
        if (passCheck === ADMIN_PASS) {
            document.getElementById('adminPanel').style.display = "block";
            document.getElementById('dropdownMenu').classList.add('hidden');
        } else {
            alert("Password Salah!");
        }

    } else {
        alert("AKSES DITOLAK!\nAkun " + currentUser.email + " tidak diizinkan masuk.");
    }
};

window.addProduct = () => {
    const name = document.getElementById('pName').value;
    const img = document.getElementById('pImg').value || 'https://via.placeholder.com/100';
    const stock = document.getElementById('pStock').value;
    const price = document.getElementById('pPrice').value;
    const best = document.getElementById('pBestSeller').checked;

    if (name && price) {
        products.push({ id: Date.now(), name, img, stock, price, best });
        renderProducts();
        alert("Berhasil!");
        // Reset Form
        document.getElementById('pName').value = '';
        document.getElementById('pImg').value = '';
        document.getElementById('pStock').value = '';
        document.getElementById('pPrice').value = '';
        document.getElementById('pBestSeller').checked = false;
    } else {
        alert("Nama dan Harga harus diisi.");
    }
};

window.deleteProduct = (id) => {
    if(confirm('Hapus produk ini?')) {
        products = products.filter(p => p.id !== id);
        renderProducts();
    }
};

// --- 7. LOGIKA MODAL WELCOME ---
window.closeWelcomeTemp = () => {
    document.getElementById('welcomeModal').classList.add('hidden');
};

window.closeWelcomePermanen = () => {
    document.getElementById('welcomeModal').classList.add('hidden');
    localStorage.setItem('naf_hide_welcome_permanen', 'true');
};

function checkWelcomeModal() {
    const isHiddenPermanen = localStorage.getItem('naf_hide_welcome_permanen');
    if (!isHiddenPermanen) {
        document.getElementById('welcomeModal').classList.remove('hidden');
    }
}

// --- 8. UI NAVIGASI ---
window.toggleMenu = () => document.getElementById('dropdownMenu').classList.toggle('hidden');
window.closeAdmin = () => document.getElementById('adminPanel').style.display = "none";
window.openBuyModal = () => document.getElementById('buyModal').classList.remove('hidden');
window.closeBuyModal = () => document.getElementById('buyModal').classList.add('hidden');

// --- INITIALIZE ---
checkWelcomeModal();
renderProducts();
