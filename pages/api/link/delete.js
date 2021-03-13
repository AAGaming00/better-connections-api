import { delkey } from '../../../util/fauna';
export default async function (req, res, user, token, state) {
    if (!user) {
      req.query._type = req.query.type;
      req.query.type = 'delete';
      await (await import('../auth')).default(req, res)
      return
    }
    console.log(req.query, state)
    await delkey(user.id, state._type, 'connections');
    res.send('connection removed');
}