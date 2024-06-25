window.onload = function () {
  function add_schema(e) {
    e.preventDefault()

    attach(
      "schema-field", 
      document.querySelector(`[data-endpoint-input-target='${e.target.dataset.endpointInputActor}'] .schema-field-list`), 
      false
    )
  }
  document.getElementById("add_schema")?.addEventListener("click", add_schema)

  function add_input(e) {
    e.preventDefault()

    const input = document.getElementById("endpoint-input")
    const date = Date.now()
    input.dataset.endpointInputTarget = date;

    const actor = input.querySelector("#add_schema");
    actor.dataset.endpointInputActor = date;

    attach(input, "endpoint-input-list", true, (input, _) => {
      const actor = input.querySelector("#add_schema");
      actor.onclick = add_schema;
    })
  }
  document.getElementById("add_input")?.addEventListener("click", add_input)
}

function attach(id, target, append, cb = null) {
  if (!id) throw new Error("invalid argumnents")
  console.log(target, id)
  if (typeof id !== "string" && !(id instanceof Node)) throw new Error("invalid arguments")
  if (typeof target !== "string" && !(target instanceof Node)) throw new Error("invalid arguments")

  const _input = typeof id == "string" ? document.getElementById(id) : id;
  const input = _input.cloneNode(true)
  input.classList.remove("hidden")
  input.removeAttribute("id")

  const _target = typeof target == "string" ? document.getElementById(target) : target;
  if (append) {
    _target.appendChild(input)
  } else {
    _target.prepend(input)
  }

  cb?.(input, _target)
}
