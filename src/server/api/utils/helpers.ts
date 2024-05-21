import NodeRSA from "node-rsa";
import nodemailer from "nodemailer";

const privateKey = process.env.PRIVATE_RSASECRET
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM_NAME = "Moonstone";
export const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM;


export const addMinutesToDate = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};


export function decryptDataRSA(encryptedData: string ) {
    if(!privateKey){
        throw new Error('Private Key is not defined');
    }
    const key_private = new NodeRSA(privateKey)
    const decrypted_data = key_private.decrypt(encryptedData, 'utf8');
    return decrypted_data;
}


export const formatDateTime = (dateString : Date) => {
  const localdate = new Date(dateString)
  console.log(localdate, "thge local datestring");
  return `${localdate.getHours()} : ${localdate.getMinutes()}`
}


export const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  export const mailOptions = {
    from: {
      name: "Moonstone",
      address: EMAIL_FROM_ADDRESS ?? "default@example.com" 
    },
  }
