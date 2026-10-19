let enEdition = null;

const message = document.getElementById("message");
const errNote = document.querySelector("#errNote");
const form = document.querySelector(".e");
const btnSubmit = document.getElementById("btnSubmit"); 

form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const email = document.getElementById("email").value;
    const noteBrute = document.getElementById("note").value;
    const classe = document.getElementById("class").value;

    if (nom === "" || prenom === "" || email === "" || classe === "" || noteBrute === "") {
        message.textContent = "Champs incomplets !!";
        message.style.color= "red";
        return;
    }

    const note = parseFloat(noteBrute);
    if (! Number.isFinite(note) || note < 0 || note > 20) {
        alert("Les notes doivent être entre 0 et 20");
        return;
    } 
    const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];

    const emailExiste = etudiants.some((e, i) => 
    e.email.trim().toLowerCase() === email.trim().toLowerCase() && i !== enEdition
    );

    if (emailExiste) {
        message.textContent = "Cet email existe déjà !";
        message.style.color = "red";
        return;
    }

    // message.textContent = "etudiant ajouté avec succès";
    // message.style.color = "green"

    afficherPopup(
    "Étudiant ajouté !",
    "L'étudiant a été ajouté avec succès."
);
    const admission = note < 10 ? "ECHEC" : "ADMIS";

    const nouveauEtudiant = { nom, prenom, email, note, classe, admission };


    if (enEdition === null) {
        etudiants.push(nouveauEtudiant);
    } else {
        etudiants[enEdition] = nouveauEtudiant;
        enEdition = null;
        if (btnSubmit) btnSubmit.textContent = "Ajouter";
    }

    localStorage.setItem("etudiants", JSON.stringify(etudiants));

    AfficherEtudiants();
    form.reset();
});

function AfficherEtudiants() {
    const tab = document.getElementById("tab");
    const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];
    tab.innerHTML = "";

    etudiants.forEach(function (etudiant, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${etudiant.prenom} ${etudiant.nom}</td>
            <td>${etudiant.email}</td>
            <td>${etudiant.classe}</td>
            <td>${etudiant.note}</td>
           <td><span class="${etudiant.admission === 'ADMIS' ? 'admin' : 'ajourne'}">${etudiant.admission}</span></td>
            <td>
                <button class="btn-modifier" onclick="modifierEtudiant(${index})">Modifier</button>
                <button class= "btn-sup" onclick="supprimerEtudiant(${index})">Supprimer</button>
            </td>`;
        tab.appendChild(tr);
    });

    afficherStats();
}

function supprimerEtudiant(index) {
     if(confirm("voulez vous continuer?")){
        console.log("validé");
    
    afficherPopup(
    "Étudiant supprimé !",
    "L'étudiant a été supprimé de la liste."
);
    const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];
    etudiants.splice(index, 1);
    localStorage.setItem("etudiants", JSON.stringify(etudiants));
    

    } else{
        console.log("annulé");
        
    }
    AfficherEtudiants();
}

function modifierEtudiant(index) {
    const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];
    const e = etudiants[index];

    document.getElementById("nom").value = e.nom;
    document.getElementById("prenom").value = e.prenom;
    document.getElementById("email").value = e.email;
    document.getElementById("note").value = e.note;
    document.getElementById("class").value = e.classe;

    enEdition = index;
    // if (btnSubmit) btnSubmit.textContent = "Enregistrer les modifications";

    form.scrollIntoView({ behavior: "smooth" });
    document.getElementById("nom").focus();
    form.querySelector("button[type=submit]").textContent = "Enregistrer les modifications";
}

function afficherStats() {
    const etudiants = JSON.parse(localStorage.getItem("etudiants")) || [];
    document.getElementById("total").textContent = etudiants.length;

    if (etudiants.length > 0) {
        const somme = etudiants.reduce((acc, e) => acc + parseFloat(e.note), 0);
        const moyenne = (somme / etudiants.length).toFixed(2);
        const admis = etudiants.filter(e => e.admission === "ADMIS").length;
        document.getElementById("moyenne").textContent = `${moyenne} /20`;
        document.getElementById("admis").textContent = admis;
    } else {
        document.getElementById("moyenne").textContent = "0.00 /20";
        document.getElementById("admis").textContent = "0";
    }
}

AfficherEtudiants();

const root = document.documentElement;
const bouton = document.getElementById("theme-toggle");

const enregistrer = localStorage.getItem("theme");
const systemeSombre= window.matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme = enregistrer || (systemeSombre ? "dark" : "light");

bouton.addEventListener("click", () => {
    const nouveau = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nouveau;
    localStorage.setItem("theme",nouveau);
});

function filtrerEtudiants() {
    const rechercheInput = document.getElementById('recherche').value.toLowerCase();
    const filtreStatut = document.getElementById('filtreStatut').value;
    const lignes = document.querySelectorAll('table tbody tr');

    lignes.forEach(ligne => {
        const nomComplet = ligne.cells[0].textContent.toLowerCase();
        const email = ligne.cells[1].textContent.toLowerCase();
        const resultat = ligne.cells[4].textContent.trim(); // "ADMIS" ou "ECHEC"

        // Vérifie si la ligne correspond à la recherche (nom ou email)
        const correspondRecherche = nomComplet.includes(rechercheInput) || email.includes(rechercheInput);

        // Vérifie si la ligne correspond au filtre de statut sélectionné
        const correspondStatut = (filtreStatut === 'tous') || (resultat === filtreStatut);

        // Affiche ou masque la ligne selon les deux critères
        if (correspondRecherche && correspondStatut) {
            ligne.style.display = '';
        } else {
            ligne.style.display = 'none';
        }
    });
}

let pageActuelle = 1;
const lignesParPage = 5; // Nombre d'étudiants maximum par page

function filtrerEtudiants() {
    // À chaque modification de recherche ou de filtre, on revient à la première page
    pageActuelle = 1;
    afficherPage();
}

function changerPage(direction) {
    pageActuelle += direction;
    afficherPage();
}

function afficherPage() {
    const rechercheInput = document.getElementById('recherche').value.toLowerCase();
    const filtreStatut = document.getElementById('filtreStatut').value;
    const lignes = Array.from(document.querySelectorAll('table tbody tr'));

    // 1. Filtrer les lignes selon la recherche et le statut
    const lignesFiltrees = lignes.filter(ligne => {
        const nomComplet = ligne.cells[0].textContent.toLowerCase();
        const email = ligne.cells[1].textContent.toLowerCase();
        const resultat = ligne.cells[4].textContent.trim();

        const correspondRecherche = nomComplet.includes(rechercheInput) || email.includes(rechercheInput);
        const correspondStatut = (filtreStatut === 'tous') || (resultat === filtreStatut);

        return correspondRecherche && correspondStatut;
    });

    // 2. Calculer le nombre total de pages
    const totalPages = Math.ceil(lignesFiltrees.length / lignesParPage) || 1;

    // Sécurité si on dépasse les bornes
    if (pageActuelle > totalPages) pageActuelle = totalPages;
    if (pageActuelle < 1) pageActuelle = 1;

    // 3. Masquer toutes les lignes d'abord, puis n'afficher que celles de la page active
    lignes.forEach(ligne => ligne.style.display = 'none');

    const debut = (pageActuelle - 1) * lignesParPage;
    const fin = debut + lignesParPage;
    const lignesAffichees = lignesFiltrees.slice(debut, fin);

    lignesAffichees.forEach(ligne => {
        ligne.style.display = '';
    });

    // 4. Mettre à jour l'affichage des boutons et du texte de pagination
    document.getElementById('pageInfo').textContent = `Page ${pageActuelle} sur ${totalPages}`;
    document.getElementById('btnPrecedent').disabled = (pageActuelle === 1);
    document.getElementById('btnSuivant').disabled = (pageActuelle >= totalPages);

    // Griser visuellement les boutons désactivés (optionnel mais propre)
    document.getElementById('btnPrecedent').style.opacity = pageActuelle === 1 ? '0.5' : '1';
    document.getElementById('btnSuivant').style.opacity = pageActuelle >= totalPages ? '0.5' : '1';
}

// Appeler cette fonction une première fois au chargement de la page pour initialiser l'affichage
window.onload = function() {
    afficherPage();
};

function afficherPopup(titre, message) {
    document.getElementById("popupTitle").textContent = titre;
    document.getElementById("popupMessage").textContent = message;

    document.getElementById("popup").classList.add("active");
}

function fermerPopup() {
    document.getElementById("popup").classList.remove("active");
}
