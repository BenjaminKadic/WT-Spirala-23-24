function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    // Pozivanje metode za filtriranje
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });

    // Iscrtavanje elemenata u divReferenca element
    const divNekretnine = document.createElement('div');
    divNekretnine.className='nekretnine';
    divReferenca.appendChild(divNekretnine);
    if (filtriraneNekretnine.length === 0) {
    } else {
        filtriraneNekretnine.forEach(nekretnina => {
            const nekretninaDiv = document.createElement('div');
            nekretninaDiv.className='nekretnina';
            nekretninaDiv.innerHTML = `
                <img src="${nekretnina.slika}" alt="${nekretnina.naziv}">
                <p class="naziv">${nekretnina.naziv}</p>
                <p class="kvadratura">${nekretnina.kvadratura} m²</p>
                <p class="cijena">${nekretnina.cijena} KM</p>
                <button>Detalji</button>
            `;
            divNekretnine.appendChild(nekretninaDiv);
        });
    }
}

PoziviAjax.getNekretnine(function(status, data) {
    if (status) {
        const nekretnineSaServera = JSON.parse(data);

        // Instanciranje modula s novim podacima
        const nekretnineModul = SpisakNekretnina();
        nekretnineModul.init(nekretnineSaServera, listaKorisnika);

        // Pozivanje funkcije za prikaz nekretnina
        spojiNekretnine(document.getElementById("stan"), nekretnineModul, "Stan");
        spojiNekretnine(document.getElementById("kuca"), nekretnineModul, "Kuća");
        spojiNekretnine(document.getElementById("pp"), nekretnineModul, "Poslovni prostor");
    } else {
        console.error('Greška prilikom dohvaćanja nekretnina sa servera.');
    }
});

const listaKorisnika = []
