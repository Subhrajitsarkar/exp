async function saveDetails(event) {
    event.preventDefault();
    try {
        let token = localStorage.getItem('token');
        console.log('Token in saveDetails:', token);
        if (!token) {
            alert('user is not authenticated');
            return;
        }
        let date = new Date().toLocaleDateString('en-GB');
        let price = event.target.price.value;
        let description = event.target.description.value;
        let category = event.target.category.value;

        let obj = { date, price, description, category };
        let response = await axios.post('http://localhost:3000/expense/add-expense', obj, { headers: { Authorization: token } });
        if (response.status === 201) {
            document.getElementById('formId').reset();
            displayExpense();
        }
    } catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`;
    }
}

async function displayExpense() {
    try {
        let token = localStorage.getItem('token');
        console.log('Token in displayExpense:', token);
        if (!token) {
            alert('user is not authenticated');
            return;
        }
        let response = await axios.get('http://localhost:3000/expense/get-expense', { headers: { Authorization: token } });
        let show = document.getElementById('ulId');
        show.innerHTML = '';
        let display = response.data.data;
        display.forEach((user) => {
            show.innerHTML += `<li>${user.price} - ${user.description} - ${user.category} - ${user.date}
            <button onclick='deleteExpense("${user.id}")'>Delete</button></li>`;
        });
    } catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`;
    }
}

async function deleteExpense(id) {
    try {
        let token = localStorage.getItem('token');
        console.log('Token in deleteExpense:', token);
        if (!token) {
            alert('user is not authenticated');
            return;
        }
        await axios.delete(`http://localhost:3000/expense/delete-expense/${id}`, { headers: { Authorization: token } });
        displayExpense();
    } catch (err) {
        document.body.innerHTML += `<div>${err.message}</div>`;
    }
}



document.getElementById('buy-premium').onclick = async function (event) {
    event.preventDefault();
    try {
        console.log('Buy premium button clicked');
        let token = localStorage.getItem('token');
        console.log('Token before purchase:', token);
        if (!token) {
            alert('user is not authenticated');
            return;
        }
        const response = await axios.get('http://localhost:3000/razorpay/premiummembership', { headers: { Authorization: token } });
        console.log('Razorpay response:', response);
        const options = {
            key: response.data.key_id,
            order_id: response.data.order.id,
            handler: async function (paymentResponse) {
                try {
                    const result = await axios.post(
                        'http://localhost:3000/razorpay/updatetransactionstatus',
                        {
                            order_id: response.data.order.id,
                            payment_id: paymentResponse.razorpay_payment_id
                        },
                        { headers: { Authorization: token } }
                    );
                    alert('You are now a premium user!');
                    document.getElementById('message').innerHTML = 'Premium user activated';
                    document.getElementById('buy-premium').style.display = 'none';
                    localStorage.setItem('token', result.data.token);
                } catch (error) {
                    console.error('Transaction update failed:', error);
                    alert('Payment successful but update failed. Contact support.');
                }
            }
        };
        let rzp1 = new Razorpay(options);
        rzp1.open();

        rzp1.on('payment failed', function (response) {
            console.log('payment failed', response);
            alert('payment failed');
        });
    } catch (err) {
        console.error("Error in Razorpay integration:", err.message);
    }
};


// Add this helper function to decode JWT tokens.
function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function checkPremiumStatus() {
    let token = localStorage.getItem('token');
    if (token) {
        try {
            const parsed = parseJwt(token);
            if (parsed.ispremiumuser) {
                document.getElementById('buy-premium').style.display = 'none';
                document.getElementById('message').innerHTML = 'Premium user activated';
            }
        } catch (err) {
            console.error('Failed to parse token:', err);
        }
    }
}


window.onload = function () {
    checkPremiumStatus();
    displayExpense();
};