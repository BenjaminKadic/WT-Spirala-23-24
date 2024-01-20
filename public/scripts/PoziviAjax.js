const PoziviAjax = (() => {

    // fnCallback se u svim metodama poziva kada stigne
    // odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data,
    // error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška, poruka se prosljeđuje u error parametru
    // callback-a, a data je tada null

    // vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        const ajax = new XMLHttpRequest();
        ajax.open("GET", "/korisnik", true);
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    fnCallback(true, JSON.parse(ajax.responseText));
                } else {
                    fnCallback(false);
                }
            }
        };
        ajax.send();
    }
    
    

    // ažurira podatke loginovanog korisnika
    function impl_putKorisnik(noviPodaci, fnCallback) {
        const ajax = new XMLHttpRequest();
        ajax.open("PUT", "/korisnik", true);
        ajax.setRequestHeader("Content-Type", "application/json");
    
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    fnCallback(true);
                } else {
                    fnCallback(false);
                }
            }
        };
    
        ajax.send(JSON.stringify(noviPodaci));
    }
    

    // dodaje novi upit za trenutno loginovanog korisnika
    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        const ajax = new XMLHttpRequest();
        ajax.open("POST", "/upit", true);
        ajax.setRequestHeader("Content-Type", "application/json");
    
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    fnCallback(true);
                } else if (ajax.status == 400) {
                    fnCallback(false, "Nekretnina ne postoji");
                } else if (ajax.status == 401) {
                    fnCallback(false, "Neautorizovan pristup");
                }
            }
        };
    
        const data = {
            nekretnina_id: nekretnina_id,
            tekst_upita: tekst_upita
        };
    
        ajax.send(JSON.stringify(data));
    }
    
    function impl_getNekretnine(fnCallback) {
        const ajax = new XMLHttpRequest();
        ajax.open("GET", "/nekretnine", true);
    
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    const nekretnine = JSON.parse(JSON.stringify(ajax.responseText));
                    fnCallback(true, nekretnine);

                } else {
                    fnCallback(false);
                }
            }
        };
    
        ajax.send(null);
    }
    
    
    function impl_postLogin(username, password, fnCallback) {
        const ajax = new XMLHttpRequest();
        ajax.open("POST", "/login", true);
        ajax.setRequestHeader("Content-Type", "application/json");
    
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    fnCallback(true);
                } else {
                    fnCallback(false);
                }
            }
        };
    
        const data = {
            username: username,
            password: password
        };
    
        ajax.send(JSON.stringify(data));
    }
    
    function impl_postLogout(fnCallback) {
        const ajax = new XMLHttpRequest();
        ajax.open("POST", "/logout", true);
    
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    fnCallback(true);
                } else {
                    fnCallback(false);
                }
            }
        };
    
        ajax.send(null);
    }

    function impl_getNekretninaById(nekretnina_id, fnCallback) {
        const ajax = new XMLHttpRequest();
        ajax.open("GET", `/nekretnina/${nekretnina_id}`, true);
    
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    const data = JSON.parse(ajax.responseText);
                    fnCallback(true, data);
                } else {
                    fnCallback(false);
                }
            }
        };
    
        ajax.send(null);
    }
    

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getNekretninaById: impl_getNekretninaById
    };
})();