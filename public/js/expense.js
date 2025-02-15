async function saveDetails(event) {
    event.preventDefault()
    try {
        let token = localStorage.getItem('token')
        if (!token) {
            alert('user is not authenticated');
            return;
        }
        let date = new Date().toLocaleDateString('en-GB')
        let price = event.target.price.value;
        let description = event.target.description.value;
        let category = event.target.category.value;

        let obj = { date, price, description, category }
        let response = await axios.post('http://localhost:3000/expense/add-expense', obj, { headers: { Authorization: token } })
        if (response.status === 201) {
            document.getElementById('formId').reset();
            displayExpense()
        }
    }
    catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`
    }
}
async function displayExpense() {
    try {
        let token = localStorage.getItem('token')
        if (!token) {
            alert('user is not authenticated');
            return;
        }
        let response = await axios.get('http://localhost:3000/expense/get-expense', { headers: { Authorization: token } })
        let show = document.getElementById('ulId');
        show.innerHTML = '';
        let display = response.data.data;
        display.forEach((user) => {
            show.innerHTML += `<li>${user.price} - ${user.description} - ${user.category} - ${user.date}
            <button onclick='deleteExpense("${user.id}")'>Delete</button></li>`
        })
    }
    catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`
    }
}
async function deleteExpense(id) {
    try {
        let token = localStorage.getItem('token')
        if (!token) {
            alert('user is not authenticated');
            return;
        }
        await axios.delete(`http://localhost:3000/expense/delete-expense/${id}`, { headers: { Authorization: token } });
        displayExpense()
    }
    catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`
    }
}

window.onload = displayExpense