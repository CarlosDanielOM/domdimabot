if (!localStorage.getItem('token')) window.location.href = '/';

const channel = window.location.pathname.split('/')[3];

window.onload = async () => {
    let files = await fetch(`https://domdimabot.com/trigger/files/${channel}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Access-Control-Allow-Origin': '*',
        }
    });

    const data = await files.json();
    files = data.files;

    console.table(files);
};