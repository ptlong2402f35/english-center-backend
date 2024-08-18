const ResetPasswordUrl = process.env.RESET_PASSWORD_URL || "";

const standardPaymentOrderEmailTemplate = (data, {forAdmin, forPartner, forCustomer}) => `
<html lang="en">

<body>
${forCustomer ? 
    `
    <div class="">Congratulations ${data?.name || ""},</div>
<br/>
<div class="">You have made reservation successfully. Please double check your booking information as below.</div>
<br/>
<div class="">To use service, please show up this email to the storage reception.</div>
<br/>
<div class="">---</div>
<br/>
<div class="">You can also maximize your travel convenience with WHALELO's other services, including:</div>
<div class="">1. For luggages: Hassle-free luggage delivery (price from $5/bag/trip)</div>
<div class="">2. For passengers: Seamless Airport transportation (price from $15/trip)</div>
<br/>
<div class="">To book, please chat with us via hotline: (+84) 983 603 108 (WhatsApp, Zalo, KakaoTalk, LINE).</div>
<div class="">---</div>
<br/>
    ` 
    : 
    ``
}
<div class="">BOOKING INFORMATION</div>
<br/>
<div class="">Booking number: ${data?.orderId || ""}</div>
<br/>
<div class="">Transaction ID: ${data?.transactionId || ""}</div>
<br/>
<div class="">Name: ${data?.name || ""}</div>
<br/>
<div class="">Email: ${data?.email || ""}</div>
<br/>
<div class="">Number of luggages: ${data?.quantity || ""}</div>
<br/>
<div class="">Amount: $${data?.total || ""}</div>
<br/>
<div class="">Drop-off date: ${new Date(data?.timeIn).toLocaleString("en-GB", {timeZone: "Asia/Ho_Chi_Minh"}) || ""}</div>
<br/>
<div class="">Pick-up date: ${new Date(data?.timeOut).toLocaleString("en-GB", {timeZone: "Asia/Ho_Chi_Minh"}) || ""}</div>
<br/>
<div class="">Storage: ${data?.partnerName || ""}</div>
<br/>
<div class="">Address: ${data?.partnerAddress || ""}</div>
<br/>
<div class="">---</div>
<br/>
${forCustomer ? 
    `
    <div class="">INSTRUCTIONS:</div>
<br/>
<div class="">1/ To cancel booking, please log in your account, go to "Order Management" and select "Cancel". You can only cancel before 00:00 a.m of the schedule drop off date.</div>
<br/>
<div class="">2/ To increase number of luggage/storage duration, please book a new booking ONLY for the extra luggage/storage duration</div>
<br/>
<div class="">3/ To reduce number of luggage/storage duration, please cancel your current booking and book a new one</div>
<br/>
    `
    :
    ``
}

<div class="">Thank you very much for choosing our service and please feel free to contact us if you need any further help.</div>
<br/>
<div class="">Best Regards,</div>
<div class="">---</div>
<div class="">WhaleLO - Luggage Storage and Delivery</div>
<br/>
<div class="">Hotline: +84 983 603 108 (WhatsApp, Zalo, KakaoTalk, LINE, available)</div>
<br/>
<div class="">Email: info@whalelo.net</div>
<br/>
<div class="">Website: <a href="whalelo.net">whalelo.net</a></div>
</body>

</html>
`

const forgetPasswordEmailTemplate = (data, resetKey) => `
    <div class="">Hello ${data.fullName},</div>
    <br/>
    <div class="">We got a request reset password from you in Whalelo system. To reset password, please follow link below: </div>
    <br/>
    <div class=""><a href="${ResetPasswordUrl}/forgot-password-reset?resetKey=${resetKey}" target="_blank" style="border: solid 1px #579d2d; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #579d2d; border-color: #579d2d; color: #ffffff;">Làm mới mật khẩu</a></div>
    <br/>
    <div class="">Thank you for using our service in Whalelo. If you have any question, contact us by phone number: +84 983 603 108 or email: info@whalelo.net </div>
    <br/>
    <div class="">WhaleLO team.</div>
`;

const takeCareEmailTemplate = (data) => `
    <html lang="en">

<body>
<div class="">Hello,</div>
<br/>
<div class="">We saw that you were about to reserve a slot to store your luggage at one of our spots today but did not complete the booking. </div>
<br/>
<div class="">Do you need any support from us? Or do you still have any other concerns? Please let us know.</div>
<br/>
<div class="">Thank you so much for your sharing,</div>
<br/>
<div class="">WhaleLO team.</div>

</body>

</html>
`;

module.exports = {
    standardPaymentOrderEmailTemplate,
    forgetPasswordEmailTemplate,
    takeCareEmailTemplate
}