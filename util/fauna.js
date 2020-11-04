import { query as q, Client } from 'faunadb';
const db = new Client({ secret: process.env.FAUNA_SECRET }) 

export async function del(id, index) {
  try {
      await db.query(
          q.Delete(
              q.Match(
                  q.Index(index),
                  id
                )
            )
      ) 
      } catch (error) {
          return true
      }
  return true
}

export async function get(id, index) {
  return await db.query(
  q.Get(
    q.Match(
        q.Index(index),
        id
      )
    )
  )
}

export async function delkey(id, data, index) {
  const obj = {}
  obj[data] = null
  return await update(id, obj, index)
}

export async function update(id, data, index, collection) {
  return await db.query(
    q.Let(
      {res: q.Match(
          q.Index(index),
          id
        )},
      q.If(
        q.Exists(
          q.Var('res')
        ),
        q.Update(
          q.Select([0], q.Paginate(q.Var('res'))),
          { data },
        ),
        q.Create(
          q.Collection(collection || index),
          { data },
        )
      )
    )
  )
}