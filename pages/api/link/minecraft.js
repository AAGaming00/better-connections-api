    
function oAuthToUUID(token) {
    return fetch('https://mc-oauth.net/api/api?token', {
       method: "GET",
       headers: {
          "token": token
       }
    }).then(response => {
       return response.json();
    })
 }


export default async function (req, res) {
    res.json(await oAuthToUUID(req.query.token))
}