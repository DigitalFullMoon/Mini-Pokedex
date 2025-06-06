// === Sélection des éléments HTML qui seront manipulés dans le script ===
const wrapper = document.querySelector('.pokedex-card-wrapper'); // Conteneur de la carte (masqué au départ)
const card = document.querySelector('.pokedex-card');             // Élément principal de la carte du Pokémon
const title = document.querySelector('.pokedex-title');           // Titre contenant le nom et l'ID du Pokémon
const capture = document.querySelector('.pokedex-capture');       // Affiche le taux de capture
const family = document.querySelector('.pokedex-family');         // Affiche la famille du Pokémon (ex: Pokémon Plante)
const desc = document.querySelector('.pokedex-desc');             // Affiche la description du Pokémon
const img = document.querySelector('.pokedex-img img');           // Image officielle du Pokémon
const input = document.getElementById('poke-id');                 // Champ de saisie pour entrer l'ID du Pokémon

// Masque la carte au chargement de la page
wrapper.style.display = 'none';

// === Fonction pour obtenir une couleur selon le type du Pokémon ===
// On associe chaque type Pokémon à une couleur spécifique (valeurs issues de conventions visuelles)
const getColorByType = type => ({
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD'
}[type] || 'yellow'); // Si le type n’est pas trouvé, couleur par défaut : jaune

// === Fonction d'affichage d'une erreur ===
// Elle remplit la carte avec des valeurs neutres et affiche un message d'erreur
const showError = msg => {
    title.textContent = 'Erreur';         // Affiche "Erreur" comme titre
    capture.textContent = '';             // Vide le champ du taux de capture
    family.textContent = '';              // Vide le champ de famille
    desc.textContent = msg;              // Affiche le message d'erreur passé en paramètre
    img.src = 'img/pikachu.png';         // Affiche une image par défaut (Pikachu)
    card.style.borderColor = 'yellow';   // Bordure jaune pour signaler une erreur
};

// === Animation douce lors du changement de contenu ===
// On fait une transition d'opacité pour que le contenu change en fondu
const fadeOutIn = (el, updateFn, cb) => {
    el.style.transition = 'opacity 0.2s';  // Durée de la transition
    el.style.opacity = '0';               // On commence par rendre l’élément transparent
    setTimeout(() => {
        updateFn();                       // Met à jour le contenu via la fonction passée
        el.style.opacity = '1';           // Ré-affiche l’élément avec opacité
        if (cb) setTimeout(cb, 200);      // Exécute un callback facultatif après l'animation
    }, 200);
};

// === Fonction utilitaire pour récupérer une version française dans un tableau ===
// On utilise cette fonction pour extraire par exemple le nom ou la description en français
const getFR = (arr, key) => (arr.find(e => e.language.name === 'fr') || {})[key] || '';

// === Événement lorsqu'on soumet le formulaire de recherche ===
document.querySelector('.search-bar').addEventListener('submit', e => {
    e.preventDefault(); // Empêche l'envoi classique du formulaire (rechargement de la page)

    const pokeId = parseInt(input.value, 10); // On récupère l’ID entré et on le transforme en nombre entier

    // Vérifie que l'ID est bien un nombre entre 1 et 898 (limites de l’API)
    if (isNaN(pokeId) || pokeId < 1 || pokeId > 898) 
        return showError('Veuillez entrer un ID entre 1 et 898.');

    wrapper.style.display = 'flex'; // Affiche la carte maintenant qu’un ID est valide

    // Animation avant d'afficher les données
    fadeOutIn(card, () => {
        // Première requête vers l'API : on récupère les données "espèce" (nom, description, taux de capture)
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokeId}/`)
            .then(res => res.json())
            .then(species => {
                // Récupération des données en français
                const nameFR = getFR(species.names, 'name') || species.name;
                const descFR = getFR(species.flavor_text_entries, 'flavor_text').replace(/\f|\n/g, ' ');
                const genusFR = getFR(species.genera, 'genus');
                const rate = species.capture_rate;

                // Deuxième requête vers l’API : on récupère les infos techniques (type, image, etc.)
                fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}/`)
                    .then(res => res.json())
                    .then(pokemon => {
                        const type = pokemon.types[0].type.name; // Type principal du Pokémon
                        const imageUrl = pokemon.sprites.other['official-artwork'].front_default 
                                         || pokemon.sprites.front_default; // Image officielle

                        // Mise à jour de l'interface avec les données récupérées
                        title.textContent = `#${pokeId} ${nameFR}`;
                        capture.textContent = `Taux de Capture : ${rate} %`;
                        family.textContent = `Famille : ${genusFR}`;
                        desc.textContent = descFR;
                        img.src = imageUrl;
                        card.style.borderColor = getColorByType(type); // Bordure colorée selon le type
                    })
                    .catch(() => showError('Erreur lors du chargement des données du Pokémon.'));
            })
            .catch(() => showError('Aucun Pokémon trouvé pour cet ID.'));
    });
});

// === Événement en direct sur la saisie de l'ID ===
// Permet d’alerter visuellement si l’ID est invalide en cours de frappe
input.addEventListener('input', function () {
    const val = parseInt(this.value, 10);
    // Si la valeur n’est pas un nombre entre 1 et 898 => bordure rouge
    this.style.borderColor = (isNaN(val) || val < 1 || val > 898) ? 'red' : '';
});
