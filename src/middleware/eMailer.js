const nodemailer = require("nodemailer");

function nodeEmailVerify(name, receiver, id, password) {
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e2328a60f4f385",
      pass: "ed89173f32a2e5",
    },
  });

  var mailOptions = {
    from: "98c746d3b2-3b6189@inbox.mailtrap.io",
    to: receiver,
    subject: name + " Olakh credentials",
    html: `<!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      </head>
      <body style="font-family: sans-serif">
        <div style="display: block; margin: auto; max-width: 600px" class="main">
          <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">
            Please sign in using credentials below
          </h1>
    
          <p>
            Hello there, 
            <br/>
            <br/> 
            You registered an account on Olakh. After verifying your details
            <br />
            we are providing you credentials to signin and use the Olakh platform  
            <br />
            to find the best match for you
            <br />
            <br />
            Kind Regards, <br />
            Olakh Matrimonial
          </p>
    
          <div> <span><strong>Olakh Id: </strong></span> <span>${id}</span> </div>
          <div> <span><strong>Password: </strong></span> <span>${password}</span> </div>
        </div>
        <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
        <style>
          .main {
            background-color: white;
          }
          
          .ui.primary.button {
            box-shadow: 0 0 0 0 rgb(34 36 38 / 15%) inset;
          }
          .primary.button {
            background-color: #2185d0;
            color: #fff;
            text-shadow: none;
            background-image: none;
          }
          .button {
            font-size: 1rem;
            transition: box-shadow .2s ease, background-color .2s ease;
          }
          .button:hover {
            box-shadow: 1px 1px 12px 1px #379ae1e8 , 0 0 0 0 rgb(68 72 76 / 15%) inset;
            background-color: #1174bf;
    
          }
          .button {
            cursor: pointer;
            display: inline-block;
            min-height: 1em;
            outline: 0;
            border: none;
            vertical-align: baseline;
            background: #e0e1e2 none;
            color: rgba(0, 0, 0, 0.6);
            font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif;
            margin: 0 0.25em 0 0;
            padding: 0.78571429em 1.5em 0.78571429em;
            text-transform: none;
            text-shadow: none;
            font-weight: 700;
            line-height: 1em;
            font-style: normal;
            text-align: center;
            text-decoration: none;
            border-radius: 0.28571429rem;
           
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            will-change: "";
            -webkit-tap-highlight-color: transparent;
          }
        </style>
      </body>
    </html>
    `,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

module.exports = nodeEmailVerify;
