function go_to_web(path) {
    document.location.href = path;
}
function setCookie(name, value) {
    var d = new Date();
    d.setTime(d.getTime() + 86400000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
function getCookie(name) {
    var name = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function validate(id) {
    var ls = [];
    id.forEach((element) => {
        var val = document.getElementById(element);
        if (val.value == "") {
            ls.push(val.name);
        }
    });
    if (ls.length != 0) {
        display_err("Please enter the incomplete field: " + ls);
        return false;
    } else {
        return true;
    }
}
function display_err(text) {
    document.getElementById("err").innerHTML = '<p id="error">' + text + "</p>";
}
function clear_err() {
    document.getElementById("err").innerHTML = "";
}
function inc_qty(i) {
    var x = parseInt(document.getElementById("item" + i).innerText);
    var y = parseInt(document.getElementById("bitem" + i).innerText);
    var item_price = parseInt(
        document.getElementById("item_price" + i).innerText
    );
    var total = parseInt(document.getElementById("total_cost").innerText);
    total -= y;
    x += 1;
    y = x * item_price;
    total += y;
    document.getElementById("item" + i).innerText = x.toString();
    document.getElementById("bitem" + i).innerText = y.toString();
    document.getElementById("total_cost").innerText = total.toString();
    document.getElementsByName("btn" + i)[0].hidden = false;
}
function dec_qty(i) {
    var x = parseInt(document.getElementById("item" + i).innerText);
    var y = parseInt(document.getElementById("bitem" + i).innerText);
    var item_price = parseInt(
        document.getElementById("item_price" + i).innerText
    );
    var total = parseInt(document.getElementById("total_cost").innerText);
    if (x > 0) {
        total -= y;
        x -= 1;
        y = x * item_price;
        total += y;
        document.getElementById("item" + i).innerText = x.toString();
        document.getElementById("bitem" + i).innerText = y.toString();
        document.getElementById("total_cost").innerText = total.toString();
        document.getElementsByName("btn" + i)[0].hidden = false;
    }
}
