window.onload = function () {
    var dugme = document.getElementById("buttonSubmit");
    dugme.onclick = function () {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        function odgovor(status) {
            if (status) {
                pozitivniOdgovor();
            } else {
                negativniOdgovor();
            }
        }

        function pozitivniOdgovor() {
            setTimeout(() => {
                window.location.replace("nekretnine.html");
            }, 1000);
        }

        function negativniOdgovor() {
            setTimeout(() => {
                window.location.replace("prijava.html");
            }, 1500);
        }

        PoziviAjax.postLogin(username, password, odgovor);
    }
}