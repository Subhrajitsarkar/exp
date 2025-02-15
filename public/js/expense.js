async function saveDetails(event) {
    event.preventDefault()
    try {
        let price = event.target.price.value;
        let description = event.target.description.value;
        let category = event.target.category.value;
        let date = new Date().toLocaleDateString('en-GB')
        let obj = { price, description, category, date }
        let response = await axios.post('http://localhost:3000/expense/add-expense', obj)
        if (response.status === 201) {
            document.getElementById('formId').value = '';
            displayExpense()
        }
    }
    catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`
    }
}
async function displayExpense() {
    try {
        let response = await axios.get('http://localhost:3000/expense/get-expense')
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
        await axios.delete(`http://localhost:3000/expense/delete-expense/${id}`);
        displayExpense()
    }
    catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`
    }
}

window.onload = displayExpense