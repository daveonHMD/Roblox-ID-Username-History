const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { usernameHistory: null });
});

app.post('/username', async (req, res) => {
  const userId = req.body.userId;
  let cursor = null;
  let usernames = [];

  do {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}/username-history?limit=100&sortOrder=Asc`);
    const json = await response.json();

    if (json.errors) {
      res.render('index', { usernameHistory: null });
      return;
    }

    const usersWithDates = json.data.map(user => {
      return {
        name: user.name,
        date: new Date(user.created).toDateString()
      }
    });

    usernames.push(...usersWithDates);

    if (json.nextPageCursor) {
      cursor = json.nextPageCursor;
    } else {
      cursor = null;
    }
  } while (cursor);

  res.render('index', { usernameHistory: usernames });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
