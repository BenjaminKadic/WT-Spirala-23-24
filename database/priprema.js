const db = require('./db.js');

db.sequelize.sync({ force: true }).then(function () {
    inicializacija().then(function () {
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
        process.exit();
    });
});

function inicializacija() {
    return db.Korisnik.create({
        ime: 'Neko',
        prezime: 'Nekic',
        username: 'username1',
        password: '$2b$10$JXDjJ4OWk.O3Y1NqFZj0BOLHcH3N6//scR.d4l06NOVE3L9fFd6p.'
    }).then(function () {
        return db.Korisnik.create({
            ime: 'Neko2',
            prezime: 'Nekic2',
            username: 'username2',
            password: '$2b$10$JXDjJ4OWk.O3Y1NqFZj0BOLHcH3N6//scR.d4l06NOVE3L9fFd6p.'
        });
    }).then(function () {
        return db.Nekretnina.create({
            tip_nekretnine: 'Stan',
            naziv: 'Useljiv stan Sarajevo',
            kvadratura: 58,
            cijena: 232000,
            tip_grijanja: 'plin',
            lokacija: 'Novo Sarajevo',
            godina_izgradnje: 2019,
            datum_objave: '01.10.2023.',
            opis: 'Sociis natoque penatibus.',
            klikovi: 0,
            pretrage: 0
        });
    }).then(function () {
        return db.Nekretnina.create({
            tip_nekretnine: 'Poslovni prostor',
            naziv: 'Mali poslovni prostor',
            kvadratura: 20,
            cijena: 70000,
            tip_grijanja: 'struja',
            lokacija: 'Centar',
            godina_izgradnje: 2005,
            datum_objave: '20.08.2023.',
            opis: 'Magnis dis parturient montes.',
            klikovi: 0,
            pretrage: 0
        });
    }).then(function () {
        return db.Korisnik.findOne({ where: { username: 'username1' } }).then(function (korisnik) {
            return db.Nekretnina.findOne({ where: { naziv: 'Useljiv stan Sarajevo' } }).then(function (nekretnina) {
                return db.Upit.create({
                    tekst_upita: 'Nullam eu pede mollis pretium',
                    KorisnikId: korisnik.id,
                    NekretninaId: nekretnina.id,
                });
            });
        });
    }).then(function () {
        return db.Korisnik.findOne({ where: { username: 'username2' } }).then(function (korisnik) {
            return db.Nekretnina.findOne({ where: { naziv: 'Mali poslovni prostor' } }).then(function (nekretnina) {
                return db.Upit.create({
                    tekst_upita: 'Phasellus viverra nulla',
                    KorisnikId: korisnik.id,
                    NekretninaId: nekretnina.id,
                });
            });
        });
    }).then(function () {
        console.log('Podaci uspjesno dodani u bazu.');
    }).catch(function (err) {
        console.error('Greska prilikom dodavanja podataka u bazu:', err);
    });
}
