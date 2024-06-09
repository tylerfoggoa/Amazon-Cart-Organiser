document.addEventListener('DOMContentLoaded', () => {
    let carts = {};

    chrome.storage.sync.get(['carts'], function(result) {
        carts = result.carts || {};

        // Load homepage
        if (document.getElementById('add-cart-btn')) {
            const cartsContainer = document.getElementById('carts-container');
            document.getElementById('add-cart-btn').addEventListener('click', addNewCart);
            loadCarts();

            function loadCarts() {
                cartsContainer.innerHTML = '';
                for (const cartName in carts) {
                    const cartDiv = document.createElement('div');
                    cartDiv.className = 'cart';

                    const cartLink = document.createElement('a');
                    cartLink.href = `cart.html?name=${encodeURIComponent(cartName)}`;
                    cartLink.textContent = `${carts[cartName].emoji || ''} ${cartName}`;
                    
                    const deleteCartBtn = document.createElement('button');
                    deleteCartBtn.textContent = 'Delete';
                    deleteCartBtn.className = 'delete-cart';
                    deleteCartBtn.addEventListener('click', () => deleteCart(cartName));

                    cartDiv.appendChild(cartLink);
                    cartDiv.appendChild(deleteCartBtn);
                    cartsContainer.appendChild(cartDiv);
                }
            }

            function addNewCart() {
                const cartName = prompt('Enter cart name:');
                if (cartName) {
                    carts[cartName] = {products: [] };
                    saveCarts();
                    loadCarts();
                }
            }

            function deleteCart(cartName) {
                if (confirm(`Are you sure you want to delete the cart "${cartName}"?`)) {
                    delete carts[cartName];
                    saveCarts();
                    loadCarts();
                }
            }

            function saveCarts() {
                chrome.storage.sync.set({ carts: carts });
            }
        }

        // Load cart page
        if (document.getElementById('add-product-btn')) {
            const urlParams = new URLSearchParams(window.location.search);
            const cartName = urlParams.get('name');
            const productsContainer = document.getElementById('products-container');
            document.getElementById('cart-title').textContent = `${carts[cartName].emoji || ''} ${cartName}`;
            document.getElementById('add-product-btn').addEventListener('click', addNewProduct);
            loadProducts();

            function loadProducts() {
                productsContainer.innerHTML = '';
                const products = carts[cartName].products || [];
                products.forEach((product, index) => {
                    const productDiv = document.createElement('div');
                    productDiv.className = 'product';
                    
                    const productLink = document.createElement('a');
                    productLink.href = product;
                    productLink.target = '_blank';
                    const productTitle = extractTitle(product);
                    const productEmoji = assignEmoji(productTitle);
                    productLink.textContent = `${productEmoji} ${productTitle}`;
                    productDiv.appendChild(productLink);
                    
                    const deleteProductBtn = document.createElement('button');
                    deleteProductBtn.textContent = 'Remove';
                    deleteProductBtn.className = 'delete-product';
                    deleteProductBtn.addEventListener('click', () => deleteProduct(index));

                    productDiv.appendChild(deleteProductBtn);
                    productsContainer.appendChild(productDiv);
                });
            }

            function addNewProduct() {
                const productLink = prompt('Enter Amazon product link:');
                if (productLink) {
                    carts[cartName].products.push(productLink);
                    saveCarts();
                    loadProducts();
                }
            }

            function deleteProduct(index) {
                if (confirm('Are you sure you want to remove this product?')) {
                    carts[cartName].products.splice(index, 1);
                    saveCarts();
                    loadProducts();
                }
            }

            function saveCarts() {
                chrome.storage.sync.set({ carts: carts });
            }

            function extractTitle(url) {
                const urlObj = new URL(url);
                const pathSegments = urlObj.pathname.split('/');
                for (const segment of pathSegments) {
                    if (segment && !segment.includes('dp')) {
                        return decodeURIComponent(segment.replace(/-/g, ' '));
                    }
                }
                return 'Unknown Product';
            }

            function assignEmoji(title) {
                const emojis = ['📦', '🎁', '🛍️', '🛒', '🔍', '💡', '🔧', '📚', '🎮', '🏷️'];
                const index = title.length % emojis.length;
                return emojis[index];
            }
        }
    });
});

