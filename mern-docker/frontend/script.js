// Get form and response elements
const form = document.getElementById('userForm');
const responseText = document.getElementById('response');

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;

    // Show submitting message
    responseText.innerText = 'Submitting...';

    try {
        // POST request to backend using MiniPC IP
        const res = await fetch('http://192.168.0.174:5000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, mobile })
        });

        const data = await res.json();
        responseText.innerText = data.message;

        // Optionally clear the form
        form.reset();
    } catch (err) {
        console.error(err);
        responseText.innerText = 'Error connecting to server';
    }
});

// Optional: fetch all users on page load
async function fetchUsers() {
    try {
        const res = await fetch('http://192.168.0.174:5000/users');
        const users = await res.json();

        const usersList = document.getElementById('usersList');
        usersList.innerHTML = users.map(u => `<li>${u.email} - ${u.mobile}</li>`).join('');
    } catch (err) {
        console.error(err);
    }
}

// Call fetchUsers when page loads
window.addEventListener('DOMContentLoaded', fetchUsers);
