document.addEventListener("DOMContentLoaded", function() {
    fetch("data/alertes.json")
        .then(response => response.json())
        .then(data => {
            let alertesContainer = document.getElementById("alertes-container");
            let historiqueContainer = document.getElementById("historique-container");

            // Tableau pour suivre les alertes uniques
            let alertesUniques = [];

            data.alertes.sort((a, b) => new Date(b.periode.debut) - new Date(a.periode.debut));

            data.alertes.forEach(alerte => {
                let alerteDiv = document.createElement("div");
                alerteDiv.classList.add("alerte");

                // Extraction de la partie après le tiret
                let lignes = alerte.lignes.map(ligne => ligne.split("-")[1] || ligne); // Récupérer la partie après le tiret, ou toute la ligne si pas de tiret

                // Récupérer la couleur de la ligne et le pictogramme
                let couleurLigne = "#0073a6"; // Couleur par défaut
                let pictogramme = ""; // Pictogramme par défaut vide
                if (lignes.length > 0) {
                    couleurLigne = couleursLignes[lignes[0]]?.couleur || couleurLigne;
                    pictogramme = couleursLignes[lignes[0]]?.pictogramme || pictogramme;
                }

                // Formater la date de début et de fin avec l'heure
                const formatDate = (timestamp) => {
                    if (!timestamp) return "Non spécifié"; 

                    let date = new Date(timestamp);
                    if (isNaN(date.getTime())) return "Non spécifié";
                    
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    
                    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
                };

                const debut = formatDate(alerte.periode.debut);
                const fin = formatDate(alerte.periode.fin);

                // Clé unique pour identifier une alerte (ligne + début + fin + message)
                const alerteKey = `${lignes.join(", ")}-${debut}-${fin}-${alerte.message}`;

                // Vérifier si cette alerte a déjà été ajoutée
                if (!alertesUniques.includes(alerteKey)) {
                    // Si ce n'est pas un doublon, ajouter cette alerte au tableau et l'afficher
                    alertesUniques.push(alerteKey);

                    // Créer l'élément HTML pour l'alerte avec le nouveau format
                    alerteDiv.innerHTML = `
                    <div class="alerte-header">
                        📌 <span class="ligne" style="color: ${couleurLigne}">Ligne(s) : ${lignes.join(", ")}</span>
                    </div>
                    <div class="picto-ligne-container">
                        🚊 <img src="${pictogramme}" alt="Picto de la ligne" class="picto-ligne">
                    </div>
                    <div class="horodatage">
                        📅 Début : ${debut} - Fin : ${fin}
                    </div>
                    <p class="message">💬 ${alerte.message}</p>
                    `;

                    // Appliquer la couleur de la ligne à la barre de l'alerte
                    alerteDiv.style.borderLeft = `5px solid ${couleurLigne}`;

                    // Vérification si l'alerte doit aller dans l'historique
                    const finDate = new Date(alerte.periode.fin);
                    const currentTime = new Date();
                    if (currentTime > finDate.setHours(finDate.getHours())) {
                        // Si l'heure actuelle est plus grande que fin + 1 heure, déplacer dans l'historique
                        historiqueContainer.appendChild(alerteDiv);
                    } else {
                        // Sinon, garder l'alerte dans la section active
                        alertesContainer.appendChild(alerteDiv);
                    }
                }
            });
        });
});
