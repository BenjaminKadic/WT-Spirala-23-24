function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });
    divReferenca.innerHTML = "";
    if (filtriraneNekretnine.length > 0) {
        filtriraneNekretnine.forEach(nekretnina => {
            const nekretninaDiv = document.createElement('div');
            nekretninaDiv.className = 'nekretnina';
            nekretninaDiv.id = `nekretnina-${nekretnina.id}`;
            nekretninaDiv.innerHTML = `
            <img src="${nekretnina.slika}" alt="${nekretnina.naziv}">
            <p class="naziv">${nekretnina.naziv}</p>
            <p class="kvadratura">${nekretnina.kvadratura} m²</p>
            <p class="cijena">${nekretnina.cijena} KM</p>
            <button onclick="detalji(${nekretnina.id})">Detalji</button>
            <div class="dodatno" style="display: none;">
                <p>Lokacija: ${nekretnina.lokacija}</p>
                <p>Godina izgradnje: ${nekretnina.godina_izgradnje}</p>
                <button onclick="otvoriDetalje(${nekretnina.id})" style="display: none; margin: 0 auto;">Otvori detalje</button>
            </div>
            <div class="pretrage" id="pretrage-${nekretnina.id}">
                <span id="br_pretraga">Pretraga: 0</span>
            </div>
            <div class="klikovi" id="klikovi-${nekretnina.id}">
                <span id="br_klikova">Klikova: 0</span>
            </div>
            `;
            divReferenca.appendChild(nekretninaDiv);
        });
    }

}

PoziviAjax.getNekretnine(function (status, data) {
    if (status) {
        const nekretnineSaServera = JSON.parse(data);

        // Instanciranje modula s novim podacima
        const nekretnineModul = SpisakNekretnina();
        nekretnineModul.init(nekretnineSaServera, listaKorisnika);

        // Pozivanje funkcije za prikaz nekretnina
        spojiNekretnine(document.getElementById("stan"), nekretnineModul, "Stan");
        spojiNekretnine(document.getElementById("kuca"), nekretnineModul, "Kuća");
        spojiNekretnine(document.getElementById("pp"), nekretnineModul, "Poslovni prostor");
        MarketingAjax.novoFiltriranje(nekretnineModul.filtrirajNekretnine(null));
        MarketingAjax.osvjeziKlikove(nekretnineDiv);


    } else {
        console.error('Greška prilikom dohvaćanja nekretnina sa servera.');
    }
});

const listaKorisnika = []

const nekretnineDiv = document.getElementById("nekretnine");

document.getElementById("buttonPretraga").addEventListener('click', function () {
    // Dobavi vrijednosti iz polja
    var minCijena = document.getElementById("minCijena").value;
    var maxCijena = document.getElementById("maxCijena").value;
    var minKvadratura = document.getElementById("minKvadratura").value;
    var maxKvadratura = document.getElementById("maxKvadratura").value;

    // Kreiraj objekat kriterija
    var kriterij = {
        min_cijena: parseInt(minCijena, 10),
        max_cijena: parseInt(maxCijena, 10),
        min_kvadratura: parseInt(minKvadratura, 10),
        max_kvadratura: parseInt(maxKvadratura, 10)
    };


    PoziviAjax.getNekretnine(function (status, data) {
        if (status) {
            const nekretnineSaServera = JSON.parse(data);

            // Instanciranje modula s novim podacima
            const nekretnineModul = SpisakNekretnina();
            nekretnineModul.init(nekretnineSaServera, listaKorisnika);

            let filtrirane = nekretnineModul.filtrirajNekretnine(kriterij);
            const nekretnineModulFilter = SpisakNekretnina();
            nekretnineModulFilter.init(filtrirane, listaKorisnika);

            spojiNekretnine(document.getElementById("stan"), nekretnineModulFilter, "Stan");
            spojiNekretnine(document.getElementById("kuca"), nekretnineModulFilter, "Kuća");
            spojiNekretnine(document.getElementById("pp"), nekretnineModulFilter, "Poslovni prostor");
            MarketingAjax.novoFiltriranje(filtrirane);
        } else {
            console.error('Greška prilikom dohvatanja nekretnina sa servera.');
        }
    });
});


function detalji(id) {
    const nekretninaDiv = document.getElementById(`nekretnina-${id}`);
    const additionalDetailsDiv = nekretninaDiv.querySelector('.dodatno');
    const otvoriDetaljeBtn = nekretninaDiv.querySelector('button[onclick*="otvoriDetalje"]');

    // Toggle display of additional details
    additionalDetailsDiv.style.display = additionalDetailsDiv.style.display === 'none' ? 'block' : 'none';

    // Toggle display of "Otvori detalje" button
    otvoriDetaljeBtn.style.display = otvoriDetaljeBtn.style.display === 'none' ? 'block' : 'none';
    MarketingAjax.klikNekretnina(id);
}

function otvoriDetalje(id){
    console.log('Pritisnuto dugme Otvori detalje za nekretninu ID:', id);

    // Postavi selectedNekretninaId u localStorage
    localStorage.setItem('selectedNekretninaId', id);

    // Preusmjeri korisnika na detalji.html
    console.log('Preusmjeravam korisnika na detalji.html sa id-em '+ localStorage.getItem('selectedNekretninaId'));
    window.location.href = 'detalji.html';
}

