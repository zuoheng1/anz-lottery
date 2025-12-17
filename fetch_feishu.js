
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appId = 'cli_a806a834b55b500b';
const appSecret = 'WkJqQC0SjKAJFJJNYwvPneBEZdUqZyE6';
const wikiToken = 'F3nhwGNdVihpIQkTaK1cy9pBn0d';

// Ensure avatars directory exists
const avatarsDir = path.join(__dirname, 'public', 'avatars');
if (!fs.existsSync(avatarsDir)){
    fs.mkdirSync(avatarsDir, { recursive: true });
}

async function getTenantAccessToken() {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "app_id": appId,
            "app_secret": appSecret
        })
    });
    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`Failed to get access token: ${data.msg}`);
    }
    return data.tenant_access_token;
}

async function getWikiNodeInfo(accessToken) {
    const response = await fetch(`https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${wikiToken}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`Failed to get wiki node info: ${data.msg}`);
    }
    return data.data.node;
}

async function getSheetMeta(accessToken, spreadsheetToken) {
    const response = await fetch(`https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${spreadsheetToken}/sheets/query`, {
         method: 'GET',
         headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.code !== 0) throw new Error(`Failed to get sheet meta: ${data.msg}`);
    return data.data.sheets[0]; // Return first sheet
}

async function getSheetValues(accessToken, spreadsheetToken, sheetId) {
    const range = `${sheetId}!A1:Z100`; // Expand to Z to catch hidden columns
    const response = await fetch(`https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${spreadsheetToken}/values/${range}`, {
         method: 'GET',
         headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data.code !== 0) throw new Error(`Failed to get values: ${data.msg}`);
    return data.data.valueRange.values;
}

async function getFloatImages(accessToken, spreadsheetToken, sheetId) {
    const range = `${sheetId}!A1:E100`;
    try {
        const response = await fetch(`https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${spreadsheetToken}/float_images?range=${range}`, {
             method: 'GET',
             headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (data.code !== 0) {
                console.warn(`Float images API error: ${data.msg} (Code: ${data.code})`);
                return [];
            }
            return data.data.float_images || [];
        } catch (e) {
            console.warn(`Float images API returned non-JSON: ${text.substring(0, 100)}...`);
            return [];
        }
    } catch (e) {
        console.warn('Failed to fetch float images:', e);
        return [];
    }
}

async function downloadImage(accessToken, fileToken) {
    try {
        const filePath = path.join(avatarsDir, `${fileToken}.png`);
        const publicUrl = `/avatars/${fileToken}.png`;
        
        // Check if file already exists to save bandwidth/time
        if (fs.existsSync(filePath)) {
            // console.log(`Image ${fileToken} already exists, skipping download.`);
            return publicUrl;
        }

        console.log(`Downloading image token: ${fileToken}...`);
        const url = `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download`;
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Feishu-Open-Api'
            }
        });
        
        if (!res.ok) {
             console.warn(`Failed to download image ${fileToken}: ${res.status} ${res.statusText}`);
             return null;
        }
        
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        return publicUrl;
    } catch (e) {
        console.error(`Error downloading image ${fileToken}:`, e.message);
        return null;
    }
}

async function processFeishuData(accessToken, spreadsheetToken) {
    try {
        const sheet = await getSheetMeta(accessToken, spreadsheetToken);
        const sheetId = sheet.sheet_id;
        console.log(`Processing Sheet: ${sheet.title} (${sheetId})`);
        
        // 1. Get Cell Values (Text & Embedded Images)
        const values = await getSheetValues(accessToken, spreadsheetToken, sheetId);
        
        // 2. Get Floating Images
        const floatImages = await getFloatImages(accessToken, spreadsheetToken, sheetId);
        console.log(`Found ${floatImages.length} floating images`);
        
        // Process Rows
        // Header: values[0] -> Name, Department, Avatar
        const header = values[0];
        const rows = values.slice(1).filter(row => row && row[0]); // Filter empty rows
        
        console.log('Total rows:', rows.length);
        
        const participants = [];
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = i + 1;
            
            const name = row[0];
            const department = row[1] || '';
            let avatar = '';

            // Search ALL columns for avatar
            for (let j = 2; j < row.length; j++) {
                const cellVal = row[j];
                if (!cellVal) continue;
                
                if (typeof cellVal === 'object') {
                    if (cellVal.fileToken) {
                        const url = await downloadImage(accessToken, cellVal.fileToken);
                        if (url) { avatar = url; break; }
                    } else if (cellVal.link) {
                         avatar = cellVal.link;
                         break;
                    }
                } else if (typeof cellVal === 'string') {
                    const url = cellVal.trim();
                    if (url.startsWith('http') || url.startsWith('data:image')) {
                        avatar = url;
                        break;
                    }
                }
            }
            
            participants.push({
                id: crypto.randomUUID(),
                name,
                department,
                avatar,
                rowIndex: rowIndex // Store for potential matching
            });
        }
        
        if (floatImages.length > 0) {
            let floatImgIdx = 0;
            for (let p of participants) {
                if (!p.avatar && floatImgIdx < floatImages.length) {
                    const imgToken = floatImages[floatImgIdx].float_image_token;
                    const url = await downloadImage(accessToken, imgToken);
                    if (url) {
                        p.avatar = url;
                        console.log(`Assigned floating image to ${p.name} (heuristic match)`);
                    }
                    floatImgIdx++;
                }
            }
        }
        
        console.log('Processed Participants Count:', participants.length);
        const finalParticipants = participants.map(({rowIndex, ...rest}) => rest);
        
        const outputPath = path.join(process.cwd(), 'public', 'participants_from_feishu.json');
        
        fs.writeFileSync(outputPath, JSON.stringify(finalParticipants, null, 2));
        console.log(`Saved to ${outputPath}`);
        
    } catch (e) {
        console.error('Error processing data:', e);
        process.exit(1); 
    }
}

export async function syncFeishuData() {
    try {
        console.log('Getting access token...');
        const accessToken = await getTenantAccessToken();
        
        console.log('Getting wiki node info...');
        const node = await getWikiNodeInfo(accessToken);
        const objToken = node.obj_token;
        const objType = node.obj_type;
        
        if (objType === 'sheet') {
             await processFeishuData(accessToken, objToken);
             return { success: true, message: 'Sync completed' };
        } else {
            console.error('Not a sheet:', objType);
            return { success: false, message: 'Not a sheet' };
        }

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Only run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    syncFeishuData();
}
