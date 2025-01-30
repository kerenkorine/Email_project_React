/*
#######################################################################
#
# Copyright (C) 2020-2022 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without 
# the express written permission of the copyright holder.
#
#######################################################################
*/

import React from 'react';
import './Home.css'; 

function Home() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [name, setName] = React.useState(user ? user.name : '');

  const logout = () => {
    localStorage.removeItem('user');
    setName('');
  };

  return (
    <div>
      <h2 id='welcome'>CSE186 Email</h2>
      <a href='/Login'>Login</a>
      <button onClick={logout}>Logout</button>
      {name && <label>{name}</label>}
    </div>
  );
}

export default Home;




