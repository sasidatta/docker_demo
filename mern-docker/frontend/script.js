const form = document.getElementById('userForm');
const responseText = document.getElementById('response');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;

    try {
        const res = await fetch('http://backend:5000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, mobile })
        });
        const data = await res.json();
        responseText.innerText = data.message;
    } catch (err) {
        responseText.innerText = 'Error connecting to server';
    }
});
