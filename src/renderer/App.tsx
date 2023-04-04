import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

function Hello() {
  const [version, setVersion] = useState('not set');

  window.electron.ipcRenderer.once('ipc-example', (arg) => {
    setVersion(arg as string);
  });
  window.electron.ipcRenderer.sendMessage('ipc-example', []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
        marginTop: '200px',
      }}
    >
      <h1>This App is for Test.</h1>
      <h2>Current Version is {version}</h2>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
