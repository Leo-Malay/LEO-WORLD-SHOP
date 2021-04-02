function display_address() {
    var name_r = document.getElementById("rname").value;
    var msg_r = document.getElementById("msg").value;
    var addr_r = document.getElementById("addr").value;
    var mob_no = document.getElementById("mobile_no").value;
    code =
        "<p><b>To Dear, </b>" +
        name_r +
        "</p><p><b>Message: </b>" +
        msg_r +
        '</p><div class="inline" id="inline"><p><b>Address: </b></p><p>' +
        addr_r +
        "</p></div><p><b>Mobile No.: </b>" +
        mob_no +
        "</p>";
    document.getElementById("order_box").innerHTML = code;
}
function display_cart(list) {
    item = "";
    bill = "";
    total = 0;
    list.map((ele) => {
        $.post(
            "/u/product",
            {
                product_id: ele.product_id,
                projection: { name: 1, price: 1 },
            },
            function (data, status, jqXHR) {
                if ((status == "success") & (data.success == true)) {
                    console.log(data.body);
                    item =
                        '<li class="li_list" id="' +
                        ele.product_id +
                        '"><div class="item_name">' +
                        data.body.name +
                        '</div><div class="item_detail"><button class="btn-qty" id="btn-true" name="btn' +
                        ele.product_id +
                        '" hidden=true onclick="ch_cart(' +
                        "'" +
                        ele.product_id +
                        "'" +
                        ')">&#10004;</button><button class="btn-qty" id="btn-false" onclick="dec_qty(' +
                        "'" +
                        ele.product_id +
                        "'" +
                        ')">-</button><p class="item_qty" id="item' +
                        ele.product_id +
                        '">' +
                        ele.product_qty +
                        '</p><button class="btn-qty" id="btn-true" onclick="inc_qty(' +
                        "'" +
                        ele.product_id +
                        "'" +
                        ')">+</button><button class="btn" id="btn-primary"><div style="display: inline-flex">$<p id="item_price' +
                        ele.product_id +
                        '">' +
                        data.body.price +
                        '</p>/piece</div></button><button class="btn-qty" id="btn-false" onclick="rm_cart(' +
                        "'" +
                        ele.product_id +
                        "'" +
                        ')">&#10006;</button></div></li>';
                    price = data.body.price * ele.product_qty;
                    bill +=
                        '<div class="bitem"><div class="page-left">' +
                        data.body.name +
                        '</div><div style="display:inline-flex">$<div class="page-right" id="bitem' +
                        ele.product_id +
                        '">' +
                        price +
                        "</div></div></div>";
                    total += price;
                    document.getElementById("ul_list").innerHTML += item;
                    document.getElementById("bill").innerHTML = bill;
                    document.getElementById("total_cost").innerText = total;
                }
            }
        );
    });
}
function display_home(cat_name, list) {
    code =
        '<button class="btn" id="btn-title">' +
        cat_name.toUpperCase() +
        "</button><br>";
    list.map((ele) => {
        code +=
            '<div class="item_box"><img src="' +
            ele.img +
            '" alt="Item_image" id="item_img"/><p id="item_name" onclick="go_to_web(' +
            "'/u/product?id=" +
            ele._id +
            "'" +
            ')">' +
            ele.name +
            '</p><center><button class="btn" id="btn-true">$' +
            ele.price +
            '</button><button class="btn" id="btn-primary" onclick="add_cart(' +
            "'" +
            ele._id +
            "'" +
            ')">ADD TO CART</button></center></div>';
    });
    document.getElementById("products").innerHTML = code;
}
function display_category_ls(list) {
    var code =
        '<button class="btn" id="btn-primary">Search by Category</button>';
    list.map((ele) => {
        code +=
            '<button class="btn-cat" id="btn-cat" onclick="get_category(' +
            "'" +
            ele +
            "'" +
            ')">' +
            ele +
            "</button>";
    });
    document.getElementById("category").innerHTML = code;
}
function edit_account() {
    document.getElementById("name").disabled = false;
    document.getElementById("mobile_no").disabled = false;
    document.getElementById("email").disabled = false;
    document.getElementById("city").disabled = false;
    document.getElementById("state").disabled = false;
    document.getElementById("country").disabled = false;
    document.getElementById("editsave").innerHTML =
        '<button class="btn" id="btn-true" onclick="save_account()">SAVE</button>';
}
function display_account(body) {
    document.getElementById("name").value = body.name;
    document.getElementById("username").value = body.username;
    document.getElementById("mobile_no").value = body.personal.mobile_no;
    document.getElementById("email").value = body.personal.email;
    document.getElementById("city").value = body.address.city;
    document.getElementById("state").value = body.address.state;
    document.getElementById("country").value = body.address.country;
}
function display_order(list) {
    var code = "";
    list.map((ele) => {
        if (ele.status == -1) {
            ele.status = "CANCELLED";
        } else if (ele.status == 0) {
            ele.status = "PLACED";
        } else if (ele.status == 1) {
            ele.status = "PROCESSING";
        } else if (ele.status == 2) {
            ele.status = "OUT FOR DELIVERY";
        } else if (ele.status == 3) {
            ele.status = "DELIVERED";
        }
        code +=
            '<div class="order_item" id="order_id"><button class="btn" id="btn-primary">Order Id: ' +
            ele._id +
            '</button><br /><button class="btn" id="btn-true">STATUS: ' +
            ele.status.toUpperCase() +
            '</button><button class="btn" id="btn-false" onclick="cancel_order(' +
            "'" +
            ele._id +
            "'" +
            ')"';
        if (
            ele.status == "DELIVERED" ||
            ele.status == "CANCELLED" ||
            ele.status == "OUT FOR DELIVERY"
        ) {
            code += ' style="visibility: hidden"';
        }

        code +=
            '>CANCEL</button><button class="btn" id="btn-true">Payable Amount: $' +
            ele.pay_amount +
            '</button><button class="btn" id="btn-primary">Payment type: ' +
            ele.pay_type +
            "</button></div></div>";
    });
    document.getElementById("order").innerHTML = code;
}
function display_product(data) {
    var code =
        '<div class="product_head"><p id="title">' +
        data.name +
        '</p><p id="subtitle">' +
        data.details +
        '</p></div><div class="product_detail"><center><img src="' +
        data.img +
        '" alt="Product" id="product_img"/></center><button class="btn" id="btn-true">$' +
        data.price +
        '</button><button class="btn" id="btn-primary" onclick="add_cart(' +
        "'" +
        data._id +
        "'" +
        ')">ADD TO CART</button><p id="subtitle">Sold By ' +
        data.soldBy +
        '</p><p id="subtitle">Specifications</p><ul>';
    list = data.specs.split(";");
    list.pop();
    list.map((ele) => {
        element = ele.split("=");
        code +=
            "<li><b>" +
            element[0].toUpperCase() +
            ": </b>" +
            element[1] +
            "</li>";
    });
    code +=
        '</ul></div><div class="product_review">Product Reviews Under Construction Babe!</div>';
    document.getElementById("productcontent").innerHTML = code;
}
function proceed_to_pay() {
    pay_amount = parseInt(document.getElementById("total_cost").innerText);
    $.post("/u/pay_cart", { pay_amount }, function (data, status, jqXHR) {
        if (data.success == true && status == "success") {
            go_to_web("/u/billing");
        }
    });
}
function display_bill(data) {
    document.getElementById("service_tax").innerText = data.service_tax;
    document.getElementById("delivery_chrg").innerText = data.delivery_chrg;
    document.getElementById("total_bill").innerText = (
        data.pay_amount *
        (1 + data.service_tax / 100 + data.delivery_chrg / 100)
    ).toFixed(2);
}
function display_order_confirm() {
    var xget = new URLSearchParams(window.location.search);
    code =
        "Order Id: " +
        xget.get("order_id") +
        "<br />TxnId: 0xxxxxxxxxxxx9<br />Payment Type: " +
        xget.get("pay_type") +
        "<br />Date:" +
        new Date().toLocaleString();
    document.getElementById("desc").innerHTML = code;
}
function edit_product_a() {
    document.getElementById("name").disabled = false;
    document.getElementById("price").disabled = false;
    document.getElementById("img").disabled = false;
    document.getElementById("detail").disabled = false;
    document.getElementById("specs").disabled = false;
    document.getElementById("category").disabled = false;
    document.getElementById("editsave").innerHTML =
        '<button class="btn" id="btn-true" onclick="save_product()">SAVE</button>';
}
function display_product_a(body) {
    console.log(body);
    document.getElementById("name").value = body.name;
    document.getElementById("price").value = body.price;
    document.getElementById("img").value = body.img;
    document.getElementById("category").value = body.category;
    document.getElementById("detail").value = body.details;
    document.getElementById("specs").value = body.specs;
}
function display_list(list) {
    var code = "";
    list.map((ele) => {
        code +=
            '<div class="item_box"><img src="' +
            ele.img +
            '" alt="Item_image" id="item_img"/><p id="item_name" onclick="go_to_web(' +
            "'/su/product?id=" +
            ele._id +
            "'" +
            ')">' +
            ele.name +
            '</p><center><button class="btn" id="btn-true">$' +
            ele.price +
            '</button><button class="btn" id="btn-primary" onclick="go_to_web(' +
            "'/su/product?id=" +
            ele._id +
            "'" +
            ')">EDIT</button></center></div>';
    });
    document.getElementById("content").innerHTML = code;
}
function display_order_ls(list) {
    var code = "";
    var count = 0;
    list.map((ele) => {
        if (ele.status == -1) {
            ele.status = "CANCELLED";
        } else if (ele.status == 0) {
            ele.status = "PLACED";
        } else if (ele.status == 1) {
            ele.status = "PROCESSING";
        } else if (ele.status == 2) {
            ele.status = "OUT FOR DELIVERY";
        } else if (ele.status == 3) {
            ele.status = "DELIVERED";
        }
        count++;
        code +=
            '<div class="order_item" id="order_id"><button class="btn" id="btn-primary">Order Id: ' +
            ele._id +
            '</button><br /><button class="btn" id="btn-true">STATUS: ' +
            ele.status.toUpperCase() +
            '</button><button class="btn" id="btn-primary" onclick="pack_deport_order(' +
            "'" +
            ele._id +
            "'" +
            ')"';
        if (
            ele.status == "DELIVERED" ||
            ele.status == "CANCELLED" ||
            ele.status == "OUT FOR DELIVERY"
        ) {
            code += ' style="visibility: hidden"';
        }

        code +=
            '>PACK & SHIP</button><button class="btn" id="btn-true">Payable Amount: $' +
            ele.pay_amount +
            '</button><button class="btn" id="btn-primary">Payment type: ' +
            ele.pay_type +
            "</button></div></div>";
    });
    document.getElementById("order").innerHTML = code;
    document.getElementById("penorder").innerHTML = count;
}
