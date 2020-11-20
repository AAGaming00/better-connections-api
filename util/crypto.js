// https://gist.github.com/siwalikm/8311cf0a287b98ef67c73c1b03b47154
'use strict';

import crypto from 'crypto';
const ENC_KEY =  crypto.createHash('sha256').update(process.env.ENC_KEY).digest(); // set random encryption key
const IV = Buffer.from(process.env.IV, 'hex'); // set random initialisation vector
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');


export function encrypt(val, url = true) {
  let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  const buf = Buffer.concat([
    cipher.update(val),
    cipher.final()
  ])
  return url ? encodeURIComponent(buf.toString('base64')) : buf.toString('base64') // Output base64 string
};

export function decrypt(encrypted, url = true) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  const buf =  Buffer.concat([
    decipher.update(encrypted, 'base64'), // Expect `text` to be a base64 string
    decipher.final()
  ])
  return url ? decodeURIComponent(buf.toString()) : buf.toString()
};

// star this gist if you found it useful