/* ===== Data produk (contoh) ===== */
const products = [
  { id: 1, name: "Headphone Wireless X1", price: 450000, img: "https://i.pinimg.com/736x/76/9d/84/769d8454f78dabe81ec54e51fea6d156.jpg", seller: "AudioStore", rating: 4.5 },
  { id: 2, name: "Sneakers", price: 350000, img: "https://i.pinimg.com/736x/45/97/ce/4597ce88c61061d40d176fa9bead608c.jpg", seller: "Sportindo", rating: 4.6 },
  { id: 3, name: "Blender Dapur", price: 275000, img: "https://i.pinimg.com/1200x/92/8e/44/928e44a74a7a0431b74d5301a0537d83.jpg", seller: "HomeGear", rating: 4.7 },
  { id: 4, name: "Tas Selempang", price: 150000, img: "https://i.pinimg.com/736x/37/39/b9/3739b9cb5a290122e79192324ad7c580.jpg", seller: "BagHouse", rating: 4.2 },
  { id: 5, name: "Smartwatch", price: 520000, img: "https://i.pinimg.com/1200x/30/31/d5/3031d56c15c8596052f306b011c8d7dc.jpg", seller: "GadgetHub", rating: 4.3 }
];

let cart = []; // {id, qty}

/* ===== Helper: format rupiah ===== */
function formatRupiah(n){
  return 'Rp' + n.toLocaleString('id-ID');
}

/* ===== Render produk ke grid ===== */
const productGrid = document.getElementById('productGrid');
const productCount = document.getElementById('productCount');

function renderProducts(list){
  productGrid.innerHTML = '';
  productCount.textContent = list.length;
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb" style="background-image:url('${p.img}')"></div>
      <div class="product-body">
        <h5 class="product-title">${p.name}</h5>
        <p class="product-seller">Toko: ${p.seller}</p>
        <div class="product-meta">
          <span class="price">${formatRupiah(p.price)}</span>
          <span class="rating">${p.rating} ★</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-outline" data-id="${p.id}" onclick="viewProduct(${p.id})">Lihat</button>
          <button class="btn btn-primary" data-id="${p.id}" onclick="addToCart(${p.id})">Tambah ke Keranjang</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

/* ===== Search & Sort ===== */
document.getElementById('searchInput').addEventListener('input', function(){
  const keyword = this.value.trim().toLowerCase();
  let filtered = products.filter(p => p.name.toLowerCase().includes(keyword) || p.seller.toLowerCase().includes(keyword));
  renderProducts(filtered);
});

document.getElementById('sortSelect').addEventListener('change', function(){
  const val = this.value;
  let copy = [...products];
  if(val === 'price-asc') copy.sort((a,b)=>a.price-b.price);
  else if(val === 'price-desc') copy.sort((a,b)=>b.price-a.price);
  renderProducts(copy);
});

/* ===== Cart UI ===== */
const cartToggle = document.getElementById('cartToggle');
const cartPanel = document.getElementById('cartPanel');
const cartCountEl = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartEmptyEl = document.getElementById('cartEmpty');
const cartSummaryEl = document.querySelector('.cart-summary');
const subtotalText = document.getElementById('subtotalText');
const addressInput = document.getElementById('address');
const paymentInstructions = document.getElementById('paymentInstructions');
const orderResult = document.getElementById('orderResult');
const checkoutBtn = document.getElementById('checkoutBtn');

cartToggle.addEventListener('click', () => {
  cartPanel.classList.toggle('open');
});

/* Add to cart */
function addToCart(id){
  const found = cart.find(c => c.id === id);
  if(found) found.qty++;
  else cart.push({id, qty:1});
  updateCartUI();
  flashMessage('Produk ditambahkan ke keranjang');
}

/* Update cart UI */
function updateCartUI(){
  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartEmptyEl.classList.remove('hidden');
    cartSummaryEl.classList.add('hidden');
    orderResult.classList.add('hidden');
  } else {
    cartEmptyEl.classList.add('hidden');
    cartSummaryEl.classList.remove('hidden');
    orderResult.classList.add('hidden');
  }

  let subtotal = 0;
  cart.forEach(item => {
    const prod = products.find(p => p.id === item.id);
    const row = document.createElement('li');
    row.className = 'cart-item';
    const itemTotal = prod.price * item.qty;
    subtotal += itemTotal;
    row.innerHTML = `
      <div class="item-thumb" style="background-image:url('${prod.img}')"></div>
      <div class="item-info">
        <h4>${prod.name}</h4>
        <div class="item-meta">
          <div class="qty-control">
            <button onclick="changeQty(${prod.id}, -1)">-</button>
            <div>${item.qty}</div>
            <button onclick="changeQty(${prod.id}, 1)">+</button>
          </div>
          <div style="margin-left:auto;font-weight:700">${formatRupiah(itemTotal)}</div>
        </div>
        <div style="margin-top:8px">
          <button class="remove-btn" onclick="removeItem(${prod.id})">Hapus</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  subtotalText.textContent = formatRupiah(subtotal);
  cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  // update payment instructions based on selected payment
  updatePaymentInstructions();
}

/* change qty */
function changeQty(id, delta){
  const it = cart.find(c => c.id === id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
  updateCartUI();
}

/* remove item */
function removeItem(id){
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

/* update payment instructions */
function updatePaymentInstructions(){
  const selected = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
  const subtotal = cart.reduce((s,i)=> s + (products.find(p=>p.id===i.id).price * i.qty), 0);
  let html = '';
  if(selected === 'cod'){
    html = `<strong>COD:</strong> Bayar saat barang diterima. Pastikan alamat lengkap dan nomor telepon benar.`;
  } else if(selected === 'transfer'){
    html = `<strong>Transfer Bank:</strong>
      <p>Silakan transfer sebesar <strong>${formatRupiah(subtotal)}</strong> ke rekening berikut:</p>
      <ul>
        <li>Bank: BCA</li>
        <li>Nomor Rekening: 123-456-7890</li>
        <li>Nama: Mini Marketplace</li>
      </ul>
      <p>Setelah transfer, simpan bukti dan unggah/konfirmasi melalui layanan pelanggan.</p>`;
  } else if(selected === 'ewallet'){
    html = `<strong>E-Wallet:</strong>
      <p>Silakan bayar sebesar <strong>${formatRupiah(subtotal)}</strong> melalui e-wallet (OVO/GoPay/Dana):</p>
      <ul>
        <li>ID E-Wallet / Nomor: 0812-3456-7890 (MiniMarketplace)</li>
      </ul>
      <p>Setelah pembayaran, simpan bukti dan konfirmasi untuk memproses pesanan.</p>`;
  }
  paymentInstructions.innerHTML = html;
}

/* listen change payment radio */
document.querySelectorAll('input[name="payment"]').forEach(r => {
  r.addEventListener('change', updatePaymentInstructions);
});

/* Checkout */
checkoutBtn.addEventListener('click', () => {
  if(cart.length === 0){
    alert('Keranjang kosong');
    return;
  }
  const address = addressInput.value.trim();
  if(address.length < 10){
    alert('Isi alamat pengiriman lengkap (minimal 10 karakter).');
    addressInput.focus();
    return;
  }

  const payment = document.querySelector('input[name="payment"]:checked').value;
  // Simulasikan pemesanan (tanpa backend)
  const order = {
    id: 'INV' + Date.now(),
    items: cart.map(i => ({...i})),
    subtotal: cart.reduce((s,i)=> s + (products.find(p=>p.id===i.id).price * i.qty), 0),
    address,
    payment,
    date: new Date().toLocaleString()
  };

  // tampilkan ringkasan
  orderResult.classList.remove('hidden');
  orderResult.innerHTML = `
    <h4>Pesanan Diterima</h4>
    <p>ID Pesanan: <strong>${order.id}</strong></p>
    <p>Tanggal: ${order.date}</p>
    <p>Metode Pembayaran: <strong>${payment.toUpperCase()}</strong></p>
    <p>Alamat: ${order.address.replace(/\n/g,'<br/>')}</p>
    <p>Subtotal: <strong>${formatRupiah(order.subtotal)}</strong></p>
    <p style="margin-top:10px;color:green">Instruksi pembayaran (jika ada) disediakan di bawah.</p>
  `;

  // tampilkan instruksi pembayaran akhir
  updatePaymentInstructions();
  orderResult.innerHTML += `<div style="margin-top:12px">${paymentInstructions.innerHTML}</div>`;

  // kosongkan keranjang (simulasi)
  cart = [];
  updateCartUI();
  // scroll ke result
  orderResult.scrollIntoView({behavior:'smooth'});
  flashMessage('Order berhasil dibuat — cek ringkasan di panel keranjang');
});

/* view product (simple) */
function viewProduct(id){
  const p = products.find(x=>x.id===id);
  alert(`${p.name}\nHarga: ${formatRupiah(p.price)}\nToko: ${p.seller}\nRating: ${p.rating} ★`);
}

/* flash message helper (simple) */
function flashMessage(text){
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.right = '18px';
  el.style.bottom = '18px';
  el.style.background = '#0f6cff';
  el.style.color = '#fff';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.boxShadow = '0 8px 24px rgba(15,20,38,0.15)';
  el.style.zIndex = 9999;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 2200);
}

/* initial render */
renderProducts(products);
updateCartUI();
updatePaymentInstructions();
