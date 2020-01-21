import AWS from 'aws-sdk';
import fs, { readFileSync } from 'fs';
import * as path from 'path';
import logger from '../Logger';
import  {WASABI_CONFIG} from './const';

const wasabiAwsUrl : any = new AWS.Endpoint(WASABI_CONFIG.ENDPOINT_ZONE);
const s3WasabiConfig = new AWS.S3({
  endpoint : wasabiAwsUrl,
  accessKeyId: WASABI_CONFIG.ACCESS_KEY_ID,
  secretAccessKey: WASABI_CONFIG.SECRET_ACCESS_KEY
});

export async function uploadImage(imagresponseHeaders: any, filepath: string){
    logger.log('INSIDE CACHING FUNCTION-------------------------------')
    fs.writeFile('/tmp/tempFile',imagresponseHeaders.data, function(){
        //Need to refactor so that params are not declared again and again
        let params = {
            Bucket: WASABI_CONFIG.BUCKET_NAME,
            ContentType: imagresponseHeaders.headers['content-type'],
            ContentLength: imagresponseHeaders.headers['content-length'],
            Key: path.basename(filepath),
            Body: fs.createReadStream('/tmp/tempFile')
        };
    
        // var options = {
        //     partSize: 10 * 1024 * 1024, // 10 MB
        //     queueSize: 10
        // };
       
        s3WasabiConfig.putObject(params, function(err, data){
            //make the method more generic with just change of s3Obj properties
            if (!err) {
                logger.log('COMING INSIDE-------SUCCESS', data);
            } else {
                logger.log('COMING INSIDE-------ERROR', err);
            }
        }) 
    });

}

export async function checkIfImageAlreadyExistsInAws(filepath: string) : Promise<boolean>{
    let params = {
        Bucket:WASABI_CONFIG.BUCKET_NAME,
        Key: path.basename(filepath)
    }
    logger.log(params);
    return new Promise((resolve, reject) => {
        const getUrl =  s3WasabiConfig.getObject(params, async (err: any, val: any) =>{
            if(err){
                reject(false);
            } else {
                logger.log(val)
                resolve(true);
            }
        })
    });
   
   

}

export default{
    uploadImage,
    checkIfImageAlreadyExistsInAws
}