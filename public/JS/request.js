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
function login() {
    clear_err();
    if (validate(["username", "password"]) == true) {
        $.post(
            "/a/login",
            {
                username: $("#username").val(),
                password: $("#password").val(),
            },
            function (data, status, jqXHR) {
                // success callback
                if (status == "success" && data.success == true) {
                    if (data.token) {
                        setCookie("token", data.token);
                        go_to_web("/u/home");
                    } else {
                        display_err(data.msg);
                    }
                } else {
                    display_err(data.msg);
                }
            }
        );
    }
}
function logout() {
    if (confirm("Are you sure, you want to Logout")) {
        set_auth();
        $.post("/a/logout", {}, function (data, status, jqXHR) {
            // success callback
            if (
                status == "success" &&
                (data.success == true || data.success == false)
            ) {
                setCookie("token", "");
                document.location.reload();
            }
        });
    }
}
function new_account() {
    clear_err();
    if (
        validate([
            "name",
            "username",
            "password",
            "cpassword",
            "mobile_no",
            "email",
            "city",
            "state",
            "country",
        ]) == true
    ) {
        if ($("#password").val() == $("#cpassword").val()) {
            $.post(
                "/a/new_account",
                {
                    name: $("#name").val(),
                    username: $("#username").val(),
                    password: $("#password").val(),
                    mobile_no: $("#mobile_no").val(),
                    email: $("#email").val(),
                    city: $("#city").val(),
                    state: $("#state").val(),
                    country: $("#country").val(),
                },
                function (data, status, jqXHR) {
                    // success callback
                    if (status == "success" && data.success == true) {
                        go_to_web("/a/login");
                    } else {
                        display_err(data.msg);
                    }
                }
            );
        } else {
            display_err("Both password and c-password must match");
        }
    }
}
function get_cart() {
    set_auth();
    $.get("/u/get_cart", {}, function (data, status, jqXHR) {
        if (status == "success" && data.success == true) {
            display_cart(data.body);
        }
    });
}
function rm_cart(num) {
    if (getCookie("token") != "") {
        set_auth();
        $.post(
            "/u/rm_cart",
            {
                product_id: num,
            },
            function (data, status, jqXHR) {
                alert(data.msg);
                document.location.reload();
                pay_amount = parseInt(
                    document.getElementById("total_cost").innerText
                );
                $.post(
                    "/u/pay_cart",
                    { pay_amount },
                    function (data, status, jqXHR) {}
                );
            }
        );
    } else {
        go_to_web("/a/login");
    }
}
function ch_cart(num) {
    if (getCookie("token") != "") {
        set_auth();
        pay_amount = parseInt(document.getElementById("total_cost").innerText);
        $.post("/u/pay_cart", { pay_amount }, function (data, status, jqXHR) {
            if (data.success == true && status == "success") {
                $.post(
                    "/u/ch_cart",
                    {
                        product_id: num,
                        product_qty: parseInt(
                            document.getElementById("item" + num).innerText
                        ),
                    },
                    function (data, status, jqXHR) {
                        document.location.reload();
                    }
                );
            }
        });
    } else {
        go_to_web("/a/login");
    }
}
function add_cart(num) {
    if (getCookie("token") != "") {
        set_auth();
        $.post(
            "/u/add_cart",
            {
                product_id: num,
                product_qty: 1,
            },
            function (data, status, jqXHR) {
                alert(data.msg);
            }
        );
    } else {
        go_to_web("/a/login");
    }
}
function get_home() {
    $.post("/u/home", {}, function (data, status, jqXHR) {
        if (status == "success" && data.success == true) {
            display_home(data.category, data.body);
        }
    });
}
function get_category_ls() {
    $.post("/u/category", {}, function (data, status, jqXHR) {
        if (status == "success" && data.success == true) {
            display_category_ls(data.body);
        }
    });
}
function get_category(cat_name) {
    $.post(
        "/u/get_category",
        { category: cat_name },
        function (data, status, jqXHR) {
            if (status == "success" && data.success == true) {
                display_home(data.category, data.body);
            }
        }
    );
}
function save_account() {
    clear_err();
    if (
        validate(["name", "mobile_no", "email", "city", "state", "country"]) ==
        true
    ) {
        set_auth();
        $.post(
            "/a/ch_account",
            {
                name: $("#name").val(),
                "personal.mobile_no": $("#mobile_no").val(),
                "personal.email": $("#email").val(),
                "address.city": $("#city").val(),
                "address.state": $("#state").val(),
                "address.country": $("#country").val(),
            },
            function (data, status, jqXHR) {
                // success callback
                if (status == "success" && data.success == true) {
                    go_to_web("/a/account");
                } else {
                    display_err(data.msg);
                }
            }
        );
    }
}
function del_account() {
    var pass = prompt(
        "Are you sure you want to delete your account? If yes then enter your password to Continue!",
        "Your Password"
    );
    if (getCookie("token") != "" && pass) {
        set_auth();
        $.post(
            "/a/rm_account",
            {
                password: pass,
            },
            function (data, status, jqXHR) {
                if (status == "success" && data.success == true) {
                    setCookie("token", "");
                    go_to_web("/a/login");
                } else {
                    alert(data.msg);
                }
            }
        );
    } else {
        go_to_web("/a/login");
    }
}
function get_account() {
    if (getCookie("token") != "") {
        set_auth();
        $.post("/a/get_account", {}, function (data, status, jqXHR) {
            if (status == "success" && data.success == true) {
                display_account(data.body);
            }
            document.getElementById("name").disabled = true;
            document.getElementById("username").disabled = true;
            document.getElementById("mobile_no").disabled = true;
            document.getElementById("email").disabled = true;
            document.getElementById("city").disabled = true;
            document.getElementById("state").disabled = true;
            document.getElementById("country").disabled = true;
        });
    } else {
        go_to_web("/a/login");
    }
}
function get_order() {
    set_auth();
    $.post("/u/order", {}, function (data, status, jqXHR) {
        if (status == "success") {
            display_order(data.body);
        } else {
            alert(data.msg);
        }
    });
}
function place_order() {
    set_auth();
    $.get("/u/bill", {}, function (data, status, jqXHR) {
        var data = data.body;
        $.post(
            "/u/place_order",
            {
                pay_type: $("#pay_type").val(),
                pay_amount: (
                    data.pay_amount *
                    (1 + data.service_tax / 100 + data.delivery_chrg / 100)
                ).toFixed(2),
                name: $("#rname").val(),
                msg: $("#msg").val(),
                address: $("#addr").val(),
                mobile_no: $("#mobile_no").val(),
            },
            function (data, status, jqXHR) {
                if (status == "success" && data.success == true) {
                    go_to_web(
                        "/u/order_confirm?order_id=" +
                            data.order_id +
                            "&pay_type=" +
                            $("#pay_type").val()
                    );
                } else {
                    alert(data.msg);
                }
            }
        );
    });
}
function cancel_order(num) {
    if (
        confirm(
            "Are you sure you want to cancel your order? *Charges May Apply"
        ) == true
    ) {
        set_auth();
        $.post(
            "/u/cancel_order",
            { order_id: num },
            function (data, status, jqXHR) {
                if (status == "success") {
                    window.location.reload();
                } else {
                    alert(data.msg);
                }
            }
        );
    }
}
function get_product() {
    var xget = new URLSearchParams(window.location.search);
    $.post(
        "/u/product",
        { product_id: xget.get("id") },
        function (data, status, jqXHR) {
            if (status == "success") {
                display_product(data.body);
            }
        }
    );
}
function get_bill() {
    set_auth();
    $.get("/u/bill", {}, function (data, status, jqXHR) {
        if (status == "success" && data.success == true) {
            display_bill(data.body);
        } else {
            alert(data.msg);
        }
    });
}
