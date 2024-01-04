const MarketingAjax = (() => {
    let parameter = "";
    let isFirstExecution = true;

    const interval = setInterval(() => {
        osvjeziKlikove(parameter);

        if (!isFirstExecution) {
            clearInterval(interval);
            setInterval(() => osvjeziKlikove(parameter), 500);
        }
    }, 500);

    const RefreshList = [];
    const list = {
        nizNekretnina: []
    };
    const divs = ["#stan", "#kuca", "#pp"];

    function osvjeziPretrage(divNekretnine) {
        divs.forEach(type => {
            RefreshList.forEach(nekretnina => {
                const square = divNekretnine.querySelector(type).querySelector("#nekretnina-" + nekretnina.id)
                if (square) {
                    const SearchNumber = square.querySelector(`#pretrage-${nekretnina.id}`).querySelector("#br_pretraga");
                    const ClickNumber = square.querySelector(`#klikovi-${nekretnina.id}`).querySelector("#br_klikova");

                    if (nekretnina.pretrage && nekretnina.pretrage !== 0) {
                        SearchNumber.innerHTML = "Pretrage: " + nekretnina.pretrage;
                        SearchNumber.style.display = "";
                    }
                    if (nekretnina.klikovi && nekretnina.klikovi !== 0) {
                        ClickNumber.innerHTML = "Klikovi: " + nekretnina.klikovi;
                        ClickNumber.style.display = "";
                    }
                }
            });
        });
        parameter = divNekretnine;
        isFirstExecution = false;
    }

    function osvjeziKlikove(divNekretnine) {

        const ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200) {
                if (ajax.responseText !== "") {
                    const newData = JSON.parse(ajax.responseText).nizNekretnina;
                    RefreshList.length = 0;
                    newData.forEach(item => {
                        const existingItemIndex = RefreshList.findIndex(el => el.id === item.id);
                        if (existingItemIndex !== -1) {
                            RefreshList[existingItemIndex] = item;
                        } else {
                            RefreshList.push(item);
                        }
                    });
                    localStorage.setItem('niz', JSON.stringify(RefreshList));
                } else {
                    const storedArrayString = localStorage.getItem('niz');
                    const retrievedArray = JSON.parse(storedArrayString);
                    retrievedArray.forEach(item => {
                        const existingItemIndex = RefreshList.findIndex(el => el.id === item.id);
                        if (existingItemIndex !== -1) {
                            RefreshList[existingItemIndex] = item;
                        }
                    });
                }
                osvjeziPretrage(divNekretnine);
            } else if (ajax.readyState === 4) {
            }
        };

        ajax.open('POST', '/marketing/osvjezi');
        ajax.setRequestHeader('Content-Type', 'application/json');
        if (list.nizNekretnina.length !== 0) {
            ajax.send(JSON.stringify(list));
            list.nizNekretnina.length = 0;
        } else {
            ajax.send();
        }

    }

    function novoFiltriranje(listaFiltriranihNekretnina) {
        const ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200) {
                start = 1;
            }
        };

        list.nizNekretnina.length = 0;

        listaFiltriranihNekretnina.forEach(nekretnina => {
            const existingItemIndex = list.nizNekretnina.findIndex(el => el.id === nekretnina.id);
            if (existingItemIndex !== -1) {
                list.nizNekretnina[existingItemIndex] = nekretnina.id;
            } else {
                list.nizNekretnina.push(nekretnina.id);
            }
        });

        ajax.open('POST', '/marketing/nekretnine');
        ajax.setRequestHeader('Content-Type', 'application/json');
        ajax.send(JSON.stringify(list));
    }

    function klikNekretnina(idNekretnine) {
        const ajax = new XMLHttpRequest();

        list.nizNekretnina.length = 0;
        const existingItemIndex = list.nizNekretnina.findIndex(el => el.id === idNekretnine);
        if (existingItemIndex !== -1) {
            list.nizNekretnina[existingItemIndex] = idNekretnine;
        } else {
            list.nizNekretnina.push(idNekretnine);
        }

        ajax.open('POST', `/marketing/nekretnina/${idNekretnine}`);
        ajax.send();
    }

    return {
        osvjeziPretrage: osvjeziPretrage,
        osvjeziKlikove: osvjeziKlikove,
        novoFiltriranje: novoFiltriranje,
        klikNekretnina: klikNekretnina
    };
})();
