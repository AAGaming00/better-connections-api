import verify from '../../../util/verify';
import { encrypt, decrypt } from '../../../util/crypto';
import { update } from '../../../util/fauna';
export default async function (req, res, user, token) {
    if (!user && !req.query.state) {
      req.query.type = 'osu';
      await (await import('../auth')).default(req, res)
      return
    }
    if (!req.query.code && user.id) {
      res.redirect(`https://osu.ppy.sh/oauth/authorize?client_id=${process.env.OSU_ID}&redirect_uri=${encodeURIComponent(`${process.env.URL}/api/link/osu`)}&response_type=code&state=${encrypt(JSON.stringify({...user, token, delete: req.query.delete}))}&scope=identify`)
      return
    }
    let discord;
    try {
      discord = JSON.parse(decrypt(req.query.state))
      await verify(discord)
    } catch {
      res.status(403).json({status: 'fail', message: 'Unauthorized'})
      return
    }
    const codereq = await fetch('https://osu.ppy.sh/oauth/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "grant_type": "authorization_code",
          "client_id": parseInt(process.env.OSU_ID),
          "client_secret": process.env.OSU_SECRET,
          "redirect_uri": `${process.env.URL}/api/link/osu`,
          "code": req.query.code
        })
    })
    const code = await codereq.json()
    if (codereq.status !== 200) return res.send(codereq.statusText)
    const accreq = await fetch('https://osu.ppy.sh/api/v2/me/osu', { 
        headers: new Headers({
          'Authorization': `Bearer ${code.access_token}`,
        })}
    )
    const acc = await accreq.json()
    await update(discord.id, { osu: { id: acc.id, name: acc.username, verified: true, type:'osu'}, id: discord.id }, 'connections');
    res.send('done')
  }