function get_header() {
    if (getCookie("token")) {
        var head =
            '<p id="title" onclick="go_to_web(' +
            "'" +
            "/su/" +
            "'" +
            ')">LEO-WORLD</p><p id="subtitle">Your one-stop shop!</p><div class="subheader"><div class="header-drop-down"><button class="header-drop-btn">&#9776;</button><div class="header-drop-down-content"><a onclick="go_to_web(' +
            "'" +
            "/a/account" +
            "'" +
            ')">Account</a><a onclick="go_to_web(' +
            "'" +
            "/su/new_product" +
            "'" +
            ')">New Product</a><a onclick="go_to_web(' +
            "'" +
            "/su/list" +
            "'" +
            ')">List</a><a onclick="logout()">Logout</a></div></div></div>';
    } else {
        var head =
            '<p id="title" onclick="go_to_web(' +
            "'" +
            "/u/home" +
            "'" +
            ')">LEO-WORLD</p><p id="subtitle">Your one-stop shop!</p><div class="subheader"><div class="header-drop-down"><button class="header-drop-btn">&#9776;</button><div class="header-drop-down-content"><a onclick="go_to_web(' +
            "'" +
            "/a/new_account" +
            "'" +
            ')">New Account</a><a onclick="go_to_web(' +
            "'" +
            "/a/login" +
            "'" +
            ')">Login</a></div></div></div>';
    }
    document.getElementById("header").innerHTML = head;
}

function get_footer() {
    document.getElementById("footer").innerHTML =
        '<p id="title" onclick="go_to_web(' +
        "'" +
        "/su/" +
        "'" +
        ')">LEO-WORLD</p><p id="subtitle">Your one-stop shop!</p><div class="subheader"><p id="subtitle"><b>Contact Me:</b><br /><b>Mail:</b> dev.malay.290@gmail.com<br /><b>HeadOffice:</b>Navsari, Gujarat, India</p></div>';
}
