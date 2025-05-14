import { StreamChat} from 'stream-chat';
import "dotenv/config";

const apiKey=process.env.STREAM_API_KEY;
const apiSecret=process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream Api Key or Secret is missing");
}

const streamClient=StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreamUser=async (userData)=>{
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }
    catch(error){
        console.error("Error Upserting Stream User",error);
    }
};

export const generateStreamToken=async (userId)=>{
   try{
    // send userId as string
    // stream chat requires userId to be string     
    // but mongoose returns it as objectId
    // so we need to convert it to string
    const userIdstr= userId.toString();
    return streamClient.createToken(userIdstr);
   }
   catch(error){
        console.error("Error generating Stream token",error);
   }
};