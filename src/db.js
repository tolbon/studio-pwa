const INDEXDB_NAME = 'storyDb';

const DBOpenRequest = window.indexedDB.open(INDEXDB_NAME, 1);

DBOpenRequest.addEventListener("onerror", DBOnError);
DBOpenRequest.addEventListener("onsuccess", DBOnSuccess);
DBOpenRequest.addEventListener("onupgradeneeded", DBOnUpgradeNeeded);

/** @type {IDBDatabase|undefined} */
let db;

// Register two event handlers to act on the database being opened successfully, or not
function DBOnError(event) {
}

function DBOnSuccess(event) {
    // Store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;
};

// This event handles the event whereby a new version of the database needs to be created
// Either one has not been created before, or a new version number has been submitted via the
// window.indexedDB.open line above
//it is only implemented in recent browsers
function DBOnUpgradeNeeded(event) {
    db = event.target.result;

    db.onerror = (event) => {
        note.appendChild(createListItem('Error loading database.'));
    };

    // Create an objectStore for this database
    const objectStore = db.createObjectStore(INDEXDB_NAME, { keyPath: 'uuid' });

    // Define what data items the objectStore will contain
    objectStore.createIndex('uuid', 'uuid', { unique: true });
    objectStore.createIndex('data', 'data', { unique: false });

}

let dirHandle;

async function getDir() {
    /** @type {FileSystemDirectoryHandle} */
    dirHandle = await window.showDirectoryPicker({id: 'studio-js', mode: 'readwrite', startIn: "desktop"});
    /** @type {FileSystemDirectoryHandle} */
    const historyFolderList = await dirHandle.getDirectoryHandle('.content');
    const packIndexFSDirectoryHandle = await dirHandle.getDirectoryHandle('.pi');
    const metadataFSDirectoryHandle = await dirHandle.getDirectoryHandle('.md');
    for await (const [key, historyFSDirectoryHandle] of historyFolderList.entries()) {
        historyFSDirectoryHandle.getDirectoryHandle('sf')
        console.log({ key, value });
    }
}

async function readPackIndex() {
    const packUUIDs = [];
}

function getNodeIndex() {
    return "ni";
}

function getListIndex() {
    return ("li");
}

function getImageIndex() {
    return ("ri");
}

function getImageFolder() {
    return ("rf");
}

function getSoundIndex() {
    return ("si");
}

function getSoundFolder() {
    return ("sf");
}

function getNightMode() {
    return ("nm");
}

function getBoot() {
    return ("bt");
}


addEventListener('load', () => {
    const folder = document.getElementById('folder-access');
    folder.addEventListener('click', getDir);
});