import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase Anda (Sesuaikan dengan milik Anda jika berbeda)
const firebaseConfig = {
  apiKey: "AIzaSyDJ4hpcaS7FIEzW6QkwPG_pf6yOTJOMCAU",
  authDomain: "perpustakaannesul.firebaseapp.com",
  projectId: "perpustakaannesul",
  storageBucket: "perpustakaannesul.firebasestorage.app",
  messagingSenderId: "853911937189",
  appId: "1:853911937189:web:cea325432a74e62f686d4c",
  measurementId: "G-7C66YGBC6N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inisialisasi EmailJS (Daftar gratis di emailjs.com untuk dapatkan Public Key)
(function(){
    emailjs.init("EGnEt86Wu9QKf5pSq"); 
})();

const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('reqName').value;
        const title = document.getElementById('reqTitle').value;
        const author = document.getElementById('reqAuthor').value;
        const category = document.getElementById('reqCategory').value;
        const link = document.getElementById('reqLink').value || 'Tidak ada link';
        const submitBtn = document.getElementById('submitRequestBtn');

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Mengirim...`;

        try {
            // 1. Simpan ke Firebase Database (koleksi book_requests)
            await addDoc(collection(db, "book_requests"), {
                perequest: name,
                title: title,
                author: author,
                category: category,
                link: link,
                createdAt: new Date()
            });

            // 2. Kirim Notifikasi ke Email menggunakan EmailJS
            // Pastikan Anda membuat template email di dashboard EmailJS dengan parameter: 
            // {{from_name}}, {{book_title}}, {{book_author}}, {{category}}, {{link}}
            const emailParams = {
                from_name: name,
                book_title: title,
                book_author: author,
                category: category,
                link: link
            };

            await emailjs.send("service_wegig81", "template_opu59lt", emailParams);

            alert("Berhasil! Usulan buku Anda telah dikirim ke pengelola.");
            requestForm.reset();
            window.location.href = "../index.html"; // Kembali ke halaman utama setelah sukses
            
        } catch (error) {
            console.error("Gagal mengirim request: ", error);
            alert("Terjadi kesalahan saat mengirim usulan. Silakan coba lagi.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-send me-2"></i>Kirim Usulan Buku`;
        }
    });
}