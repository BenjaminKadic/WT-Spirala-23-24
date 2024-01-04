const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs/promises');
const bodyParser = require('body-parser');


const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
    return res.sendStatus(204);
  }
  return next();
});

app.use(session({
  secret: 'sifra',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.json());


// Implementirajte endpoint za svaku stranicu
app.get('/:page.html', function (req, res) {
  const page = req.params.page;
  // Render the HTML file and pass data to it
  res.sendFile(path.join(__dirname, 'public', 'html', `${page}.html`));
});

// Ruta: /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Učitaj korisnike iz datoteke
    const usersData = await fs.readFile('data/korisnici.json', 'utf-8');
    const users = JSON.parse(usersData);

    // Pronađi korisnika po korisničkom imenu
    const user = users.find(u => u.username === username);

    // Provjeri lozinku korisnika
    if (user && await bcrypt.compare(password, user.password)) {
      // Postavi korisničko ime u sesiju
      req.session.username = username;
      return res.status(200).json({ poruka: 'Uspješna prijava' });
    } else {
      return res.status(401).json({ greska: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Greška prilikom prijave:', error);
    return res.status(500).json({ greska: 'Internal Server Error' });
  }
});

// Ruta: /logout
app.post('/logout', (req, res) => {
  // Briši sve informacije iz sesije
  req.session.destroy(function (err) {
    res.clearCookie('connect.sid', { path: '/' });
    res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
});

// Ruta: /korisnik
app.get('/korisnik', (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Učitaj korisnike iz datoteke
  fs.readFile('data/korisnici.json', 'utf-8')
    .then(usersData => {
      const users = JSON.parse(usersData);

      // Pronađi korisnika po korisničkom imenu
      const user = users.find(u => u.username === req.session.username);

      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(401).json({ greska: 'Neautorizovan pristup' });
      }
    })
    .catch(error => {
      console.error('Greška prilikom dohvaćanja podataka o korisniku:', error);
      return res.status(500).json({ greska: 'Internal Server Error' });
    });
});

app.post('/upit', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { nekretnina_id, tekst_upita } = req.body;

  const usersData = await fs.readFile('data/korisnici.json', 'utf-8');
  const korisnici = JSON.parse(usersData);

  const korisnik = korisnici.find(user => user.username === req.session.username);

  if (!korisnik) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const nekretnina = nekretnine.find(nek => nek.id === nekretnina_id);

  if (!nekretnina) {
    return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
  }

  nekretnina.upiti.push({
    korisnik_id: korisnik.id,
    tekst_upita,
  });

  res.status(200).json({ poruka: 'Upit je uspješno dodan' });
});


// Ruta za ažuriranje podataka korisnika
app.put('/korisnik', async (req, res) => {
  // Provjeri da li je korisnik prijavljen
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const usersData = await fs.readFile('data/korisnici.json', 'utf-8');
  const korisnici = JSON.parse(usersData);

  const korisnik = korisnici.find(user => user.username === req.session.username);

  if (!korisnik) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  if (req.body.ime) {
    korisnik.ime = req.body.ime;
  }

  if (req.body.prezime) {
    korisnik.prezime = req.body.prezime;
  }

  if (req.body.username) {
    korisnik.username = req.body.username;
  }

  if (req.body.password) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      korisnik.password = hashedPassword;
    } catch (error) {
      return res.status(500).json({ greska: 'Greška prilikom hashiranja password-a' });
    }
  }
  fs.writeFile('data/korisnici.json', JSON.stringify(korisnici), 'utf-8', (err) => {
    if (err) {
      return res.status(500).json({ greska: 'Greška prilikom spremanja podataka u datoteku' });
    }
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  });

});

app.get('/nekretnine', async (req, res) => {
  try {
    const data = await fs.readFile('data/nekretnine.json', 'utf-8');
    const nekretnine = JSON.parse(data);
    res.status(200).json(nekretnine);
  } catch (error) {
    res.status(500).json({ greska: 'Greška prilikom čitanja ili parsiranja podataka' });
  }
});

app.post('/marketing/nekretnine', async (req, res) => {
  try {
    const { nizNekretnina } = req.body;

    req.session.nekretnine = [];

    const data = await fs.readFile(path.join(__dirname, 'data', 'marketing.json'), 'utf8');
    const marketing = JSON.parse(data);

    nizNekretnina.forEach(async (nekretninaId) => {
      var nekretnina = marketing.find((x) => x.id == nekretninaId);
      if (!nekretnina) {
        marketing.push({
          id: parseInt(nekretninaId, 10),
          klikovi: 0,
          pretrage: 0,
        });
        nekretnina = marketing.find((x) => x.id == nekretninaId);
      }
      nekretnina.pretrage += 1;
    });

    req.session.nekretnine = marketing;

    await fs.writeFile(path.join(__dirname, 'data', 'marketing.json'), JSON.stringify(marketing, null, 2));

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  try {
    const nekretninaId = req.params.id;
    req.session.nekretnine = [];

    const data = await fs.readFile(path.join(__dirname, 'data', 'marketing.json'), 'utf8');
    const marketing = JSON.parse(data);

    var nekretnina = marketing.find(x => x.id == nekretninaId);

    if (!nekretnina) {
      const novo = {
        id: parseInt(nekretninaId, 10),
        klikovi: 0,
        pretrage: 0
      };
      marketing.push(novo);
      nekretnina = marketing.find(x => x.id == nekretninaId);
    }

    nekretnina.klikovi += 1;
    req.session.osvjezi.nizNekretnina = [];
    req.session.osvjezi.nizNekretnina.push(nekretnina);
    req.session.nekretnine.push(nekretnina);

    await fs.writeFile(path.join(__dirname, 'data', 'marketing.json'), JSON.stringify(marketing, null, 2));

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi', async (req, res) => {
  if (!req.session) {
    return res.status(500).json({ error: 'Session not available' });
  }

  try {
    let { nizNekretnina } = req.body;

    if (!nizNekretnina || nizNekretnina.length === 0) {
      nizNekretnina = req.session.nekretnine || [];
    }

    const data = await fs.readFile(path.join(__dirname, 'data', 'marketing.json'), 'utf8');
    const marketing = JSON.parse(data);

    const osvjezi = {
      nizNekretnina: marketing.filter(item => nizNekretnina.includes(item.id)),
    };

    if (req.session.osvjezi && req.session.osvjezi.length !== 0) {
      const salji = marketing.filter(element => {
        const found = req.session.osvjezi.nizNekretnina.find(x => x.id === element.id);
        return found && (found.pretrage !== element.pretrage || found.klikovi !== element.klikovi);
      });

      if (salji.length !== 0) {
        req.session.osvjezi = { nizNekretnina: salji };
        return res.status(200).json({ nizNekretnina: salji });
      }
    }

    req.session.nekretnine = [];
    req.session.osvjezi = osvjezi;
    return res.status(200).json(osvjezi);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.listen(3000, () => {
  console.log('Server je pokrenut na http://localhost:3000/');
});

