// import Dummy from './components/Dummy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// import Home from './components/Home';
import Login from './components/Login';
import MailboxViewer from './components/MailboxViewer';
import MailViewer from './components/MailViewer';
//import SearchView from './components/SearchView';

/**
 * Simple component with no state.
 *
 * @return {object} JSX
 */
function App() {
  return (
    /*
    <div>
      <Dummy />
    </div>
    */
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/MailboxViewer" exact element={<MailboxViewer />} />
          <Route path="/mail/:id" element={<MailViewer />} />
          <Route path="/MailboxViewer/:mailbox" element={<MailboxViewer />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
