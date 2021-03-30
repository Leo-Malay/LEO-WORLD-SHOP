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
