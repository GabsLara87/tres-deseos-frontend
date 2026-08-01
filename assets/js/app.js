import { router } from "../../router/router.js";
import { store } from "../../store/store.js";

async function bootstrap() {
  try {
    store.setState({ appReady: true });
    router.start();
  } catch (error) {
    console.error("No se pudo iniciar la aplicación:", error);

    document.querySelector("#app").innerHTML = `
      <main class="container app-main">
        <div class="status-card">
          <strong>No se pudo iniciar la tienda.</strong>
          <p>Actualizá la página o intentá nuevamente más tarde.</p>
        </div>
      </main>
    `;
  }
}

bootstrap();
