<?php
// $encodedDebtMoney = $_GET['debtMoney'];

// $debtMoney = urldecode($encodedDebtMoney);

// echo "Tên người dùng: " . $debtMoney . "<br>";

?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <title>Thanh toán</title>
    <!-- Bootstrap core CSS -->
    <link href="/vnpay_php/assets/bootstrap.min.css" rel="stylesheet" />
    <!-- Custom styles for this template -->
    <link href="/vnpay_php/assets/jumbotron-narrow.css" rel="stylesheet">
    <script src="/vnpay_php/assets/jquery-1.11.3.min.js"></script>

    <style>
        #textHeader {

            text-align: center;
            font-weight: 600;
        }

        .text-center {
            display: flex;
            justify-content: center;
            /* Căn giữa theo chiều ngang */
            align-items: center;
            /* Căn giữa theo chiều dọc */
            margin-top: 20px;
            /* Khoảng cách trên */
        }

        #submitButton {
            background-color: #007bff;
            /* Màu nền */
            color: white;
            /* Màu chữ */
            border: none;
            /* Không viền */
            border-radius: 5px;
            /* Bo góc */
            padding: 10px 20px;
            /* Padding trên/dưới và trái/phải */
            font-size: 16px;
            /* Kích thước chữ */
            cursor: pointer;
            /* Thay đổi con trỏ khi hover */
            transition: background-color 0.3s;
            /* Hiệu ứng chuyển màu nền */
        }

        #submitButton:hover {
            background-color: #0056b3;
            /* Màu nền khi hover */
        }

        #submitButton:disabled {
            background-color: #ccc;
            /* Màu nền khi disabled */
            color: #666;
            /* Màu chữ khi disabled */
            cursor: not-allowed;
            /* Hiển thị con trỏ không được phép */
            opacity: 0.6;
            /* Giảm độ mờ để hiển thị trạng thái disabled */
        }
    </style>
</head>

<body>
    <?php require_once "./config.php";?>
    <div class="container">
        <!-- <h3 id="textHeader">Thanh toán học phí</h3> -->
        <div class="table-responsive">
            <form action="/vnpay_php/vnpay_create_payment.php" id="frmCreateOrder" method="post">



                <div class="form-group">

                    <label>Hóa đơn: </label>
                    <p id="cost-name" style="display: inline;"></p>
                    <br />
                    <label>Học viên: </label>
                    <p id="student-name" style="display: inline;"></p>
                    <br />
                    <label>Lớp </label>
                    <p id="class-name" style="display: inline;"></p>

                    <label style="margin-left: 30px">Thời gian: </label>
                    <p id="cost-time" style="display: inline;"></p>
                    <br />
                    <label>Số tiền còn nợ: </label>
                    <p id="cost-debtMoney" style="display: inline;"></p> VND
                    <br />

                    <br />
                    <label for="amount">Nhập số tiền thanh toán:</label>
                    <div style="display: flex; align-items: center;">
                        <input class="form-control" style="width: 70%" data-val="true" data-val-number="The field Amount must be a number." data-val-required="The Amount field is required." id="amount" max="100000000" min="1" name="amount" type="number" value="" placeholder="0" />
                        <strong style="margin-left:10px">VND</strong>
                    </div>
                    <p id="formattedAmount" style="margin-left: 12px; margin-top: 3px;"></p>
                    <i style=" color: orangered ; display:block ; font-size:12px" id="noti-info">Vui lòng nhập số tiền thanh toán (không lớn hơn số tiền còn nợ)</i>
                    <input id="transactionName"  name="transactionName" hidden/>
                </div>
                <h4>Chọn phương thức thanh toán</h4>
                <div class="form-group">
                    <h5>Cách 1: Chuyển hướng sang Cổng VNPAY chọn phương thức thanh toán</h5>
                    <input type="radio" Checked="True" id="bankCode" name="bankCode" value="">
                    <label for="bankCode">Cổng thanh toán VNPAYQR</label><br>

                    <h5>Cách 2: Tách phương thức tại site của đơn vị kết nối</h5>
                    <input type="radio" id="bankCode" name="bankCode" value="VNPAYQR">
                    <label for="bankCode">Thanh toán bằng ứng dụng hỗ trợ VNPAYQR</label><br>

                    <input type="radio" id="bankCode" name="bankCode" value="VNBANK">
                    <label for="bankCode">Thanh toán qua thẻ ATM/Tài khoản nội địa</label><br>

                    <input type="radio" id="bankCode" name="bankCode" value="INTCARD">
                    <label for="bankCode">Thanh toán qua thẻ quốc tế</label><br>

                </div>
                <div class="form-group">
                    <h5>Chọn ngôn ngữ giao diện thanh toán:</h5>
                    <input type="radio" id="language" Checked="True" name="language" value="vn">
                    <label for="language">Tiếng việt</label><br>
                    <input type="radio" id="language" name="language" value="en">
                    <label for="language">Tiếng anh</label><br>

                </div>
                <div class="form-group text-center">
                    <button type="submit" class="btn btn-default" id="submitButton" disabled>Thanh toán</button>
                </div>



            </form>

        </div>
        <p>
            &nbsp;
        </p>
        <footer class="footer">
            <p>&copy; LOHUHI x VNPAY 2024</p>
        </footer>
    </div>
</body>

<script>
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log("data", data);


        const username = data.username;
        const costName = data.costName;
        const debtMoney = data.debtMoney;
        const classCode = data.class;
        const time = data.time;


        document.getElementById('cost-name').innerText = data.costName;
        document.getElementById('transactionName').value = data.costName;
        document.getElementById('student-name').innerText = data.username;
        document.getElementById('class-name').innerText = data.classCode;
        document.getElementById('cost-time').innerText = data.time;
        document.getElementById('cost-debtMoney').innerText = formatMoney(data.debtMoney);

        window.debtMoney = data.debtMoney;
    });

    const amountInput = document.getElementById('amount');
    const formattedAmount = document.getElementById('formattedAmount');
    const submitButton = document.getElementById('submitButton');

    amountInput.addEventListener('blur', function(e) {
        updateFormattedAmount();
        validateSubmit();
    });

    amountInput.addEventListener('input', function(e) {
        updateFormattedAmount();
        validateSubmit();
    });

    const updateFormattedAmount = () => {
        let value = amountInput.value;
        if (!isNaN(value) && value !== '') {
            formattedAmount.textContent = Number(value).toLocaleString() + ' VND';
        } else {
            formattedAmount.textContent = '';
        }
    };

    const validateSubmit = () => {
        const amountValue = parseFloat(amountInput.value);
        const debtValue = parseFloat(window.debtMoney);
        if (!isNaN(amountValue) && amountValue <= debtValue && amountValue > 0) {
            submitButton.disabled = false;
            document.getElementById("noti-info").style.display = 'none';
        } else {
            submitButton.disabled = true;
            document.getElementById("noti-info").style.display = 'block';
        }
    };


    const formatMoney = number => {
        return new Intl.NumberFormat('en-US').format(number);
    };
</script>

</html>