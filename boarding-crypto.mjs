import {createCipheriv,createDecipheriv,createHmac,randomBytes} from 'node:crypto';
export const BUCKET='guided-boarding-private';
export const ADMIN='sean@guidedpayments.com';
export const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export class Failure extends Error {constructor(status,message){super(message);this.status=status;}}
export const fail=(s,m)=>{throw new Failure(s,m);};
export const key=env=>{const b=Buffer.from(env.BOARDING_ENCRYPTION_KEY||'','base64');if(b.length!==32)fail(503,'Boarding is not available yet. Please contact Sean.');return b;};
export function seal(bytes,env,aad){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key(env),iv);c.setAAD(Buffer.from(aad));return Buffer.concat([iv,c.update(bytes),c.final(),c.getAuthTag()]);}
export function unseal(bytes,env,aad){const b=Buffer.from(bytes);if(b.length<28)throw Error('Invalid envelope');const d=createDecipheriv('aes-256-gcm',key(env),b.subarray(0,12));d.setAAD(Buffer.from(aad));d.setAuthTag(b.subarray(-16));return Buffer.concat([d.update(b.subarray(12,-16)),d.final()]);}
export const digest=(env,value)=>createHmac('sha256',key(env)).update(value).digest('hex');
export function validateDetails(data){
 const out={},lengths={dba:150,legalName:150,businessPhone:30,businessEmail:254,ein:12,ownerName:120,ownerPhone:30,ssn:14,paymentNeeds:30,acceptance:20};
 for(const [n,max] of Object.entries(lengths)){if(typeof data[n]!=='string'||data[n].length>max)fail(400,'Check the boarding fields and try again.');out[n]=data[n].trim();}
 out.businessEmail=out.businessEmail.toLowerCase();out.ein=out.ein.replace(/[ -]/g,'');out.ssn=out.ssn.replace(/[ -]/g,'');
 if(!out.dba&&!out.legalName)fail(400,'Enter your business DBA or legal business name.');
 if(!out.ownerName||!/^\S+@[^\s@]+\.[^\s@]+$/.test(out.businessEmail)||/[\r\n]/.test(out.businessEmail))fail(400,'Enter a valid owner name and business email.');
 for(const n of ['businessPhone','ownerPhone'])if(!/^[+()\d.\s-]+$/.test(out[n])||out[n].replace(/\D/g,'').length<10)fail(400,'Enter valid business and owner phone numbers.');
 if(!/^\d{9}$/.test(out.ein)||(out.ssn&&!/^\d{9}$/.test(out.ssn)))fail(400,'EIN and Social Security number must contain nine digits.');
 if(!['Credit Card Processing','ACH Processing','Both'].includes(out.paymentNeeds)||!['In-Person','Online','Blended'].includes(out.acceptance))fail(400,'Choose your payment needs and acceptance method.');
 if(data.consent!==true)fail(400,'Confirm permission to submit these business details.');return out;
}
export function fileType(bytes){const b=Buffer.from(bytes);if(b.subarray(0,5).toString()==='%PDF-')return {type:'application/pdf',extension:'pdf'};if(b.length>8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {type:'image/png',extension:'png'};if(b.length>3&&b[0]===255&&b[1]===216&&b[2]===255)return {type:'image/jpeg',extension:'jpg'};fail(400,'Upload a PDF, JPG, or PNG file.');}
