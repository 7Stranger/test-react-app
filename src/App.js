/* eslint-disable no-loop-func */
import './App.scss';
import * as React from 'react';
import axios from 'axios'

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// const BASE_URL = 'http://localhost:3000' // for local
const BASE_URL = 'https://nestjs-api-eta.vercel.app' // for prod

function App() {
  const [isButtonEnabled, setButtonEnabled] = React.useState(false);
  const [isInputError, setInputError] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [inputValue, setInputValue] = React.useState();
  const [response, setResponse] = React.useState([]);
  const [responseText, setResponseText] = React.useState('');
  const [inProcess, setInProcess] = React.useState(false);
  let activeRequests = 0;
  let requestQueue = [];
  let tooManyRequestsError = false;


  async function makeRequest(requestIndex) {
    const body = {
      requestIndex: Number(requestIndex)
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    return axios.post(`${BASE_URL}/api`, body);
  }

  function processQueue() {
    setInProcess(true);
    while (activeRequests < Number(inputValue) && requestQueue.length > 0) {
      
      const nextRequest = requestQueue.shift();
      activeRequests++;
      if (!tooManyRequestsError) {
        makeRequest(nextRequest)
        .then((res) => {
          setResponse(res?.data ? response.push(res.data) : []);
          setResponseText(response.join(', '));
          activeRequests--;
          processQueue();
        })
        .catch(error => {
          setInProcess(false);
          activeRequests = 0;
          tooManyRequestsError = true;
          if (error.code === 'ERR_BAD_REQUEST') {
            console.error(error);
            alert(error.response?.statusText);
            return;
          }
        })
        .finally(()=> {
          if (activeRequests === 0 && !requestQueue.length) {
            console.log('DONE!!!!!!!!!!!!!!!');
            setInProcess(false);
            setButtonEnabled(true);
            setResponse([]);
          }
        })
      }
    }
}

  function start() {
    setResponse([]);
    setResponseText('');
    activeRequests = 0;
    tooManyRequestsError = false;
    requestQueue = [];
    for (let i=1; i <= 1000; i++) {
      requestQueue.push(i);
    }
    setButtonEnabled(false);
    processQueue();
  }
  
  function inputValidation(val) {
    if (/^\d{1,9}$/.test(val) && Number(val) <= 100 && activeRequests === 0) {
      setInputValue(val);
      setInputError(false);
      setButtonEnabled(true);
    } else {
      setErrorText(val.toString() !== '' ? 'Only from 1 to 100' : 'Field is required')
      setInputError(true);
      setButtonEnabled(false);
    }
  }

  return (
    <div className="App">
      <div className='main-wrapper'>
        <div className='headers'>
          <h1>Stanislav Moiseev</h1>
          <h3>Test task for DevIT company</h3>
        </div>
        <div className='input-area'>
        <TextField
          className="input"
          required
          disabled={inProcess}
          type="number"
          pattern="\d+"
          label="Requests per second"
          variant="outlined"
          error={isInputError}
          helperText={isInputError ? errorText : "" }
          onChange={(event) => {
            inputValidation(event.target.value);
          }}
        ></TextField></div>
        <Button
          variant="contained"
          disabled={!isButtonEnabled || inProcess}
          onClick={start}
        >{inProcess ? 'Run process...' : 'Start'}</Button>
        <div className='result'>
          <h4>{responseText}</h4>
        </div>
      </div>
    </div>
  );
}

export default App;
