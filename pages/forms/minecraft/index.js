import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Head from 'next/head';
import { Container, Card, Button, TextField, CircularProgress, RootRef } from '@material-ui/core';
import clsx from 'clsx';
import styles from './Minecraft.module.scss'


export default function MinecraftLinkPage() {
  const [discordData, setDiscordData] = useState({message: 'Link', status: 'ready'})
  const [status, setRawStatus] = useState({message: 'Link', status: 'ready'})
  const [value, setValue] = useState('')
  const router = useRouter()
  useEffect(() => {
    console.log(router.query);
    setDiscordData(router.query.state)
    //if (!state) router.push('/api/link/minecraft')
  }, [router.query])
  function setStatus (s, e) {
    switch (s) {
      case 'error':
        setRawStatus({message: e, status: 'error'});
        break;
      case 'success':
        setRawStatus({message: 'Successfully Linked', status: 'success'});
        break;
      case 'link':
        setRawStatus({message: 'Link', status: 'ready'});
        break;
      case 'loading':
        setRawStatus({message: '', status: 'loading'});
        break;
    }
  }
  function handleSubmit(event) {
    event.preventDefault();
    console.log('A code was submitted: ' + value);
    setStatus('loading');
    fetch('/api/link/minecraft', {method: 'POST',
    body: JSON.stringify({token: value,
      state: discordData
    })})
    .then(res => res.json())
    .then((res) => {
      if (res.status === 'fail') {
        setStatus('error', res.message)
        setTimeout(() => {
          setStatus('link')
        }, 3000);
        return
      }
      setStatus('success')
    })
  }
    return (
      <>
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      </Head>
      <Container className = {styles.center}>
        <Card className = {styles.card}>
            <span>
                To connect, join
              <pre>
                <code className = {styles.srv}>
                  srv.mc-oauth.net:25565
                </code>
              </pre>
                in game and enter the 6-digit code.
            </span>
            <form className = {styles.form} onSubmit={handleSubmit}>
              <TextField 
              type = "number"
              className = {styles.codeInput}
              onChange = {(e) => setValue(e.target.value)}
              variant="outlined"
              label = "Code"
              />
              <Button
                error = {(status.status === 'error').toString()}
                variant="contained"
                color="primary"
                className={clsx(
                  status.status === 'success' && styles.buttonSuccess,
                status.status === 'error' && styles.buttonError,
                styles.button
                )}
                disabled={status.status !== 'ready' || value.length !== 6}
                type="submit"
                >
                <div className = {clsx(
                  styles.buttonInner,
                  (status.status === 'error' || status.status === 'success') && styles.buttonBig,
                  )}
                  style = {(status.status === 'error' || status.status === 'success') ? {width: `${status.message.length * 7 + 30}px`} : {}}
                >
                  {status.message}
                  {status.status === 'loading' && <CircularProgress size={24} className = {styles.buttonProgress} color="inherit"/>}
                </div>
              </Button>
            </form>
        </Card>
      </Container>
      </>
    );
}