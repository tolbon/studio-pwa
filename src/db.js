import { stringify as uuidStringify } from 'uuid';


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

/** @type {FileSystemDirectoryHandle} */
let dirHandle;
let packIndexFSDirectoryHandle;

async function getDir() {
    dirHandle = await window.showDirectoryPicker({id: 'studio-js', mode: 'readwrite', startIn: "desktop"});
    /** @type {FileSystemDirectoryHandle} */
    const historyFolderList = await dirHandle.getDirectoryHandle('.content');
    const packIndexFSDirectoryHandle = await dirHandle.getFileHandle('.pi');
    const metadataFSDirectoryHandle = await dirHandle.getDirectoryHandle('.md');
    for await (const [key, historyFSDirectoryHandle] of historyFolderList.entries()) {
        historyFSDirectoryHandle.getDirectoryHandle('sf')
        console.log({ key, value });
    }

    console.dir(await getPacksList());
}

async function getPacksList() {
    const packUUIDs = await readPackIndex();

    console.log("Number of packs in index: " + packUUIDs.size());
    const packs = [];
    for (const packUUID of packUUIDs) {
        console.log("Pack UUID: " + packUUID.toString());

                        // Compute .content folder (last 4 bytes of UUID)
        const folderName = computePackFolderName(packUUID.toString());
        const historyFolderList = await dirHandle.getDirectoryHandle('.content');
        const folderNameDirectoryHandle = await historyFolderList.getDirectoryHandle(folderName);
        const niFileHandle = await folderNameDirectoryHandle.getFileHandle('ni');

        const niFile = await niFileHandle.getFile();
        const niFileStream = await niFile.arrayBuffer();
        // ByteBuffer bb = ByteBuffer.wrap(niDis.readNBytes(512)).order(ByteOrder.LITTLE_ENDIAN);
        // short version = bb.getShort(2);

        let nightMode = false;
        try {
            const historyFolderList = await folderNameDirectoryHandle.getFileHandle('nm');
            nightMode = true;
        } catch(_) {
        }

        packs.add({
            uuid: packUUID,
            nightMode: nightMode,
            version: '0',
        });
    }
    return packs;
}


async function readPackIndex() {
    /** @type {string[]} */
    const packUUIDs = [];
    const packIndexFSFileHandle = await dirHandle.getFileHandle('.pi');
    const packIndexFile = await packIndexFSFileHandle.getFile();
    const packIndexStream = packIndexFile.stream();

    let buffer = new Uint8Array();
    for await (const chunk of packIndexStream) {
        const localbuff = new Uint8Array(buffer.length + chunk.length);
        localbuff.set(buffer)
        localbuff.set(chunk, buffer.length);
        const nbLoop = Math.floor(localbuff.length / 16);
        for(let i = 0; i <= nbLoop; i++) {
            const dv = new DataView(subarray, i * 16, 16)
            //const high = dv.getBigUint64()
            //const low = dv.getBigUint64(8)

            uuidStringify(dv.buffer)
        }
        buffer = localbuff.subarray(i * 16);
      }

      return packUUIDs;
}

/**
 * 
 * @param {string} uuid 
 * @returns 
 */
export function computePackFolderName(uuid) {
    const uuidStr = uuid.replace('-', '');
    return uuidStr.substring(uuidStr.length() - 8).toUpperCase();
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