export async function apiRequest(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  let response;

  try {
    response = await fetch(path, {
      ...requestOptions,
      credentials: 'same-origin',
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch {
    throw new Error('Cannot connect to the CareerAI backend. Start it with npm run server, then try again.');
  }

  const responseText = await response.text();
  let result = null;
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error('The CareerAI backend returned an unreadable response. Check that it is running correctly.');
    }
  }

  if (!response.ok) {
    const error = new Error(result?.error || `The request failed (${response.status}). Please try again.`);
    error.status = response.status;
    throw error;
  }

  return result;
}
