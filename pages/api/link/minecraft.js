import { update, delkey } from '../../../util/fauna';
import { encrypt, decrypt } from '../../../util/crypto';
import verify from '../../../util/verify';

function oAuthToUUID(token) {
    return fetch('https://mc-oauth.net/api/api?token', {
       method: "GET",
       headers: {
          "token": token
       }
    })
    .then(response => response.json())
 }


export default async function (req, res, user, token) {
   if (req.method === 'GET') {
      if (req.query.delete && user) {
         try {
            await verify({...user, token})
         } catch (e) {
            res.status(403).json({status: 'fail', message: 'Unauthorized'})//'Unauthorized'})
            return
         }
         await delkey(discord.id, 'minecraft', 'connections');
         res.send('done')
         return
      }
      if (!user && !req.query.state) {
         req.query.type = 'minecraft';
         await (await import('../auth')).default(req, res)
         return
      }
      res.redirect(`/forms/minecraft?state=${encrypt(JSON.stringify({...user, token}))}`)
      return
   } if (req.method === 'POST') {
      const reqjson = JSON.parse(req.body)
      let discord;
      try {
         discord = JSON.parse(decrypt(reqjson.state))
         await verify(discord)
      } catch (e) {
         res.status(403).json({status: 'fail', message: 'Unauthorized'})//'Unauthorized'})
         return
      }
      const codereq = await oAuthToUUID(reqjson.token)
      if (codereq.status === 'fail') res.status(400)
      if (codereq.username) {
         await update(discord.id, { minecraft: { name: codereq.username, verified: true, type:'minecraft'}, id: discord.id }, 'connections');
      }
      res.json(codereq)
   }
   }