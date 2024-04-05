let baseURL = 'https://domdimabot.com/';

async function login() {
    let token = null;

    token = sessionStorage.getItem('token');

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
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('name');
            sessionStorage.removeItem('id');
            sessionStorage.removeItem('email');
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
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('name', user.login);
            sessionStorage.setItem('id', user.id);
            sessionStorage.setItem('email', user.email);
            window.location.href = baseURL + 'dashboard';
        } else {
            alert('There was a problem with your login, please try again.')
        }


    } else {
        //? Check if userid is in database
        let user = await validateToken(token);

        if (user.error) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('name');
            sessionStorage.removeItem('id');
            sessionStorage.removeItem('email');
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
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('name');
            sessionStorage.removeItem('id');
            sessionStorage.removeItem('email');
            window.location.href = baseURL;
        }

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('name', user.login);
        sessionStorage.setItem('id', user.id);
        sessionStorage.setItem('email', user.email);
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