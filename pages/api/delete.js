import { delkey } from '../../../util/fauna';
export default async function (req, res, user, token) {
    if (!user && !req.query.state) {
      await (await import('../auth')).default(req, res)
      return
    }
    await delkey(user.id, req.query.type, 'connections');
    res.send('connection removed');
}