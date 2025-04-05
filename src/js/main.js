import Sortable, { MultiDrag, Swap } from 'sortablejs';

const mainContainer = document.querySelector('.main-container');
const dropArea = document.querySelector("#drop-area");
const listArea = document.querySelector('#list-area');
const folderInput = document.querySelector('#music-folder-input');
const buttonSave = document.querySelector('#btn-save-playlist');
const playlistNameInput = document.querySelector('#save-playlist-input');



folderInput.addEventListener('input', (evt) => {
    let list = listArea.querySelectorAll('.list-item');
    let prefixPath = folderInput.value;

    if (!prefixPath.endsWith('\\')) {
        prefixPath = prefixPath + '\\';
    }

    list.forEach(li => {
        li.textContent = `${prefixPath.replaceAll('\\', '/')}${li.path}`;
    });
});

Sortable.mount(new MultiDrag());

function traverseFileTree(item, path) {
    path = path || "";

    if (item.isFile) {
        // Get file
        item.file(function (file) {

            let fname = file.name.toLowerCase();

            console.log(file);

            if (fname.endsWith('.mp3')
                || fname.endsWith('.wav')
                || fname.endsWith('.flac')
                || fname.endsWith('.mp4')
                || fname.endsWith('.m4a')
                || fname.endsWith('.ogg')
                || fname.endsWith('.aac')
                || fname.endsWith('.webm')) {
                console.log("File:", path + file.name);

                let div = document.createElement('div');
                let prefixPath = folderInput.value;

                if (!prefixPath.endsWith('\\')) {
                    prefixPath = prefixPath + '\\';
                }

                div.textContent = `${prefixPath.replaceAll('\\', '/')}${path + file.name}`;
                div.classList.add('list-item');
                div.path = path + file.name;

                listArea.appendChild(div);
            }
            else {
                console.log(`File: '${path + file.name}' is not of a compatible format. Supported formats are 'https://jmusicbot.com/#formats'`);
            }
        });
    } else if (item.isDirectory) {
        // Get folder contents
        var dirReader = item.createReader();
        dirReader.readEntries(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                traverseFileTree(entries[i], path + item.name + "/");
            }
        });
    }
}

function download(text, name, type) {
    var a = document.getElementById("download-container");
    var file = new Blob([text], { type: type });

    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

dropArea.addEventListener('dragover', function (event) {
    event.preventDefault();
});

dropArea.addEventListener('dragenter', function (event) {
    event.preventDefault();

    dropArea.classList.add('is-dragging');
});

dropArea.addEventListener('dragleave', function (event) {
    event.preventDefault();

    dropArea.classList.remove('is-dragging');
});

dropArea.addEventListener("drop", function (event) {
    event.preventDefault();

    dropArea.classList.remove('is-dragging');

    listArea.innerHTML = '';

    var items = event.dataTransfer.items;

    for (var i = 0; i < items.length; i++) {
        // webkitGetAsEntry is where the magic happens
        var item = items[i].webkitGetAsEntry();

        if (item) {
            traverseFileTree(item);
        }
    }

    Sortable.create(listArea, {
        multiDrag: true,
        selectedClass: "selected",
        fallbackTolerance: 3, // So that we can select items on mobile
        animation: 150
    }
    );
}, false);

buttonSave.addEventListener('click', () => {
    let text = '';

    let list =listArea.querySelectorAll('.list-item');

    list.forEach(li => {
        text += `${li.textContent}\n`;
    });

    download(text, `${playlistNameInput.value}.txt`, 'text/plain');
});