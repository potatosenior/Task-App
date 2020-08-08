// botão de sair
document.querySelector("#exit1").addEventListener("click", async (e) => {
  e.preventDefault();
  await fetch("users/logout", {method: "POST"})
    .then((res) => {
      window.location.href = "/";
    })
    .catch(error => console.log(error));
})
// botão de sair de todas sessoes
document.querySelector("#exit2").addEventListener("click", async (e) => {
  e.preventDefault();
  await fetch("users/logoutALL", {method: "POST"})
    .then((res) => {
      window.location.href = "/";
    })
    .catch(error => console.log(error));
})