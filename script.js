/* =========================================================
   AZAHAR PRIVÉ
   Funciones interactivas del MVP
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const propertySearch = document.getElementById("propertySearch");
  const operationInput = document.getElementById("operation");
  const searchTabs = document.querySelectorAll(".search-tab");

  const locationSelect = document.getElementById("location");
  const propertyTypeSelect = document.getElementById("propertyType");
  const maxPriceSelect = document.getElementById("maxPrice");
  const featureSelect = document.getElementById("feature");

  const propertyCards = document.querySelectorAll(".property-card");
  const resultsMessage = document.getElementById("resultsMessage");
  const noResults = document.getElementById("noResults");
  const resetFiltersButton = document.getElementById("resetFilters");
  const showAllButton = document.getElementById("showAll");

  const favoriteButtons = document.querySelectorAll(".favorite");
  const showFavoritesButton = document.getElementById("showFavorites");
  const favoritesCount = document.getElementById("favoritesCount");

  const visitButtons = document.querySelectorAll(".visit-button");
  const selectedPropertyInput = document.getElementById("selectedProperty");

  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const navigationLinks = document.querySelectorAll(".main-nav a");

  let showingFavoritesOnly = false;

  /* =======================================================
     Favoritos guardados en el navegador
     ======================================================= */

  let favorites = [];

  try {
    const savedFavorites = localStorage.getItem("azaharFavorites");

    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
    }
  } catch (error) {
    favorites = [];
  }

  function saveFavorites() {
    localStorage.setItem(
      "azaharFavorites",
      JSON.stringify(favorites)
    );
  }

  function updateFavoritesInterface() {
    favoritesCount.textContent = favorites.length;

    favoriteButtons.forEach(function (button) {
      const propertyId = button.dataset.favorite;
      const isFavorite = favorites.includes(propertyId);

      button.classList.toggle("active", isFavorite);
      button.textContent = isFavorite ? "♥" : "♡";

      button.setAttribute(
        "aria-label",
        isFavorite
          ? "Eliminar propiedad de favoritos"
          : "Guardar propiedad en favoritos"
      );
    });
  }

  favoriteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const propertyId = button.dataset.favorite;

      if (favorites.includes(propertyId)) {
        favorites = favorites.filter(function (id) {
          return id !== propertyId;
        });
      } else {
        favorites.push(propertyId);
      }

      saveFavorites();
      updateFavoritesInterface();

      if (showingFavoritesOnly) {
        displayFavoriteProperties();
      }
    });
  });

  function displayFavoriteProperties() {
    let visibleProperties = 0;

    propertyCards.forEach(function (card) {
      const propertyId = card.dataset.id;
      const isFavorite = favorites.includes(propertyId);

      card.classList.toggle("is-hidden", !isFavorite);

      if (isFavorite) {
        visibleProperties++;
      }
    });

    if (visibleProperties === 0) {
      noResults.hidden = false;
      resultsMessage.textContent =
        "Todavía no has guardado ninguna propiedad.";
    } else {
      noResults.hidden = true;
      resultsMessage.textContent =
        visibleProperties === 1
          ? "Mostrando 1 propiedad guardada."
          : `Mostrando ${visibleProperties} propiedades guardadas.`;
    }

    showFavoritesButton.classList.add("active");
  }

  showFavoritesButton.addEventListener("click", function () {
    showingFavoritesOnly = !showingFavoritesOnly;

    if (showingFavoritesOnly) {
      displayFavoriteProperties();
      showFavoritesButton.setAttribute(
        "aria-label",
        "Mostrar todas las propiedades"
      );
    } else {
      resetAndShowAll();
      showFavoritesButton.setAttribute(
        "aria-label",
        "Mostrar propiedades guardadas"
      );
    }

    document.getElementById("propiedades").scrollIntoView({
      behavior: "smooth"
    });
  });

  /* =======================================================
     Pestañas de venta y alquiler
     ======================================================= */

  searchTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      searchTabs.forEach(function (otherTab) {
        otherTab.classList.remove("active");
      });

      tab.classList.add("active");
      operationInput.value = tab.dataset.operation;
      showingFavoritesOnly = false;
    });
  });

  /* =======================================================
     Filtros del buscador
     ======================================================= */

  function filterProperties() {
    const selectedOperation = operationInput.value;
    const selectedLocation = locationSelect.value;
    const selectedType = propertyTypeSelect.value;
    const selectedMaximumPrice = Number(maxPriceSelect.value);
    const selectedFeature = featureSelect.value;

    let visibleProperties = 0;

    propertyCards.forEach(function (card) {
      const cardOperation = card.dataset.operation;
      const cardLocation = card.dataset.location;
      const cardType = card.dataset.type;
      const cardPrice = Number(card.dataset.price);
      const cardFeatures = card.dataset.features
        .split(" ")
        .filter(Boolean);

      /*
       * El alquiler temporal todavía no tiene una tarjeta propia.
       * Durante el MVP se muestran también las propiedades de alquiler.
       */
      const operationMatches =
        cardOperation === selectedOperation ||
        (
          selectedOperation === "temporal" &&
          cardOperation === "alquiler"
        );

      const locationMatches =
        selectedLocation === "todas" ||
        cardLocation === selectedLocation;

      const typeMatches =
        selectedType === "todos" ||
        cardType === selectedType;

      const priceMatches =
        selectedMaximumPrice === 99999999 ||
        cardPrice <= selectedMaximumPrice;

      const featureMatches =
        selectedFeature === "todas" ||
        cardFeatures.includes(selectedFeature);

      const shouldDisplay =
        operationMatches &&
        locationMatches &&
        typeMatches &&
        priceMatches &&
        featureMatches;

      card.classList.toggle("is-hidden", !shouldDisplay);

      if (shouldDisplay) {
        visibleProperties++;
      }
    });

    showingFavoritesOnly = false;
    showFavoritesButton.classList.remove("active");

    if (visibleProperties === 0) {
      noResults.hidden = false;
      resultsMessage.textContent =
        "No hay propiedades que coincidan con la búsqueda.";
    } else {
      noResults.hidden = true;

      resultsMessage.textContent =
        visibleProperties === 1
          ? "Hemos encontrado 1 propiedad."
          : `Hemos encontrado ${visibleProperties} propiedades.`;
    }

    document.getElementById("propiedades").scrollIntoView({
      behavior: "smooth"
    });
  }

  propertySearch.addEventListener("submit", function (event) {
    event.preventDefault();
    filterProperties();
  });

  /* =======================================================
     Mostrar todas las propiedades
     ======================================================= */

  function resetAndShowAll() {
    searchTabs.forEach(function (tab) {
      tab.classList.remove("active");
    });

    const ventaTab = document.querySelector(
      '.search-tab[data-operation="venta"]'
    );

    if (ventaTab) {
      ventaTab.classList.add("active");
    }

    operationInput.value = "venta";
    locationSelect.value = "todas";
    propertyTypeSelect.value = "todos";
    maxPriceSelect.value = "99999999";
    featureSelect.value = "todas";

    showingFavoritesOnly = false;
    showFavoritesButton.classList.remove("active");

    propertyCards.forEach(function (card) {
      card.classList.remove("is-hidden");
    });

    noResults.hidden = true;
    resultsMessage.textContent =
      "Mostrando todas las propiedades.";
  }

  if (resetFiltersButton) {
    resetFiltersButton.addEventListener("click", resetAndShowAll);
  }

  if (showAllButton) {
    showAllButton.addEventListener("click", resetAndShowAll);
  }

  /* =======================================================
     Enlaces Comprar y Alquilar
     ======================================================= */

  navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      const selectedOperation = link.dataset.operation;

      if (selectedOperation) {
        operationInput.value = selectedOperation;

        searchTabs.forEach(function (tab) {
          tab.classList.toggle(
            "active",
            tab.dataset.operation === selectedOperation
          );
        });

        propertyCards.forEach(function (card) {
          const shouldDisplay =
            card.dataset.operation === selectedOperation;

          card.classList.toggle("is-hidden", !shouldDisplay);
        });

        const visibleProperties = document.querySelectorAll(
          ".property-card:not(.is-hidden)"
        ).length;

        resultsMessage.textContent =
          visibleProperties === 1
            ? "Mostrando 1 propiedad."
            : `Mostrando ${visibleProperties} propiedades.`;

        noResults.hidden = visibleProperties !== 0;
      }

      closeMobileMenu();
    });
  });

  /* =======================================================
     Solicitud de visita privada
     ======================================================= */

  visitButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const propertyName = button.dataset.property;

      if (selectedPropertyInput) {
        selectedPropertyInput.value = propertyName;
      }

      const inquirySelect = contactForm.querySelector(
        'select[name="inquiry"]'
      );

      if (inquirySelect) {
        inquirySelect.value = "visita";
      }

      document.getElementById("propietarios").scrollIntoView({
        behavior: "smooth"
      });

      formMessage.classList.remove("error");
      formMessage.textContent =
        `Solicitud seleccionada: ${propertyName}. ` +
        "Complete sus datos para concertar una visita.";
    });
  });

  /* =======================================================
     Formulario de contacto
     ======================================================= */

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    formMessage.classList.remove("error");

    if (!contactForm.checkValidity()) {
      formMessage.classList.add("error");
      formMessage.textContent =
        "Por favor, complete los campos obligatorios.";

      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const clientName = formData.get("name");
    const selectedProperty = formData.get("selectedProperty");

    /*
     * MVP: no se envían datos a un servidor.
     * Se muestra una confirmación visual.
     */
    if (selectedProperty) {
      formMessage.textContent =
        `Gracias, ${clientName}. Hemos registrado su solicitud ` +
        `para visitar “${selectedProperty}”.`;
    } else {
      formMessage.textContent =
        `Gracias, ${clientName}. Hemos registrado su solicitud ` +
        "de valoración confidencial.";
    }

    contactForm.reset();

    if (selectedPropertyInput) {
      selectedPropertyInput.value = "";
    }

    setTimeout(function () {
      formMessage.textContent = "";
    }, 9000);
  });

  /* =======================================================
     Menú para móviles
     ======================================================= */

  function closeMobileMenu() {
    mainNav.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }

  menuToggle.addEventListener("click", function () {
    const menuIsOpen = mainNav.classList.toggle("open");

    document.body.classList.toggle("menu-open", menuIsOpen);
    menuToggle.setAttribute("aria-expanded", String(menuIsOpen));
    menuToggle.textContent = menuIsOpen ? "✕" : "☰";
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) {
      closeMobileMenu();
    }
  });

  /* =======================================================
     Inicio de la aplicación
     ======================================================= */

  updateFavoritesInterface();
});
