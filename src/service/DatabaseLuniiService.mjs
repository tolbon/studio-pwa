const THUMBNAILS_STORAGE_ROOT = "https://storage.googleapis.com/lunii-data-prod";
const LUNII_GUEST_TOKEN_URL = "https://server-auth-prod.lunii.com/guest/create";
const LUNII_PACKS_DATABASE_URL = "https://server-data-prod.lunii.com/v2/packs";

/**
* @typedef {{
*  age_max: number,
*  age_min: number,
*  authors: {
*   [key:string]: {
*       gender: string|'male'|'female'
*       image_url: string,
*       name: string,
*   }
*  },
*  checksum: string,
*  creation_date: number,
*  duration: number,
*  is_factory: boolean,
*  keywords: string,
*  modification_date: number,
*  night_mode_playable: boolean,
*  previews: string[], 
*  reference: string,
*  sampling_rate: number,
*  size: number,
*  slug: string,
*  stats_offset: number,
*  title: string,
*  uuid: string,
*  locales_available: {
*   [key:string]: boolean,
*  },
*  localized_infos: {
*   [key:string]: {
*       description: string,
*       image: {
*           image_url: string,
*       },
*       previews: string[],
*       subtitle: string,
*       title: string,
*  }
* },
* stories: {
*  combinations_sprite: {
*      columns: number,
*      rows: number,
*      sprite: string,
*      tile_height: number,
*      tile_width: number,
*  },
*  stories: {
*      [key:string]: {
*          combinations_sprite_indices: number[],
*          duration: number,
*          title: string,
*      }
*  }
* },
* story_count: number,
* subtitle: string,
* tellers: {},
* }} DatabaseMetadata
*/

/**
 * @type {Map<string, DatabaseMetadata>}
 */
const cachedOfficialDatabase = new Map();

async function fetchToken() {
    const tokenResponse = await fetch(LUNII_GUEST_TOKEN_URL)
    if (tokenResponse.status !== 200) {
        throw Error('tokenResponse not return 200')
    }
    /**
     * @type {{
     *  code: '0.0',
     *  response: {
     *      token: {
     *         server: string,
     *          studio: string 
     * } 
     * }
     * }}
     */
    const bodyJson = await tokenResponse.json();

    const luniiToken = bodyJson?.response?.token?.server
    if (!luniiToken) {
        console.error('fetchToken body change')
        throw new Error('fetchToken body change');
    }
    console.log(`token ${luniiToken}`)

    return luniiToken;
}

async function fetchDatabase(token) {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("X-AUTH-TOKEN", token);

    const request = new Request(LUNII_PACKS_DATABASE_URL, {
        method: "GET",
        headers,
    });

    const dataResponse = await fetch(request);
    if (dataResponse.status !== 200) {
        throw Error('fetch Database not return 200')
    }
    
    /**
     * @type {{
     *  code: '0.0',
     * response: {
     *  [key:string]: DatabaseMetadata
     * }
     * }}
     */
    const bodyJson = await dataResponse.json();

    return bodyJson.response;
}

const token = await fetchToken();
const allOfficialDbData = await fetchDatabase(token);

for (keyId in allOfficialDbData) {
    const pack = allOfficialDbData[keyId];
    const uuid = pack.uuid;
    cachedOfficialDatabase.set(uuid, pack);
}

function isOfficialPack(uuid) {
    return cachedOfficialDatabase.has(uuid);
}

/**
 * 
 * @param {*} uuid 
 * @param {*} userLocale
 */
function getOfficialMetadata(uuid, userLocale) {
    const pack = cachedOfficialDatabase.get(uuid);

    if (!pack) {
        return undefined
    }
    const localesAvailable = pack.locales_available;
    /** @type {string} */
    let locale;
    if (localesAvailable[userLocale]) {
        locale = userLocale;
    } else if (localesAvailable['fr_FR']) {
        locale = 'fr_FR';
    } else {
        const localList = Object.keys(localesAvailable)
        if (localList.length === 0) {
            throw new Error('No userLocale defined')
        }
        locale = localList[0]
    }
    const l10npack = pack.localized_infos[locale];

    return {
        uuid,
        title: l10npack.title,
        description: l10npack.description,
        image_url: `${THUMBNAILS_STORAGE_ROOT}${l10npack.image.image_url}`
    }
}

