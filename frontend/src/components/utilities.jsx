export const formatDate = (received) => {
    const receivedDate = new Date(received);
    const now = new Date();
  
    if (receivedDate.toDateString() === now.toDateString()) {
      return receivedDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (receivedDate.getFullYear() === now.getFullYear()) {
      let day = receivedDate.getDate().toString();
      day = day.length === 1 ? '0' + day : day;
      const month = receivedDate.toLocaleString('default', { month: 'short' });
      return `${month} ${day}`;
    } else {
      return receivedDate.getFullYear().toString();
    }
  };
  
  export const sortEmails = (emails) => {
    return emails.sort((a, b) => new Date(b.received) - new Date(a.received));
  };