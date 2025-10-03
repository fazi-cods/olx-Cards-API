const authControls = document.getElementById('auth-controls');
const signupBtn = document.getElementById('signup-btn');
const signinBtn = document.getElementById('signin-btn');
const sellBtn = document.getElementById('sell-btn');
const productList = document.getElementById('product-list');

const modalContainer = document.getElementById('modal-container');
const authModal = document.getElementById('auth-modal');
const sellModal = document.getElementById('sell-modal');
const detailModal = document.getElementById('detail-modal'); // NEW
const detailContent = document.getElementById('detail-content'); // NEW
const authForm = document.getElementById('auth-form');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const sellForm = document.getElementById('sell-form');

// Global object to store all displayed products for quick detail look-up
const allAvailableProducts = {};

// --- 1. State Management (Simulated Auth) ---
checkAuthStatus();

function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        sellBtn.disabled = false;
        authControls.innerHTML = `
            <div class="profile-details">
                <strong>Hello, ${user.name}</strong> (${user.email})
                <button id="signout-btn">Sign Out</button>
            </div>
        `;
        document.getElementById('signout-btn').addEventListener('click', handleSignOut);
    } else {
        sellBtn.disabled = true;
        authControls.innerHTML = '';
        authControls.appendChild(signupBtn);
        authControls.appendChild(signinBtn);
    }
}

function handleSignOut() {
    localStorage.removeItem('currentUser');
    checkAuthStatus();
}

// --- 2. Modal and Auth Handlers ---

signupBtn.addEventListener('click', () => showAuthModal('signup'));
signinBtn.addEventListener('click', () => showAuthModal('signin'));

function showAuthModal(mode) {
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';

    if (mode === 'signup') {
        authModal.querySelector('h3').textContent = 'Sign Up (New Account)';
        authSubmitBtn.textContent = 'Sign Up';
        authForm.dataset.mode = 'signup';
    } else {
        authModal.querySelector('h3').textContent = 'Sign In (Existing User)';
        authSubmitBtn.textContent = 'Sign In';
        authForm.dataset.mode = 'signin';
    }

    authModal.classList.remove('hidden');
    sellModal.classList.add('hidden');
    detailModal.classList.add('hidden'); // Ensure detail modal is hidden
    modalContainer.classList.remove('hidden');
}

document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => modalContainer.classList.add('hidden'));
});

// Simplified Auth Logic (Remains the same)
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const mode = authForm.dataset.mode;

    if (mode === 'signup') {
        localStorage.setItem('registeredUser', JSON.stringify({ email: email, name: email.split('@')[0], password: password }));
        alert('Signup Successful! Please Sign In.');
    }

    if (mode === 'signin') {
        const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));

        if (registeredUser && registeredUser.email === email && registeredUser.password === password) {
            localStorage.setItem('currentUser', JSON.stringify({ email: registeredUser.email, name: registeredUser.name }));
            alert('Sign In Successful!');
            modalContainer.classList.add('hidden');
            checkAuthStatus();
        } else {
            alert('Invalid credentials or user not registered.');
        }
    }
});

// --- 3. Sell Product Form Handler ---

sellBtn.addEventListener('click', () => {
    if (sellBtn.disabled) return;

    sellForm.reset();

    sellModal.classList.remove('hidden');
    authModal.classList.add('hidden');
    detailModal.classList.add('hidden'); // Ensure detail modal is hidden
    modalContainer.classList.remove('hidden');
});

sellForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('ad-title').value.trim();
    const description = document.getElementById('ad-description').value.trim();
    const price = document.getElementById('ad-price').value.trim();
    const imageUrl = document.getElementById('ad-image-url').value.trim();

    if (!title || !description || !price || !imageUrl) {
        alert('All fields (Title, Description, Price, Image URL) are required!');
        return;
    }

    const newAd = {
        // We use a timestamp for a unique ID for user ads
        id: 'user-' + Date.now(),
        title: title,
        description: description,
        price: parseFloat(price),
        thumbnail: imageUrl,
        images: [imageUrl], // Add full image array for detail view
        isUserAd: true
    };

    let userAds = JSON.parse(localStorage.getItem('userAds')) || [];
    userAds.unshift(newAd);
    localStorage.setItem('userAds', JSON.stringify(userAds));

    alert('Ad Posted Successfully!');
    modalContainer.classList.add('hidden');

    renderProducts();
});


// --- 4. Product Detail Handler (NEW) ---

function showProductDetails(productId) {
    const product = allAvailableProducts[productId];

    if (!product) {
        alert('Product details not found.');
        return;
    }

    // Populate the detail modal
    detailContent.innerHTML = `
        <h2>${product.title}</h2>
        <div style="text-align: center;">
            <img src="${product.images ? product.images[0] : product.thumbnail}" 
                 alt="${product.title}" 
                 style="max-height: 350px; object-fit: contain;">
        </div>
        <p><strong>Price: PKR ${product.price}</strong></p>
        <p><strong>Description:</strong> ${product.description}</p>
        ${product.brand ? `<p><strong>Brand:</strong> ${product.brand}</p>` : ''}
        ${product.category ? `<p><strong>Category:</strong> ${product.category}</p>` : ''}
    `;

    // Show the modal
    detailModal.classList.remove('hidden');
    authModal.classList.add('hidden');
    sellModal.classList.add('hidden');
    modalContainer.classList.remove('hidden');
}


// --- 5. Product Fetching and Rendering ---

async function fetchProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=32');
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error fetching dummyjson products:', error);
        return [];
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.dataset.productId = product.id; // Store the product ID on the element

    // Make the card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showProductDetails(product.id));

    const adMarker = product.isUserAd ? '<span style="color: green; font-weight: bold;">[User Ad]</span>' : '';

    card.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=No+Image';">
        <div>
            <h3>${adMarker} ${product.title}</h3>
            <p><strong>Price: PKR ${product.price}</strong></p>
            <p>${product.description.substring(0, 100)}...</p>
        </div>
    `;
    return card;
}

async function renderProducts() {
    productList.innerHTML = '<h2></h2>';

    // Clear global product storage
    for (const key in allAvailableProducts) {
        delete allAvailableProducts[key];
    }

    // 1. Get User-Posted Ads
    const userAds = JSON.parse(localStorage.getItem('userAds')) || [];

    // 2. Fetch Dummy JSON Products
    const apiProducts = await fetchProducts();

    // 3. Combine and Display
    const allProducts = [...userAds, ...apiProducts];

    if (allProducts.length === 0) {
        productList.innerHTML += '<p>No products to display.</p>';
    } else {
        allProducts.forEach(product => {
            // Store product in global map for quick detail access
            allAvailableProducts[product.id] = product;
            productList.appendChild(createProductCard(product));
        });
    }
}
async function fetchAllProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products');


        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // The product array is inside the 'products' key of the response object
        const products = data.products;

        console.log('Successfully fetched products:', products);
        return products;

    } catch (error) {
        console.error('Error fetching data from DummyJSON:', error);
        return []; // Return an empty array on failure
    }
}

// Call the function to test it
fetchAllProducts();

// Initial product load
renderProducts();