const name = document.getElementById("name");
const email = document.querySelector("#email");
const password = document.querySelector("#pass1");
const password2 = document.querySelector("#pass2");
//seleciona o botao de registro
document.querySelector("#register").addEventListener("submit", async e => {
  e.preventDefault();
  let dados = {
    name: name.value,
    email: email.value,
    password: password.value
  }

  if (password.value !== password2.value) return alert("As senhas devem ser iguais!");
  await fetch("users", {
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    method: "POST", 
    body: JSON.stringify(dados)
  })
    .then((response) => {
      if (response.status !== 201) alert("Email já em uso!")
      else window.location.href = "/home"
    })
    .catch(error => console.log(error));
})