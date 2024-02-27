if (!localStorage.getItem('token')) window.location.href = '/';

const channel = window.location.pathname.split('/')[3];

const fileUploadForm = document.getElementById('fileUploadForm');
const createTriggerForm = document.getElementById('createTriggerForm');

const alertContainer = document.getElementById('alertContainer');
const mediaContainer = document.getElementById('mediaContainer');

const fileInput = document.getElementById('file');
const fileSelect = document.getElementById('fileSelect');
const triggerNameCreate = document.getElementById('triggerNameCreate');
const triggerCost = document.getElementById('triggerCost');

const uploadFileBtn = document.getElementById('uploadFileBtn');
const createTriggerBtn = document.getElementById('createTriggerBtn');

let files;
let triggers;

uploadFileBtn.addEventListener('click', async () => {
    document.getElementById('uploadContainer').style.display = 'flex';
});

createTriggerBtn.addEventListener('click', async () => {
    document.getElementById('createTrigger').style.display = 'flex';
});

fileUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log(fileInput.files[0].size)
    let fileNameInput = document.getElementById('triggerName');
    if (fileInput.files.length === 0) return createAlert('Please select a file', 'error');
    if (fileInput.files[0].size > 5000000) return createAlert('File size should not exceed 5MB', 'error');

    if (fileNameInput.value == '') return createAlert('Please enter a valid File Name', 'error');

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
    createVideoFileView(data.file);
    document.getElementById('uploadContainer').style.display = 'none';
    fileUploadForm.reset();

});

createTriggerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let fileName = fileSelect.options[fileSelect.selectedIndex].innerText;
    let fileType = fileSelect.options[fileSelect.selectedIndex].getAttribute('fileType');

    const data = {
        name: document.getElementById('triggerNameCreate').value,
        file: fileName,
        type: document.getElementById('triggerType').value,
        mediaType: fileType,
        cost: document.getElementById('triggerCost').value,
        prompt: null,
        fileID: fileSelect.value,
        cooldown: document.getElementById('triggerCooldown').value
    }

    const response = await fetch(`https://domdimabot.com/trigger/create/${channel}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const res = await response.json();

    if (res.error) return createAlert(res.message, 'error');

    createAlert(res.message, 'success');
    document.getElementById('createTrigger').style.display = 'none';
    createTriggerForm.reset();

});

createTriggerForm.addEventListener('change', (e) => {
    if ((fileSelect.value != 0) && (triggerNameCreate.value != '')) {
        document.getElementById('createSubmitBtn').removeAttribute('disabled');
        console.log('enabled');
    } else {
        document.getElementById('createSubmitBtn').setAttribute('disabled', true);
        console.log('disabled');
    }
});

document.getElementById('exitUpload').addEventListener('click', () => {
    document.getElementById('uploadContainer').style.display = 'none';
});

document.getElementById('exitCreateTrigger').addEventListener('click', () => {
    document.getElementById('createTrigger').style.display = 'none';
});

window.onload = async () => {
    document.getElementById('triggerRef').setAttribute('href', `/trigger/manage/${channel}`);

    fileInput.addEventListener('change', async (e) => {
        let selectedFile = e.target.files[0];
        document.getElementById('submitBtn').disabled = false;
        let fileUrl = window.URL.createObjectURL(selectedFile);
        document.getElementById('videoPreview').src = fileUrl;
        document.getElementById('videoElement').load();
        document.getElementById('fileSize').innerText = `File size: ${(e.target.files[0].size / 1024 / 1024).toFixed(2)} MB`;
    });
    files = await fetch(`https://domdimabot.com/trigger/files/${channel}`);

    const data = await files.json();
    files = data.files;

    for (let file in files) {
        let fileType = files[file].fileType.split('/')[0];
        if (fileType == 'video') {
            createVideoFileView(files[file]);
        } else if (fileType == 'image') {
            createImageFileView(files[file]);
        }
        populateFileSelect(files[file]);
    }

    triggers = await fetch(`https://domdimabot.com/triggers/${channel}`);
    const triggerData = await triggers.json();
    triggers = triggerData.triggers;

    for (let trigger in triggers) {
        createTriggerView(triggers[trigger]);
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

function createVideoFileView(file) {
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

function createImageFileView(file) {
    const mediaCon = document.createElement('div');
    const headerContainer = document.createElement('div');
    const contentContainer = document.createElement('div');
    const imageElement = document.createElement('img');

    imageElement.style.width = '100%';
    imageElement.style.height = '100%';

    mediaCon.classList.add('media');
    headerContainer.classList.add('header');
    contentContainer.classList.add('content');
    imageElement.src = file.fileUrl;
    mediaCon.id = file._id;
    headerContainer.innerText = file.name;
    contentContainer.appendChild(imageElement);
    mediaCon.appendChild(headerContainer);
    mediaCon.appendChild(contentContainer);
    mediaContainer.appendChild(mediaCon);
}

function populateFileSelect(file) {
    const option = document.createElement('option');
    option.value = file._id;
    option.innerText = file.name;
    option.id = `${file._id}-Option`;
    option.setAttribute('fileType', file.fileType);
    fileSelect.appendChild(option);
}

function createTriggerView(trigger) {
    const triggerCon = document.createElement('div');
    const headerContainer = document.createElement('div');
    const contentContainer = document.createElement('div');
    const footerContainer = document.createElement('div');
    const infoContainer = document.createElement('div');
    const actionContainer = document.createElement('div');
    const actionFooterContainer = document.createElement('div');
    const editBtn = document.createElement('button');
    const deleteBtn = document.createElement('button');

    triggerCon.classList.add('trigger');
    headerContainer.classList.add('trigger-header');
    contentContainer.classList.add('trigger-content');
    footerContainer.classList.add('trigger-footer');
    infoContainer.classList.add('trigger-info');
    actionContainer.classList.add('trigger-actions');
    actionFooterContainer.classList.add('trigger-actions');
    editBtn.classList.add('btn', 'btn-warning');
    deleteBtn.classList.add('btn', 'btn-danger');

    headerContainer.innerHTML = `<h2>${trigger.name}</h2>`;
    infoContainer.innerHTML = `<p>Cost: ${trigger.cost}</p><p>Type: ${trigger.type}</p><p>Cooldown: ${trigger.cooldown}</p>`;
    editBtn.innerText = 'Edit';
    deleteBtn.innerText = 'Delete';
    deleteBtn.id = trigger._id;

    triggerCon.id = `${trigger._id}-trigger`;

    actionContainer.appendChild(editBtn);
    actionFooterContainer.appendChild(deleteBtn);
    contentContainer.appendChild(infoContainer);
    contentContainer.appendChild(actionContainer);
    footerContainer.appendChild(actionFooterContainer);
    triggerCon.appendChild(headerContainer);
    triggerCon.appendChild(contentContainer);
    triggerCon.appendChild(footerContainer);
    document.getElementById('triggerContainer').appendChild(triggerCon);

    deleteBtn.addEventListener('click', async (e) => {
        const response = await fetch(`https://domdimabot.com/trigger/delete/${channel}/${e.target.id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.error) return createAlert(data.message, 'error');

        createAlert(data.message, 'success');
        document.getElementById(`${e.target.id}-trigger`).remove();
    });

    editBtn.addEventListener('click', async (e) => { });
}

{/* <div class="trigger">
    <div class="trigger-header">
        <h2>{{ Name }}</h2>
    </div>
    <div class="trigger-content">
        <div class="trigger-info">
            <p>Cost: {{ Cost }}</p>
            <p>Type: {{ Type }}</p>
            <p>Cooldown: {{ Cooldown }}</p>
        </div>
        <div class="trigger-actions">
            <button class="btn btn-warning" id="editTriggerBtn">Edit</button>
        </div>
    </div>
    <div class="trigger-footer">
        <div class="trigger-actions">
            <button class="btn btn-danger" id="deleteTriggerBtn">Delete</button>
        </div>
    </div>
</div> */}