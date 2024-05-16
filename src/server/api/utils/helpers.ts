import NodeRSA from "node-rsa";


const privateKey = process.env.PRIVATE_RSASECRET


export const addMinutesToDate = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};


export function decryptDataRSA(encryptedData: string ) {
    if(!privateKey){
        throw new Error('Private Key is not defined');
    }
    console.log("in decrypt func");
    
    const key_private = new NodeRSA(privateKey)
    const decrypted_data = key_private.decrypt(encryptedData, 'utf8');
    console.log("DEEEC :: ", decrypted_data);
    return decrypted_data;
}


export const formatDateTime = (dateString : Date) => {
    return `${dateString.getHours()} : ${dateString.getMinutes()}`
}


