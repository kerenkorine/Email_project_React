DROP TABLE IF EXISTS dummy;
CREATE TABLE dummy(created TIMESTAMP WITH TIME ZONE);
DROP TABLE IF EXISTS mail;
DROP TABLE IF EXISTS users;
CREATE TABLE users(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE, password VARCHAR(255), role VARCHAR(32), name VARCHAR(255));
CREATE TABLE mail(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), mailbox VARCHAR(32), mail jsonb, user_id UUID, FOREIGN KEY (user_id) REFERENCES users(id));

-- users own mailboxes
-- mailboxes contain mail
-- => the tables are users, mailboxes, mail