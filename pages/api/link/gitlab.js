import verify from '../../../util/verify';
import { encrypt, decrypt } from '../../../util/crypto';
import { update, delkey } from '../../../util/fauna';
export default async function (req, res, user, token) {
    if (!user && !req.query.state) {
      req.query.type = 'gitlab';
      await (await import('../auth')).default(req, res)
      return
    }
    if (!req.query.code && user.id && !req.query.delete) {
      res.redirect(`https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_ID}&redirect_uri=${encodeURIComponent(`${process.env.URL}/api/link/gitlab`)}&response_type=code&state=${encrypt(JSON.stringify({...user, token, delete: req.query.delete}))}&scope=read_user`)
      return
    }
    if (req.query.delete) {
      let discord;
      try {
        discord = JSON.parse(decrypt(req.query.state))
        await verify(discord)
      } catch {
        res.status(403).json({status: 'fail', message: 'Unauthorized'})
        return
      }
      await delkey(discord.id, 'osu', 'connections');
      res.send('connection removed');
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
    // console.log(discord)
    const codereq = await fetch(`https://gitlab.com/oauth/token?client_id=${process.env.GITLAB_ID}&client_secret=${process.env.GITLAB_SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(`${process.env.URL}/api/link/gitlab`)}`, {method: 'POST'})
    const code = await codereq.json()
    if (codereq.status !== 200) res.send(codereq.statusText)
    const accreq = await fetch('https://gitlab.com/api/v4/user', { 
        headers: new Headers({
          'Authorization': `Bearer ${code.access_token}`,
        })}
    )
    const acc = await accreq.json()
    await update(discord.id, { gitlab: { id: acc.name, name: acc.username, verified: true, type:'gitlab'}, id: discord.id }, 'connections');
    res.send('done')
  }