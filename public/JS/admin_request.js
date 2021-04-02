/*
 *   Filename: request.js
 *   Project: Leo-World Shop
 *   Author: Malay Bhavsar
 *   @ All Rights Reserved
 */
function set_auth() {
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/x-www-form-urlencoded",
            Authorization: "bearer " + getCookie("token"),
        },
    });
}
function new_product() {
    set_auth();
    $.post(
        "/su/add_product",
        {
            name: $("#name").val(),
            price: $("#price").val(),
            img: $("#img").val(),
            category: $("#category").val(),
            details: $("#detail").val(),
            specs: $("#specs").val(),
        },
        function (data, status, jqXHR) {
            // success callback
            if (status == "success" && data.success == true) {
                go_to_web("/su/");
            } else {
                alert(data.msg);
            }
        }
    );
}
function save_product() {
    set_auth();
    var xget = new URLSearchParams(window.location.search);
    $.post(
        "/su/ch_product",
        {
            product_id: xget.get("id"),
            name: $("#name").val(),
            price: $("#price").val(),
            img: $("#img").val(),
            details: $("#detail").val(),
            specs: $("#specs").val(),
            category: $("#category").val(),
        },
        function (data, status, jqXHR) {
            // success callback
            if (status == "success" && data.success == true) {
                alert(data.msg);
                document.location.reload();
            } else {
                alert(data.msg);
            }
        }
    );
}
function rm_product() {
    pass = confirm("Are you sure you want to delete this product?");
    var xget = new URLSearchParams(window.location.search);
    if (getCookie("token") != "" && pass == true) {
        set_auth();
        $.post(
            "/su/rm_product",
            {
                product_id: xget.get("id"),
            },
            function (data, status, jqXHR) {
                if (status == "success" && data.success == true) {
                    go_to_web("/su/");
                } else {
                    alert(data.msg);
                }
            }
        );
    } else {
        go_to_web("/a/login");
    }
}
function get_product() {
    if (getCookie("token") != "") {
        set_auth();
        var xget = new URLSearchParams(window.location.search);
        $.post(
            "/su/get_product",
            { product_id: xget.get("id") },
            function (data, status, jqXHR) {
                if (status == "success" && data.success == true) {
                    display_product_a(data.body);
                }
                document.getElementById("name").disabled = true;
                document.getElementById("price").disabled = true;
                document.getElementById("img").disabled = true;
                document.getElementById("detail").disabled = true;
                document.getElementById("specs").disabled = true;
                document.getElementById("category").disabled = true;
            }
        );
    } else {
        go_to_web("/a/login");
    }
}
function get_list() {
    set_auth();
    $.post("/su/list", {}, function (data, status, jqXHR) {
        if (status == "success" && data.success == true) {
            display_list(data.body);
        } else {
            alert(data.msg);
        }
    });
}
function get_order_ls() {
    set_auth();
    $.post("/su/order", {}, function (data, status, jqXHR) {
        if (status == "success" && data.success == true) {
            display_order_ls(data.body);
        } else {
            alert(data.msg);
        }
    });
}
function pack_deport_order(id) {
    set_auth();
    $.post(
        "/su/pack_deport_order",
        { order_id: id },
        function (data, status, jqXHR) {
            if (status == "success" && data.success == true) {
                alert(data.msg);
                document.location.reload();
            } else {
                alert(data.msg);
            }
        }
    );
}
function get_admin_data() {
    set_auth();
    $.post("/su/admin_dash", {}, function (data, status, jqXHR) {
        if (status == "success" && data.success == true) {
            display_admin(data.body);
        } else {
            alert(data.msg);
        }
    });
}
