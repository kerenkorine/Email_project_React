import { useState, useEffect } from "react";

export default function useToken() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchMails = async () => {
        const item = localStorage.getItem('user');
        if (!item) {
          return;
        }
        const user = JSON.parse(item);
         user ? setToken(user.accessToken) : '';
    }
    fetchMails();
  }, []);
  return token;
}