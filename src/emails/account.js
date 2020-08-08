const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = async (email, name) => {
  await sgMail.send({
    to: email,
    from: "potatosenior9@hotmail.com",
    subject: "Obrigado por se juntar!",
    text: "Bem vindo ao aplicativo, " + name + "!"
  })
}

const sendCancelationEmail = async (email, name) => {
  await sgMail.send({
    to: email,
    from: "potatosenior6@hotmail.com",
    subject: "Vamos sentir sua falta :c",
    text: "Lamentamos a sua saída, por favor, nos informe o motivo."
  });
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}