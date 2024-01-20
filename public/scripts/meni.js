window.onload = function () {
    PoziviAjax.getKorisnik(callback);
};

function callback(status){
    updateMenu(status)
};

function updateMenu(isLoggedIn) {
    if(!isLoggedIn) isLoggedIn=false
    var menuItems = document.querySelectorAll("#navigacija ul li");
  
    menuItems.forEach(function (item) {
        item.style.display = "none";
    });
  
    var prijavaLink = document.getElementById("prijavaLink");
    var odjavaButton = document.createElement("button");
    odjavaButton.textContent = "Odjava";
    odjavaButton.id = "odjavaButton";
  
    if (isLoggedIn) {
        prijavaLink.replaceWith(odjavaButton);
        odjavaButton.addEventListener('click', function () {
            PoziviAjax.postLogout(function(bool){
                if(bool){
                    odjavaButton.replaceWith(prijavaLink);
                    window.top.location.href="/prijava.html";
                }else{
                    console.log("Error logging out", error);
                }
            });
            
        });
        odjavaButton.parentElement.style.display = "inline";
        document.getElementById("nekretnine").parentElement.style.display = "inline";
        document.getElementById("profil").parentElement.style.display = "inline";
    } else {
        prijavaLink.parentElement.style.display = "inline";
        document.getElementById("nekretnine").parentElement.style.display = "inline";
        document.getElementById("profil").parentElement.style.display = "none";
    }
}
