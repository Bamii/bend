export const request = () => {}

export const response = {
  set_cookie: (h, { name, value }) => h.state(name, value),
  response: (h, { body }) => h.response(body),
}

