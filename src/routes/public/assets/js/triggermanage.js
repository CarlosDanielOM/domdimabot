// if (!localStorage.getItem('token')) window.location.href = '/';

const channel = window.location.pathname.split('/')[3];

const fileUploadForm = document.getElementById('fileUploadForm');
const alertContainer = document.getElementById('alertContainer');
const mediaContainer = document.getElementById('mediaContainer');

const fileInput = document.getElementById('file');

const uploadFileBtn = document.getElementById('uploadFileBtn');

uploadFileBtn.addEventListener('click', async () => {
    document.getElementById('uploadContainer').style.display = 'flex';
});

fileUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let fileNameInput = document.getElementById('triggerName');
    if (fileInput.files.length === 0) return createAlert('Please select a file', 'error');
    if (fileInput.files[0].size > 500000) return createAlert('File size should not exceed 5MB', 'error');

    if (fileNameInput.textContent == '') return createAlert('Please enter a valid File Name', 'error');

    const formData = new FormData(fileUploadForm);
    const response = await fetch(`https://domdimabot.com/trigger/upload/${channel}`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();

    if (data.error) {
        return createAlert(data.message, 'error');
    }

    createAlert(data.message, 'success');
    createFileView(data.file);
    document.getElementById('uploadContainer').style.display = 'none';
    fileUploadForm.reset();

});

document.getElementById('exitUpload').addEventListener('click', () => {
    document.getElementById('uploadContainer').style.display = 'none';
});

window.onload = async () => {

    fileInput.addEventListener('change', async (e) => {
        let selectedFile = e.target.files[0];
        document.getElementById('submitBtn').disabled = false;
        let fileUrl = window.URL.createObjectURL(selectedFile);
        document.getElementById('videoPreview').src = fileUrl;
        document.getElementById('videoElement').load();
        document.getElementById('fileSize').innerText = `File size: ${(e.target.files[0].size / 1024 / 1024).toFixed(2)} MB`;
    });
    let files = await fetch(`https://domdimabot.com/trigger/files/${channel}`);

    const data = await files.json();
    files = data.files;

    console.log(files);

    for (let file in files) {
        createFileView(files[file]);
    }

};

function createAlert(message, type) {
    const alert = document.createElement('div');
    const paragraph = document.createElement('p');
    alert.classList.add('alert', `alert-${type}`);
    paragraph.innerText = message;
    alert.appendChild(paragraph);
    alertContainer.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function createFileView(file) {
    const mediaCon = document.createElement('div');
    const headerContainer = document.createElement('div');
    const contentContainer = document.createElement('div');
    const videoElement = document.createElement('video');
    const sourceElement = document.createElement('source');

    videoElement.style.width = '100%';
    videoElement.style.height = '100%';

    mediaCon.classList.add('media');
    headerContainer.classList.add('header');
    contentContainer.classList.add('content');
    sourceElement.setAttribute('src', file.fileUrl);
    sourceElement.setAttribute('type', file.fileType);
    mediaCon.id = file._id;
    headerContainer.innerText = file.name;
    videoElement.appendChild(sourceElement);
    contentContainer.appendChild(videoElement);
    mediaCon.appendChild(headerContainer);
    mediaCon.appendChild(contentContainer);
    mediaContainer.appendChild(mediaCon);
}
