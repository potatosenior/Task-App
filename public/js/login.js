const form = document.querySelector("form");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const api = "users/login";

const login = async (email, password) => {
  return fetch(api, {
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({email: email, password: password })
  })
    .then( async response => {
      if (response.status !== 200) throw new Error;
      return response.json()
        .then( data => data )
        .catch( error => error )
    })
    .catch( () => { message: "Verifique sua conexão com a internet ou tente mais tarde!" });
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  
  await login(email.value, password.value)
  .then( data => {

    if (!data) 
      alert('Login ou senha invalido!');
    else {
      window.location.href = "/home"
    }
  })
  .catch( error => console.log('error: ', error))
})