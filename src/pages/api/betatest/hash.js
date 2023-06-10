import bcrypt from 'bcrypt';
import { arrayToUtf8 } from 'enc-utils';
import * as ecies from 'ecies-25519';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Try to decrypt
    let actualPassword;
    try {
      const passwordData = JSON.parse(arrayToUtf8(await ecies.decrypt(
        Buffer.from(req.body.password, 'base64'),
        Buffer.from(process.env.USERS_TO_US_PRIVATE, 'base64'),
      )));
      actualPassword = passwordData.password;
    } catch (err) {
      return res.status(406).send('Unable to decrypt password');
    }

    return res.status(200).json({
      hash: await bcrypt.hash(actualPassword, 15),
    });
  }
  return res.status(405).json({ message: 'Method not allowed' });
}
