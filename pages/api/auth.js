import btoa from 'btoa';
import atob from 'atob';

export default async function (req, res) {
    if (!req.query.code && req.query.type) {
        res.redirect(`https://canary.discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_ID}&redirect_uri=${encodeURIComponent(`${process.env.URL}/api/auth`)}&response_type=code&state=${btoa(JSON.stringify({type: req.query.type, delete: req.query.delete}))}&scope=identify&prompt=none`)
    } else {
        const codereq = await fetch(`https://canary.discord.com/api/oauth2/token`, {method: 'POST', body: new URLSearchParams({
            client_id: process.env.DISCORD_ID,
            client_secret:process.env.DISCORD_SECRET,
            code:req.query.code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.URL}/api/auth`,
            scope: 'identify'
        }),
        headers: new Headers({'content-type': 'application/x-www-form-urlencoded'})
    })
        const code = await codereq.json()
        // console.log(code)
        if (codereq.status !== 200) {
            res.send(codereq.statusText);
            return
        }
        const userreq = await fetch('https://canary.discord.com/api/v8/users/@me', { 
            headers: new Headers({
              'Authorization': `Bearer ${code.access_token}`, 
            })}
        )
        const user = await userreq.json();

        //res.json(user)
        //// console.log(codereq)
        const state = JSON.parse(atob(req.query.state))
        await (await import(state.specialType ? `./${state.type}` : `./link/${state.type}`)).default({...req, query: {delete: state.delete}}, res, user, code.access_token)
    }
}