// Import fungsi yang dibutuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, updateDoc, increment, onSnapshot,addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ==========================================
// MASUKKAN KONFIGURASI FIREBASE ANDA DI SINI
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDJ4hpcaS7FIEzW6QkwPG_pf6yOTJOMCAU",
  authDomain: "perpustakaannesul.firebaseapp.com",
  projectId: "perpustakaannesul",
  storageBucket: "perpustakaannesul.firebasestorage.app",
  messagingSenderId: "853911937189",
  appId: "1:853911937189:web:cea325432a74e62f686d4c",
  measurementId: "G-7C66YGBC6N"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let globalBooks = [];
const bookContainer = document.getElementById('bookContainer');
const popularBooksContainer = document.getElementById('popularBooksContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortOrder = document.getElementById('sortOrder');
const noResults = document.getElementById('noResults');
const loadingIndicator = document.getElementById('loading');
const contentSections = document.querySelectorAll('.content-section');

// Fungsi Global untuk Tombol "Baca Buku" (Tambah counter real-time & buka link web asli)
// Fungsi Global untuk Tombol "Baca Buku" 
window.bacaBuku = async function(bookId, bookTitle, bookLink) {
    try {
        // 1. Tetap catat penambahan jumlah pembaca di database secara real-time
        const bookRef = doc(db, "books", bookId);
        await updateDoc(bookRef, {
            reads: increment(1)
        });

        // 2. Cek apakah link tersedia atau tidak
        if (bookLink && bookLink.trim() !== "" && bookLink.startsWith("http")) {
            // Jika ada link, buka di tab baru
            window.open(bookLink, "_blank");
        } else {
            // Jika link kosong atau tidak valid, arahkan ke halaman peringatan
            window.location.href = "eror/eror.html";
        }
    } catch (error) {
        console.error("Gagal memperbarui pembaca: ", error);
        alert("Terjadi kesalahan saat mencatat aktivitas baca.");
    }
};

// Mengambil Data secara Real-Time menggunakan onSnapshot dari Firestore
onSnapshot(collection(db, "books"), (snapshot) => {
    globalBooks = [];
    snapshot.forEach((doc) => {
        globalBooks.push({ id: doc.id, ...doc.data() });
    });

    // Sembunyikan loading, tampilkan konten utama
    loadingIndicator.classList.add('d-none');
    contentSections.forEach(sec => sec.classList.remove('d-none'));

    // Render ulang tampilan saat data berubah di database
    renderPopularBooks();
    renderCatalog();
}, (error) => {
    console.error("Error mengambil data real-time: ", error);
    loadingIndicator.innerHTML = `<p class="text-danger">Gagal memuat database. Periksa konfigurasi Firebase Anda.</p>`;
});

// Render Buku Populer (Top 4 Berdasarkan Reads Terbanyak)
function renderPopularBooks() {
    const sortedPopular = [...globalBooks].sort((a, b) => b.reads - a.reads).slice(0, 4);
    popularBooksContainer.innerHTML = '';
    
    sortedPopular.forEach(book => {
        popularBooksContainer.innerHTML += `
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card book-card border-0 shadow-sm">
                    <img src="${book.image}" class="card-img-top" alt="${book.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <span class="badge bg-danger mb-2"><i class="bi bi-fire"></i> ${book.reads} Pembaca</span>
                        <h5 class="card-title fs-6 fw-bold text-truncate">${book.title}</h5>
                        <p class="card-text text-muted small mb-0">${book.author}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Render Katalog Utama (Search, Kategori, Sortir Abjad)
function renderCatalog() {
    const keyword = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortOrder.value;

    // 1. Filter Berdasarkan Pencarian & Kategori
    let filtered = globalBooks.filter(book => {
        const matchesKeyword = book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword);
        const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
        return matchesKeyword && matchesCategory;
    });

    // 2. Sortir Berdasarkan Abjad (A-Z atau Z-A)
    filtered.sort((a, b) => {
        if (selectedSort === 'za') {
            return b.title.localeCompare(a.title);
        } else {
            return a.title.localeCompare(b.title); // Default A - Z
        }
    });

    // 3. Render ke HTML
    bookContainer.innerHTML = '';
    if (filtered.length === 0) {
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');
        filtered.forEach(book => {
            bookContainer.innerHTML += `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card book-card border-0 shadow-sm">
                        <img src="${book.image}" class="card-img-top" alt="${book.title}" style="height: 220px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-secondary">${book.category}</span>
                                <small class="text-muted"><i class="bi bi-eye"></i> ${book.reads}</small>
                            </div>
                            <h5 class="card-title fs-6 fw-bold">${book.title}</h5>
                            <p class="card-text text-muted small mb-3">Oleh: ${book.author}</p>
                            <button class="mt-auto btn btn-outline-primary btn-sm w-100" onclick="bacaBuku('${book.id}', '${book.title}', '${book.link}')">
                                <i class="bi bi-book me-1"></i> Baca Buku
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

// Event Listeners untuk Interaksi Form
searchInput.addEventListener('input', renderCatalog);
categoryFilter.addEventListener('change', renderCatalog);
sortOrder.addEventListener('change', renderCatalog);
