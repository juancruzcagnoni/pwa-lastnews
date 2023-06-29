// Obtener referencias a elementos del DOM
const div = document.getElementById("response"); 
const main = document.getElementById("lastNew"); 
const section = document.getElementById("section"); 
const modal = document.getElementById("modal"); 
const favoritesMenu = document.getElementById("favorites"); 
const modalFavorites = document.getElementById("modalFavorites"); 

let favorites = []; // Array para almacenar las noticias favoritas

// Función para mostrar una notificación de confirmación
function showNotificationConfirmation() {
  const confirmation = confirm("¿Deseas recibir notificaciones?");
  if (confirmation) {
    // El usuario aceptó recibir notificaciones, solicitar permiso.
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        // Permiso concedido, enviar la notificación.
        sendNotification();
      }
    });
  }
}

// Función para enviar una notificación
function sendNotification() {
  const notificationTitle = "¡Bienvenido a LastNews!";
  const notificationOptions = {
    body: "Gracias por visitarnos.",
    icon: "img/icon-192x192.png",
  };
  showNotification(notificationTitle, notificationOptions);
}

// Función para mostrar una notificación
function showNotification(title, options) {
  // Verificar si el navegador admite las notificaciones.
  if ("Notification" in window) {
    // Verificar el estado del permiso de notificación.
    if (Notification.permission === "granted") {
      // Mostrar la notificación.
      new Notification(title, options);
    }
  }
}

// Función para manejar el evento de conexión en línea
function handleOnline() {
  const status = document.getElementById("status");
  // Realizar los cambios estéticos para el estado en línea
  status.classList.remove("offline");
  status.classList.add("online");
  console.log("Estás en línea");
}

// Función para manejar el evento de conexión sin conexión
function handleOffline() {
  const status = document.getElementById("status");
  // Realizar los cambios estéticos para el estado sin conexión
  status.classList.remove("online");
  status.classList.add("offline");
  console.log("Estás sin conexión");
}

// Evento que se dispara cuando el DOM se ha cargado
window.addEventListener("DOMContentLoaded", function () {
  // Registrar el service worker
  if ("serviceWorker" in navigator) {
    this.navigator.serviceWorker
      .register("sw.js")
      .then((res) => console.log("El SW se registró correctamente."))
      .catch((err) => console.log("El SW no se pudo registrar"));
  }

  // Verificar si el navegador admite las notificaciones.
  if ("Notification" in window) {
    // Verificar el estado del permiso de notificación.
    if (Notification.permission === "granted") {
      // Si el permiso ya está concedido, puedes enviar la notificación directamente.
      sendNotification();
    } else if (Notification.permission !== "denied") {
      // Si el permiso no se ha solicitado previamente, mostrar una confirmación.
      showNotificationConfirmation();
    }
  }

  // Verificar el estado de conexión al cargar la página
  if (navigator.onLine) {
    // Estás en línea
    handleOnline();
  } else {
    // Estás sin conexión
    handleOffline();
  }

  // Agregar event listeners para los eventos online y offline
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // URL de la API de noticias
  const url =
    "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=65dbea689e6a43a5866bd6f451512edd";

  // Realizar la solicitud Fetch para recuperar el archivo JSON.
  fetch(url)
    // Convertir la respuesta JSON en un objeto JavaScript.
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      // Obtener la cadena JSON de las noticias
      const newsData = JSON.stringify(data.articles);

      // Guardar la cadena JSON en el LocalStorage
      localStorage.setItem("newsData", newsData);

      const storedNewsData = localStorage.getItem("newsData");

      if (storedNewsData) {
        // Convertir la cadena JSON de vuelta a un array de objetos JavaScript
        const storedData = JSON.parse(storedNewsData);

        // Listado de noticias.
        for (const article of storedData) {
          // Crear la tarjeta de la noticia.
          let cardContainer = document.createElement("div");
          cardContainer.className = "new";

          cardContainer.innerHTML = `
            <h3 href="">${article.title}</h3>
            <p>${article.description}</p>
          `;

          let cardContainerBottom = document.createElement("div");
          cardContainerBottom.className = "card-container-bottom";

          let published = this.document.createElement("p");
          published.innerHTML = `${article.publishedAt}`;

          // Crear el botón para ver el detalle de la noticia en una ventana modal.
          let linkNew = document.createElement("a");
          linkNew.className = "link";
          linkNew.innerHTML = "See more";
          linkNew.addEventListener("click", () => {
            modal.style.display = "flex";

            // Detalle de la noticia.
            let containerNew = document.createElement("div");
            containerNew.classList.add("container-new", "row", "pt-4");
            containerNew.innerHTML = `
              <div class="p-3 col-12 col-md-6 mt-5">
                <h3 class="title" href="">${article.title}</h3>
                <p class="description">${article.description}</p>
                <p class="contentNew">${article.content}</p>
                <p class="author">Author: ${article.author}</p>
                <p class="dateNew mt-5">${article.publishedAt}</p>
              </div>
            `;

            let imgContainer = this.document.createElement("div");
            imgContainer.classList.add(
              "p-3",
              "col-12",
              "col-md-6",
              "mt-5",
              "d-flex",
              "flex-column",
              "align-items-center"
            );

            let img = this.document.createElement("img");
            img.src = `${article.urlToImage}`;
            img.classList.add("imgNew", "img-fluid");

            // Div para los botones
            let containerButtons = document.createElement("div");
            containerButtons.className = "container-buttons";

            // Crear el botón para agregar a favoritos.
            let favoritesButton = document.createElement("a");
            favoritesButton.className = "favorites-button";
            favoritesButton.innerHTML =
              '<i class="bi bi-star"></i> Add to favorites';
            favoritesButton.addEventListener("click", () => {
              favorites.push(article);
              console.log(favorites);
            });

            // Crear el botón para compartir
            const shareButton = document.createElement("a");
            shareButton.className = "share-button";
            shareButton.innerHTML = "Share";

            shareButton.addEventListener("click", () => {
              if (navigator.share) {
                navigator
                  .share({
                    title: "Título de tu contenido",
                    text: "Texto de tu contenido",
                    url: "URL de tu contenido",
                  })
                  .then(() => {
                    console.log("Contenido compartido con éxito.");
                  })
                  .catch((error) => {
                    console.error("Error al compartir:", error);
                  });
              } else {
                console.log(
                  "La función de compartir no está soportada en este dispositivo o navegador."
                );
              }
            });

            // Botón para cerrar la ventana modal de la noticia.
            let close = document.createElement("div");
            close.className = "close";

            let closeBtn = document.createElement("a");
            closeBtn.href = "javascript:void(0)";
            closeBtn.innerHTML = "Go Back";
            closeBtn.addEventListener("click", () => {
              containerNew.remove();
              modal.style.display = "none";
              return false;
            });

            close.append(closeBtn);
            containerButtons.append(favoritesButton, shareButton);
            imgContainer.append(img, containerButtons);
            containerNew.append(close, imgContainer);
            modal.append(containerNew);
          });

          cardContainerBottom.append(published, linkNew);
          cardContainer.append(cardContainerBottom);
          div.append(cardContainer);
        }
      }

      // Crear la ventana modal de los favoritos.
      favoritesMenu.addEventListener("click", () => {
        modalFavorites.style.display = "flex";

        let containerFavorites = document.createElement("div");
        containerFavorites.className = "container-favorites";
        containerFavorites.innerHTML = "<h4>My favorite news</h4>";

        favorites.forEach((favoriteNew) => {
          let favoriteNewContainer = document.createElement("div");
          favoriteNewContainer.classList.add(
            "d-flex",
            "align-items-center",
            "mb-3"
          );
          favoriteNewContainer.innerHTML = `
            <i class="bi bi-star-fill me-2"></i>
            <p class="favorite-new mb-0 me-5">${favoriteNew.title}</p>
          `;

          // Botón para eliminar una noticia de favoritos.
          let deleteNew = document.createElement("a");
          deleteNew.innerHTML = '<i class="bi bi-trash me-3"></i>';
          deleteNew.style.cursor = "pointer";
          deleteNew.addEventListener("click", () => {
            favoriteNewContainer.remove();
            favorites.pop();
          });

          favoriteNewContainer.append(deleteNew);
          containerFavorites.append(favoriteNewContainer);
        });

        // Botón para cerrar la ventana modal de los favoritos.
        let close = this.document.createElement("div");
        close.className = "close";

        let closeBtn = document.createElement("a");
        closeBtn.href = "javascript:void(0)";
        closeBtn.innerHTML = "Close";
        closeBtn.addEventListener("click", () => {
          containerFavorites.remove();
          modalFavorites.style.display = "none";
          return false;
        });

        close.append(closeBtn);
        containerFavorites.append(close);
        modalFavorites.append(containerFavorites);
      });

      // Verificar si el navegador es compatible con la instalación de PWA
      if ("serviceWorker" in navigator && "InstallTrigger" in window) {
        // Mostrar el botón de instalación
        const installButton = document.getElementById("installButton");
        installButton.style.display = "block";

        // Agregar el evento click al botón de instalación
        installButton.addEventListener("click", () => {
          // Registrar el service worker y solicitar la instalación de la PWA
          navigator.serviceWorker.ready.then((registration) => {
            registration.prompt();
            registration.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === "accepted") {
                console.log("La PWA ha sido instalada.");
              } else {
                console.log("La instalación de la PWA ha sido cancelada.");
              }
            });
          });
        });
      }
    })
    .catch((error) => console.log(error));
});

// Instalacion 
let instalacion = null;
const btnInstall = document.getElementById('botonInstall');

btnInstall.addEventListener('click', instalarPWA);

window.addEventListener('beforeinstallprompt', guardarEvento);

function guardarEvento(evento){
    instalacion = evento;
    btnInstall.removeAttribute('hidden');
}

function instalarPWA(evento){
    instalacion.prompt();
    evento.srcElement.setAttribute('hidden', true);
    instalacion.userChoice
                    .then((choice) => {
                        if(choice.outcome === 'accepted'){
                            console.log('Acepto la instalacion');
                        } else {
                            console.log('No acepto la instalacion');
                        }
                        instalacion = null;
                    })
}