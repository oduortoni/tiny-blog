const API_BASE = '/api';
let currentToken = localStorage.getItem('token');
let editingPostId = null;

// Simple Markdown to HTML converter
function convertMarkdown(markdown) {
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    if (currentToken) {
        showAuthenticatedUI();
        showSection('blogs');
        loadBlogs();
    } else {
        showSection('login');
    }
});

// Authentication functions
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mail: email, pass: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.apikey;
            localStorage.setItem('token', currentToken);
            showAuthenticatedUI();
            showSection('blogs');
            loadBlogs();
            document.getElementById('loginError').textContent = '';
        } else {
            document.getElementById('loginError').textContent = data.message || 'Login failed';
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Network error';
    }
}

async function register(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mail: email, pass: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentToken = data.apikey;
            localStorage.setItem('token', currentToken);
            showAuthenticatedUI();
            showSection('blogs');
            loadBlogs();
            document.getElementById('registerError').textContent = '';
        } else {
            document.getElementById('registerError').textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        document.getElementById('registerError').textContent = 'Network error';
    }
}

function logout() {
    currentToken = null;
    localStorage.removeItem('token');
    showUnauthenticatedUI();
    showSection('login');
}

// UI functions
function showAuthenticatedUI() {
    document.getElementById('loginLink').classList.add('hidden');
    document.getElementById('registerLink').classList.add('hidden');
    document.getElementById('createLink').classList.remove('hidden');
    document.getElementById('logoutLink').classList.remove('hidden');
}

function showUnauthenticatedUI() {
    document.getElementById('loginLink').classList.remove('hidden');
    document.getElementById('registerLink').classList.remove('hidden');
    document.getElementById('createLink').classList.add('hidden');
    document.getElementById('logoutLink').classList.add('hidden');
}

function showSection(section) {
    console.log('showSection called with:', section);
    document.querySelectorAll('.card, #blogsSection, #showSection').forEach(el => el.classList.add('hidden'));
    
    switch(section) {
        case 'login':
            document.getElementById('loginSection').classList.remove('hidden');
            break;
        case 'register':
            document.getElementById('registerSection').classList.remove('hidden');
            break;
        case 'create':
            document.getElementById('createSection').classList.remove('hidden');
            document.getElementById('formTitle').textContent = 'Create New Post';
            clearForm();
            break;
        case 'blogs':
            document.getElementById('blogsSection').classList.remove('hidden');
            break;
        case 'show':
            const showElement = document.getElementById('showSection');
            console.log('Show element found:', showElement);
            if (showElement) {
                showElement.classList.remove('hidden');
            }
            break;
    }
}

// Blog functions
async function loadBlogs() {
    try {
        console.log('Loading blogs from:', `${API_BASE}/page`);
        const response = await fetch(`${API_BASE}/page`);
        const blogs = await response.json();
        console.log('Blogs loaded:', blogs);
        
        const blogsList = document.getElementById('blogsList');
        blogsList.innerHTML = '';
        
        if (blogs.length === 0) {
            blogsList.innerHTML = '<p>No blog posts found.</p>';
            return;
        }
        
        blogs.forEach(blog => {
            const blogCard = document.createElement('div');
            blogCard.className = 'card';
            blogCard.innerHTML = `
                <h3><a href="#" onclick="showPost('${blog._id}')" style="color: #007bff; text-decoration: none;">${blog.title || 'Untitled'}</a></h3>
                <div class="blog-meta">
                    Type: ${blog.type || 'post'} | 
                    Section: ${blog.section || 'N/A'} | 
                    Created: ${new Date(blog.created_at).toLocaleDateString()}
                    ${blog.post?.author ? ` | Author: ${blog.post.author}` : ''}
                </div>
                <p>${blog.post?.perex || blog.description || 'No description available'}</p>
                ${blog.post?.tags ? `<p><strong>Tags:</strong> ${blog.post.tags.join(', ')}</p>` : ''}
                ${currentToken ? `
                <div class="card-actions">
                    <button class="btn" onclick="editPost('${blog._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deletePost('${blog._id}')">Delete</button>
                </div>
                ` : ''}
            `;
            blogsList.appendChild(blogCard);
        });
    } catch (error) {
        document.getElementById('blogsList').innerHTML = '<p>Error loading blogs</p>';
    }
}

async function savePost(event) {
    event.preventDefault();
    
    const postData = {
        title: document.getElementById('postTitle').value,
        url: document.getElementById('postUrl').value,
        type: document.getElementById('postType').value,
        section: document.getElementById('postSection').value,
        md_content: document.getElementById('postContent').value,
        visible: document.getElementById('postVisible').checked ? 1 : 0,
        perex: document.getElementById('postPerex').value,
        author: document.getElementById('postAuthor').value,
        tags: document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    try {
        const url = editingPostId ? `${API_BASE}/page/${editingPostId}` : `${API_BASE}/page`;
        const method = editingPostId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': currentToken
            },
            body: JSON.stringify(postData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('createSuccess').textContent = editingPostId ? 'Post updated successfully!' : 'Post created successfully!';
            document.getElementById('createError').textContent = '';
            setTimeout(() => {
                showSection('blogs');
                loadBlogs();
            }, 1500);
        } else {
            document.getElementById('createError').textContent = data.message || 'Save failed';
        }
    } catch (error) {
        document.getElementById('createError').textContent = 'Network error';
    }
}

async function showPost(postId) {
    try {
        console.log('Loading post:', postId);
        const response = await fetch(`${API_BASE}/page/${postId}`);
        console.log('Response status:', response.status);
        const post = await response.json();
        console.log('Post data:', post);
        
        const postContent = document.getElementById('showPostContent');
        if (!postContent) {
            console.error('postContent element not found');
            return;
        }
        
        const content = `
            <h1>${post.title || 'Untitled'}</h1>
            <div class="blog-meta" style="margin-bottom: 1rem;">
                Type: ${post.type || 'post'} | 
                Section: ${post.section || 'N/A'} | 
                Created: ${new Date(post.created_at).toLocaleDateString()}
                ${post.post?.author ? ` | Author: ${post.post.author}` : ''}
            </div>
            ${post.post?.perex ? `<p><em>${post.post.perex}</em></p>` : ''}
            ${post.post?.tags ? `<p><strong>Tags:</strong> ${post.post.tags.join(', ')}</p>` : ''}
            <div style="margin-top: 2rem; line-height: 1.8;">
                ${post.md_content ? convertMarkdown(post.md_content) : post.raw_content || 'No content available'}
            </div>
        `;
        
        console.log('Calling showSection(show)');
        showSection('show');
        
        console.log('Setting content:', content);
        console.log('postContent element:', postContent);
        postContent.innerHTML = content;
        console.log('postContent after setting innerHTML:', postContent.innerHTML);
    } catch (error) {
        alert('Error loading post');
    }
}

async function editPost(postId) {
    try {
        const response = await fetch(`${API_BASE}/page/${postId}`);
        const post = await response.json();
        
        editingPostId = postId;
        document.getElementById('formTitle').textContent = 'Edit Post';
        
        document.getElementById('postTitle').value = post.title || '';
        document.getElementById('postUrl').value = post.url || '';
        document.getElementById('postType').value = post.type || 'post';
        document.getElementById('postSection').value = post.section || '';
        document.getElementById('postContent').value = post.md_content || '';
        document.getElementById('postVisible').checked = post.visible === 1;
        document.getElementById('postPerex').value = post.post?.perex || '';
        document.getElementById('postAuthor').value = post.post?.author || '';
        document.getElementById('postTags').value = post.post?.tags ? post.post.tags.join(', ') : '';
        
        showSection('create');
    } catch (error) {
        alert('Error loading post for editing');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/page/${postId}`, {
            method: 'DELETE',
            headers: { 'x-access-token': currentToken }
        });
        
        if (response.ok) {
            loadBlogs();
        } else {
            alert('Delete failed');
        }
    } catch (error) {
        alert('Network error');
    }
}

function cancelEdit() {
    editingPostId = null;
    showSection('blogs');
}

function clearForm() {
    editingPostId = null;
    document.getElementById('postTitle').value = '';
    document.getElementById('postUrl').value = '';
    document.getElementById('postType').value = 'post';
    document.getElementById('postSection').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postVisible').checked = true;
    document.getElementById('postPerex').value = '';
    document.getElementById('postAuthor').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('createError').textContent = '';
    document.getElementById('createSuccess').textContent = '';
}