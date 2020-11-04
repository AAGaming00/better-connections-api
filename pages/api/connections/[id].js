import { get } from '../../../util/fauna';

export default async function(req, res) {
    try {
    const { data: connections } = await get(req.query.id, 'connections')
    res.json(Object.keys(connections)
    .filter(key => key !== 'id')
    .reduce((obj, key) => {
      obj[key] = connections[key];
      return obj;
    }, {}))
    } catch {
        res.status(404).send('404: User not found')
    }
}