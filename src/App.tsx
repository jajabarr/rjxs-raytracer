import React from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Auth } from './apollo-src/src/auth';
import logo from './logo.svg';
import './App.css';

const App = () => {
  const { data, loading, error } = useQuery(Auth.query);
  const [auth] = useMutation(Auth.mutation);

  React.useEffect(() => {
    console.log(loading, data, error);
    if (loading === false && !(data && data.auth && data.auth.valid)) {
      auth({ variables: { valid: true, id: 'auth' } });
    }
  }, [loading, data, auth, error]);

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className='App-link'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;
