
import React from 'react';
import { useNavigate } from "react-router-dom";
import './Login.css'; 

function Login() {
  const [user, setUser] = React.useState({email: '', password: ''});
  const [remember, setRemember] = React.useState(false);
  const history = useNavigate();

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    const u = user;
    u[name] = value;
    setUser(u);
  }

  const handleRememberChange = (event) => {
    setRemember(event.target.checked);
  }

  const onSubmit = (event) => {
    event.preventDefault();
    fetch('http://localhost:3010/v0/login', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) { throw res }
      return res.json()  
    })
    .then((json) => {
      localStorage.setItem('user', JSON.stringify(json));
      history('/MailboxViewer');
    })
  }

  return (
    <form onSubmit={onSubmit}>
        <div className="container">
      <h2 id='login'>login</h2>
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        onChange={handleInputChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleInputChange}
        required
      />
      <div>
        <label>
          <input 
            type="checkbox" 
            name="remember" 
            checked={remember}
            onChange={handleRememberChange} 
          />
          Remember me
        </label>
      </div>
      <input type="submit" value="Sign in"/>
      </div>
    </form>
  );
}

export default Login;
