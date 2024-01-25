let baseURL = 'https://domdimabot.com/';

async function login() {
    let token = null;

    token = localStorage.getItem('token');

    if (token === null || token === undefined || token === '') {
        token = document.location.hash;

        //! USER DENIED ACCESS
        if (token === '' || token === undefined || token === null) {
            window.location.href = (baseURL);
        }

        token = token.split('&')[0];
        token = token.split('=')[1];

        let user = await validateToken(token);

        if (user.error) {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            localStorage.removeItem('id');
            localStorage.removeItem('email');
            window.location.href = baseURL;
        }

        let userData = {
            name: user.login,
            id: user.id,
            email: user.email,
            action: 'login'
        }

        let response = await fetch(baseURL + 'login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        response = await response.json();

        if (response.saved || response.exists) {
            localStorage.setItem('token', token);
            localStorage.setItem('name', user.login);
            localStorage.setItem('id', user.id);
            localStorage.setItem('email', user.email);
            window.location.href = baseURL + 'dashboard';
        } else {
            alert('There was a problem with your login, please try again.')
        }


    } else {
        //? Check if userid is in database
        let user = await validateToken(token);

        if (user.error) {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            localStorage.removeItem('id');
            localStorage.removeItem('email');
            window.location.href = baseURL;
        }

        let exists = await fetch(baseURL + 'login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: user.login,
                id: user.id,
                email: user.email
            })
        });
        exists = await exists.json();

        if (!exists.exists) {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            localStorage.removeItem('id');
            localStorage.removeItem('email');
            window.location.href = baseURL;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('name', user.login);
        localStorage.setItem('id', user.id);
        localStorage.setItem('email', user.email);
        window.location.href = baseURL + 'dashboard';
    }
}

login();

async function validateToken(token) {

    let response = null;

    let headers = {
        'Authorization': `Bearer ${token}`,
        'Client-Id': 'jl9k3mi67pmrbl1bh67y07ezjdc4cf',
    }

    response = await fetch('https://api.twitch.tv/helix/users', { method: 'get', headers });

    response = await response.json();

    if (response.error) {
        return response;
    }

    return response.data[0];
}