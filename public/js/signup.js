async function signup(event) {
    try {
        event.preventDefault();
        let name = document.getElementById('name').value;
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        let obj = { name, email, password }
        let response = await axios.post('http://localhost:3000/user/signup', obj)
        if (response.status === 201) {
            alert(response.data.message)
            window.location.href = '/login';
        }
    }
    catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`
    }
}