const update_task = async (_id, description, completed, reload=true) => {
  console.log('completed: ', completed)
  return fetch("/tasks/" + encodeURI(_id), {
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    method: "PATCH",
    body: JSON.stringify({
      description: description, 
      completed: completed 
    })
  })
    .then( async response => {
      if (response.status !== 200) throw new Error;
      // return response.status
      // atualiza a pagina
      if (reload)
        window.location.reload(false);
      return response.json()
        .then( data => data )
        .catch( error => error )
    })
    .catch( () => { message: "Verifique sua conexão com a internet ou tente mais tarde!" });
}

const delete_task = async (_id, reload=true) => {
  return fetch("/tasks/" + encodeURI(_id), {
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    method: "DELETE"
  })
    .then( async response => {
      if (response.status !== 200) throw new Error;
      // return response.status
      // atualiza a pagina
      if (reload)
        window.location.reload(false);
      return response.json()
        .then( data => data )
        .catch( error => error )
    })
    .catch( () => { message: "Verifique sua conexão com a internet ou tente mais tarde!" });
}

const add_new_task = async (description, completed, reload=true) => {
  return fetch("/tasks", {
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      description: description, 
      completed: completed 
    })
  })
    .then( async response => {
      if (response.status !== 201) throw new Error;
      // return response.status
      // atualiza a pagina
      if (reload)
        window.location.reload(false);
      return response.json()
        .then( data => data )
        .catch( error => error )
    })
    .catch( () => { message: "Verifique sua conexão com a internet ou tente mais tarde!" });
}

const show_error = (error, error_message) => {
  error.innerHTML;
  error.value = error_message;
  error.classList.remove("invisible");
  return;
}

const tasks = document.querySelectorAll(".task");
const add_task = document.querySelector(".add_task");

add_task.querySelector("button").addEventListener("click" , async () => {
  const description = add_task.querySelector("textarea");
  const error = add_task.querySelector("span");

  description.innerHTML;
  if (description.value === "") {
    show_error(error, "Descrição nao pode estar vazia!");
    description.focus();
    return;
  } else {
    await add_new_task(description.value, false)
      .catch( msg => show_error(error, msg));
  }
})

if (tasks) {
  tasks.forEach(task => {
    if (task.id === "add_task") return;

    const complete = task.querySelector("#complete_task");
    const uncomplete = task.querySelector("#uncomplete_task");
    const edit = task.querySelector("#edit_task");
    const del = task.querySelector("#delete_task");
    const description = task.querySelector("#description");
    const save_or_cancel = task.querySelector("#save_or_cancel");
    const cancel = task.querySelector("#cancel");
    const save = task.querySelector("#save");
    const options = task.querySelector("#options");
    const error = task.querySelector("#error");

    const isComplete = complete ? false : true;

    const resetFocus = () => {
      // src https://stackoverflow.com/a/40122962/11999600
      let scrollTop = document.body.scrollTop;
      let body = document.body;
  
      let tmp = document.createElement('input');
      tmp.style.opacity = 0;
      body.appendChild(tmp);
      tmp.focus();
      body.removeChild(tmp);
      body.scrollTop = scrollTop;
    }

    const toggle = () => {
      error.classList.add("invisible");

      if (task.classList.contains("active")){
        description.disabled = false;
        description.select();
        description.focus();
      } else {
        description.disabled = true;
        resetFocus();
      }
    }
    
    if (complete) {
      complete.addEventListener("click", async (e) => {
        await update_task(task.id, description.textContent, true)
          .then( result => {
            console.log(result)
          })
      })
    } 
    if(uncomplete){
      uncomplete.addEventListener("click", async (e) => {
        await update_task(task.id, description.textContent, false)
          .then( result => {
            console.log(result)
          })
      })
    }

    edit.addEventListener("click", () => {
      save_or_cancel.classList.toggle("invisible");
      options.classList.toggle("invisible");
      task.classList.toggle("active");

      toggle();
    });

    cancel.addEventListener("click", () => {
      save_or_cancel.classList.toggle("invisible");
      options.classList.toggle("invisible");
      task.classList.toggle("active");
      description.value = description.textContent;
      toggle();
    });

    save.addEventListener("click", async () => {
      // atualiza o .value ???
      description.innerHTML;
      if (!description.value) {
        show_error(error, "Descrição nao pode estar vazia!")
        return;
      } else {
        save_or_cancel.classList.toggle("invisible");
        options.classList.toggle("invisible");
        task.classList.toggle("active");
  
        if (save_or_cancel.classList.contains("invisible")) {
          await update_task(task.id, description.value, isComplete, false)
            .catch( error_msg => {
              show_error(error, error_msg)
            })
        }
  
        toggle();
      }
    });

    del.addEventListener("click", async () => {
      await delete_task(task.id, false)
        .then(result => {
          task.remove();
        })
    })

    description.addEventListener("input", () => {
      // remove o erro quando o usuario digita algo
      error.classList.add("invisible");
    })
  });
}
// verifica se tem alguma task, se nao tiver, colca a img e texto de vazio
const verify_if_empty = () => {
/*   if (document.querySelector("#uncomplete").childNodes.length <= 6) {
    // ta vazio
    document.querySelector("#uncomplete_empty")
      .classList.remove("invisible");
  } else {
    document.querySelector("#uncomplete_empty")
      .classList.add("invisible");
  } */

  if (document.querySelector("#complete").childNodes.length <= 4) {
    // ta vazio
    document.querySelector("#complete_empty")
      .classList.remove("invisible");
  } else {
    document.querySelector("#complete_empty")
      .classList.add("invisible");
  }
}

const tasks_change = new MutationObserver(function (e) {
  verify_if_empty();
});

const listas = document.querySelectorAll(".home__task_list");

listas.forEach( lista => {
  tasks_change.observe(lista, { childList: true, subtree: true });
})

verify_if_empty();