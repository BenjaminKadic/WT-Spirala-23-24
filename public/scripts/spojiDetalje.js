document.addEventListener("DOMContentLoaded", function () {
    const nekretninaId = localStorage.getItem('selectedNekretninaId');

    if (nekretninaId) {
        PoziviAjax.getNekretninaById(nekretninaId, function (status, nekretnina) {
            if (status) {
                PoziviAjax.getKorisnik(function (status, korisnik) {
                    if (status) {
                        updateHtmlWithNekretninaDetails(nekretnina);


                        addUpitInputField(nekretninaId, korisnik);
                    } else {
                        updateHtmlWithNekretninaDetails(nekretnina);
                    }
                });
            } else {
                console.error('Nema pohranjenog ID-a nekretnine.');
            }
        });
    }
});

function addUpitInputField(nekretninaId, korisnik) {
    const upitInputContainer = document.getElementById('upit-input-container');

    if (upitInputContainer) {
        const inputField = document.createElement('input');
        inputField.id="inputUpit";
        inputField.type = 'text';
        inputField.placeholder = 'Unesite upit...';
        inputField.id = 'upit-input';

        const submitButton = document.createElement('button');
        submitButton.id="submitButton";
        submitButton.textContent = 'Postavi upit';
        submitButton.addEventListener('click', function () {
            postUpit(nekretninaId, korisnik);
        });

        upitInputContainer.appendChild(inputField);
        upitInputContainer.appendChild(submitButton);
    } else {
        console.error('Element s ID-om "upit-input-container" nije pronađen.');
    }
}

function postUpit(nekretninaId, korisnik) {
    const upitInput = document.getElementById('upit-input');

    if (upitInput && nekretninaId && korisnik) {
        const tekstUpita = upitInput.value;

        PoziviAjax.postUpit(nekretninaId, tekstUpita, function (status, poruka) {
            if (status) {
                console.log('Upit uspješno postavljen.');

                updateUpiti(nekretninaId);
            } else {
                console.error('Greška prilikom postavljanja upita: ' + poruka);
            }
        });
    }
}

function updateHtmlWithNekretninaDetails(nekretnina) {

    document.getElementById('osnovno').innerHTML = `
            <img src="${nekretnina.slika}" alt="Nekretnina">
            <p><b>Naziv</b>: ${nekretnina.naziv}</p>
            <p><b>Kvadratura</b>: ${nekretnina.kvadratura} m²</p>
            <p><b>Cijena</b>: ${nekretnina.cijena} KM</p>
        `;


    document.getElementById('detalji').innerHTML = `
            <div class="info">
                <p><b>Tip Grijanja</b>: ${nekretnina.tip_grijanja}</p>
                <p><b>Godina Izgradnje</b>: ${nekretnina.godina_izgradnje}</p>
                <p><b>Lokacija</b>: ${nekretnina.lokacija}</p>
                <p><b>Datum Objave</b>: ${nekretnina.datum_objave}</p>
            </div>
            <p><b>Opis</b> ${nekretnina.opis}</p>
        `;

    updateUpiti(nekretnina.id);

}

function updateUpiti(nekretninaId) {
    PoziviAjax.getNekretninaById(nekretninaId, function (status, nekretnina) {
        if (status) {
            const upitiElement = document.getElementById('upiti');
            upitiElement.innerHTML = '';

            nekretnina.upiti.forEach(upit => {
                const upitElement = document.createElement('li');
                upitElement.className = 'upit';
                upitElement.innerHTML = `
                <p><b>${upit.korisnik_username}</b></p>
                <p>${upit.tekst_upita}</p>
            `;
                upitiElement.appendChild(upitElement);
            });
        }
        else{
            console.error('Nema pohranjenog ID-a nekretnine.');
        }
    });
}


