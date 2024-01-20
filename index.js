const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./data/db.js')


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
    // Pronađi korisnika po korisničkom imenu u bazi podataka
    const user = await db.Korisnik.findOne({ where: { username } });

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
app.get('/korisnik', async (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Pronađi korisnika po korisničkom imenu u bazi podataka
    const user = await db.Korisnik.findOne({ where: { username: req.session.username } });

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o korisniku:', error);
    return res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/upit', async (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    const { nekretnina_id, tekst_upita } = req.body;

    // Pronađi korisnika po korisničkom imenu u bazi podataka
    const korisnik = await db.Korisnik.findOne({ where: { username: req.session.username } });

    if (!korisnik) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Pronađi nekretninu po id-u u bazi podataka
    const nekretnina = await db.Nekretnina.findByPk(nekretnina_id);

    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    // Dodaj upit u bazu podataka
    await db.Upit.create({
      tekst_upita,
      KorisnikId: korisnik.id,
      NekretninaId: nekretnina.id,
    });

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Greška prilikom dodavanja upita:', error);
    return res.status(500).json({ greska: 'Internal Server Error' });
  }
});



app.put('/korisnik', async (req, res) => {
  try {
    // Provjeri da li je korisnik prijavljen
    if (!req.session.username) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Pronađi korisnika po korisničkom imenu u bazi podataka
    const korisnik = await db.Korisnik.findOne({ where: { username: req.session.username } });

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
      // Hashiraj novi password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      korisnik.password = hashedPassword;
    }

    // Spremi promjene u bazu podataka
    await korisnik.save();

    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Greška prilikom ažuriranja podataka korisnika:', error);
    return res.status(500).json({ greska: 'Internal Server Error' });
  }
});


app.get('/nekretnine', async (req, res) => {
  try {
    // Dohvati sve nekretnine iz baze podataka
    const nekretnine = await db.Nekretnina.findAll();
    res.status(200).json(nekretnine);
  } catch (error) {
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


app.post('/marketing/nekretnine', async (req, res) => {
  try {
    const { nizNekretnina } = req.body;

    for (const nekretninaId of nizNekretnina) {
      let nekretnina = await db.Nekretnina.findOne({
        where: { id: nekretninaId },
      });

      if (nekretnina) {
        nekretnina.pretrage += 1;
        await nekretnina.save();
      }
    }

    res.status(200).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/marketing/nekretnina/:id', async (req, res) => {
  try {
    const nekretninaId = req.params.id;

    let nekretnina = await db.Nekretnina.findOne({
      where: { id: nekretninaId },
    });

    nekretnina.klikovi += 1;
    await nekretnina.save();

    req.session.osvjezi.nizNekretnina = [];
    req.session.osvjezi.nizNekretnina.push(nekretnina);
    req.session.nekretnine.push(nekretnina);

    res.status(200).json();
  } catch (error) {
    console.error(error);
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

    const nekretnine = await db.Nekretnina.findAll({
      where: { id: nizNekretnina },
    });

    const osvjezi = {
      nizNekretnina: nekretnine.map(item => item.toJSON()),
    };

    if (req.session.osvjezi && req.session.osvjezi.length !== 0) {
      const salji = nekretnine.filter(element => {
        const found = req.session.osvjezi.nizNekretnina.find(x => x.id === element.id);
        return found && (found.pretrage !== element.pretrage || found.klikovi !== element.klikovi);
      });

      if (salji.length !== 0) {
        req.session.osvjezi = { nizNekretnina: salji.map(item => item.toJSON()) };
        return res.status(200).json({ nizNekretnina: salji.map(item => item.toJSON()) });
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

app.get('/nekretnina/:id', async (req, res) => {
  try {
    const nekretninaId = req.params.id;

    const nekretnina = await db.Nekretnina.findOne({
      where: { id: nekretninaId }
    });

    if (!nekretnina) {
      console.error(`Nekretnina with id ${nekretninaId} not found`);
      return res.status(404).json({ greska: `Nekretnina with id ${nekretninaId} not found` });
    }

    const upiti = await db.Upit.findAll({
      where: { NekretninaId: nekretninaId }
    });

    for (const upit of upiti) {
      const korisnik = await db.Korisnik.findOne({
        where: { id: upit.KorisnikId }
      });
      upit.korisnik = korisnik.username;
    }

    const mappedNekretnina = {
      id: nekretnina.id,
      tip_nekretnine: nekretnina.tip_nekretnine,
      naziv: nekretnina.naziv,
      kvadratura: nekretnina.kvadratura,
      cijena: nekretnina.cijena,
      tip_grijanja: nekretnina.tip_grijanja,
      lokacija: nekretnina.lokacija,
      godina_izgradnje: nekretnina.godina_izgradnje,
      datum_objave: nekretnina.datum_objave,
      opis: nekretnina.opis,
      upiti: upiti.map(upit => ({
        korisnik_username: upit.korisnik,
        tekst_upita: upit.tekst_upita,
        // Add more properties as needed
      }))
    };

    return res.status(200).json(mappedNekretnina);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ greska: 'Internal Server Error' });
  }
});



app.listen(3000, () => {
  console.log('Server je pokrenut na http://localhost:3000/');
});

