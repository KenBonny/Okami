import {type FreezerItem, type User, toUnit} from "../components/models.ts";

export interface File {
    id: string;
    name: string;
    mimeType: string;
    kind: string;
}

const fileName = "freezerItems.json";
const metadata = {
    name: fileName,
    mimeType: 'application/json',
};
const formatAuthHeader = (user: User) => `${user.token.token_type} ${user.token.access_token}`;

export async function loadFreezerItemsFromGoogle(user: User) : Promise<FreezerItem[]> {
    const freezerItemFile = await freezerItemFileMetaData(user);
    if (!freezerItemFile)
        return [];

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${freezerItemFile.id}?alt=media`,
        {
            headers: {
                'Authorization': formatAuthHeader(user)
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const items = await response.json();
    return items.map((item: any) => ({
        id: item.id as number,
        name: item.name as string,
        type: item.type as string,
        amount: item.amount as number,
        unit: toUnit(item.unit),
        created: new Date(item.created),
        deletedOn: new Date(item.deletedOn),
        expiration: new Date(item.expiration),
        frozen: new Date(item.frozen),
        isDeleted: item.isDeleted as boolean,
    } as FreezerItem));

}


export async function writeFreezerItemsToGoogleDrive(user: User, items: FreezerItem[]) : Promise<void> {
    try {
        const freezerItemFile = await freezerItemFileMetaData(user);
        const content = JSON.stringify(items);

        if (freezerItemFile){
            await updateFile(user, content, freezerItemFile);
        } else {
            await createNewFile(user, content)
        }
    } catch (error) {
        console.error(`Error while writing freezer items to Google Drive: ${error}`);
    }
}

async function updateFile(user: User, content: string, freezerItemFile: File){
    const updateResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${freezerItemFile.id}?uploadType=multipart`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': formatAuthHeader(user),
                'Content-Type': 'multipart/related; boundary=boundary',
            },
            body: createMultipartBody(metadata, content)
        }
    );

    if (!updateResponse.ok) {
        throw new Error(`HTTP error while updating file!`);
    }

    console.log(`Updating file: ${updateResponse}`);
    return await updateResponse.json();
}

async function createNewFile(user: User, content: string) : Promise<void> {
    const createResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
            method: 'POST',
            headers: {
                'Authorization': formatAuthHeader(user),
                'Content-Type': 'multipart/related; boundary=boundary',
            },
            body: createMultipartBody(metadata, content)
        }
    );

    if (!createResponse.ok) {
        throw new Error(`HTTP error while create!`);
    }

    console.log(`Created file: ${createResponse}`);
    return await createResponse.json();
}

async function freezerItemFileMetaData(user: User) : Promise<File | null> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name="${fileName}"`,
        {
            headers: {
                'Authorization': formatAuthHeader(user),
            }
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const files = data.files as File[];
    return files.length > 0 ? files[0] : null
}

function createMultipartBody(metadata: any, content: string) {
    const delimiter = '--boundary';
    const closeDelimiter = '--boundary--';
    const newline = '\r\n';

    return [
        delimiter,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        delimiter,
        'Content-Type: application/json',
        '',
        content,
        closeDelimiter
    ].join(newline);
}
