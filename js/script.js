// Sélection des éléments
const input = document.getElementById("pokemonId");
const bouton = document.getElementById("chercher");
const resultat = document.getElementById("resultat");

bouton.addEventListener("click", () => {
    const id = parseInt(input.value.trim());

    // Vérifie que l'ID est entre 1 et 898
    if (isNaN(id) || id < 1 || id > 898) {
        resultat.innerHTML = "<p>ID invalide. Choisir entre 1 et 898.</p>";
        return;
    }

    // Récupère les infos de base
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        .then(res => res.json())
        .then(species => {
            // Nom en français
            const nomFR = species.names.find(n => n.language.name === "fr")?.name || "Nom inconnu";

            // Description en français
            const descriptionFR = species.flavor_text_entries.find(e => e.language.name === "fr")?.flavor_text.replace(/\f/g, " ") || "Pas de description.";

            // Groupe d'œufs
            const eggGroupsFR = species.egg_groups.map(g => g.name).join(", ") || "Non défini";

            // Taux de capture
            const capture = species.capture_rate;

            // Récupère l'image (dans une autre requête)
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                .then(res => res.json())
                .then(data => {
                    const image = data.sprites.front_default;
                    resultat.innerHTML = `
                        <h2>${nomFR}</h2>
                        <img src="${image}" alt="${nomFR}">
                        <p><strong>Description :</strong> ${descriptionFR}</p>
                        <p><strong>Groupe d'œufs :</strong> ${eggGroupsFR}</p>
                        <p><strong>Taux de capture :</strong> ${capture}</p>
                    `;
                })
                .catch(() => {
                    resultat.innerHTML = "<p>Erreur lors de la récupération de l'image.</p>";
                });
        })
        .catch(() => {
            resultat.innerHTML = "<p>Erreur lors de la récupération des données.</p>";
        });
});
