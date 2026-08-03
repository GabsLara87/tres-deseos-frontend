/**
 * Cliente público de la API.
 *
 * Apps Script ContentService redirige las respuestas a googleusercontent.
 * El navegador bloquea fetch() por CORS, por lo que usamos JSONP.
 *
 * La API es pública, de solo lectura y únicamente utiliza GET.
 */

let jsonpSequence = 0;


/**
 * Mantiene el nombre apiGet para no modificar Stores ni Views.
 */
export function apiGet(url, options = {}) {
  return jsonpRequest(url, {
    timeout: options.timeout ?? 20000,
  });
}


function jsonpRequest(url, { timeout = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    jsonpSequence += 1;

    const callbackName =
      `__td_jsonp_${Date.now()}_${jsonpSequence}`;

    const requestUrl = new URL(url);
    requestUrl.searchParams.set('callback', callbackName);

    const script = document.createElement('script');
    let finished = false;

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      try {
        delete window[callbackName];
      } catch {
        window[callbackName] = undefined;
      }

      window.clearTimeout(timeoutId);
    };

    const fail = (message) => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      reject(new Error(message));
    };

    window[callbackName] = (payload) => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();

      if (!payload || typeof payload !== 'object') {
        reject(new Error('La API devolvió una respuesta inválida.'));
        return;
      }

      if (!payload.ok) {
        reject(
          new Error(
            payload.mensaje ||
            'La API devolvió un error.'
          )
        );
        return;
      }

      resolve(payload);
    };

    script.src = requestUrl.toString();
    script.async = true;

    script.onerror = () => {
      fail('No fue posible conectar con la API.');
    };

    const timeoutId = window.setTimeout(() => {
      fail('La consulta tardó demasiado tiempo.');
    }, timeout);

    document.head.appendChild(script);
  });
}
