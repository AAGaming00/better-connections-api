export default async function (data) {
const userreq = await fetch('https://canary.discord.com/api/v8/users/@me', { 
    headers: new Headers({
      'Authorization': `Bearer ${data.token}`, 
    })}
)
const user = await userreq.json()
return data.id === user.id;
}