import {modelListePokemon, modelAjouterPokemon, modelModifierPokemon, modelSupprimerPokemon, trouverUnPokemon} from '../models/pokemon.model.js';

//Permet d'afficher le pokemon selon son id
const AfficherPokemonSelonId = (req, res) => {
    const id = req.params.id; // Récupération de l'ID depuis l'URL

    if (isNaN(id)) {  // Vérifie si l'ID est un nombre valide
        res.status(400).json({ message: "L'ID du Pokémon doit être un nombre" });
        return;
    }

    trouverUnPokemon(id)
        .then((pokemon) => {
            if (pokemon.length === 0) { // Vérifie si aucun résultat n'est retourné
                res.status(404).json({ message: "Pokémon non trouvé" });
                return;
            }

            res.json(pokemon[0]); // Envoie le premier élément du tableau
        })
        .catch((error) => {
            res.status(500).json({ message: "Erreur serveur", erreur: error.message });
        });
};

const AfficherPokemonParListe = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Page par défaut : 1
    const type = req.query.type || null; // Type par défaut : aucun filtre

    if (page < 1) {
        return res.status(400).json({ message: "Le numéro de page doit être supérieur ou égal à 1" });
    }

    try {
        const resultat = await modelListePokemon(page, type);
        res.json(resultat);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", erreur: error.message });
    }
};


const AjouterPokemon = (req, res) => {
    const { nom, type_primaire, type_secondaire, pv, attaque, defense } = req.body;

    // Vérification des champs manquants
    let champsManquants = [];
    if (!nom) champsManquants.push("nom");
    if (!type_primaire) champsManquants.push("type_primaire");
    if (!type_secondaire) champsManquants.push("type_secondaire");
    if (!pv) champsManquants.push("pv");
    if (!attaque) champsManquants.push("attaque");
    if (!defense) champsManquants.push("defense");

    if (champsManquants.length > 0) {
        return res.status(400).json({
            erreur: "Le format des données est invalide",
            champ_manquant: champsManquants
        });
    }

    modelAjouterPokemon(nom, type_primaire, type_secondaire, pv, attaque, defense)
        .then((nouveauPokemon) => {
            res.status(201).json({
                message: `Le pokemon ${nouveauPokemon.nom} a été ajouté avec succès`,
                pokemon: nouveauPokemon
            });
        })
        .catch((error) => {
            console.error(`Erreur SQL ${error.sqlState} : ${error.sqlMessage}`);
            res.status(500).json({
                erreur: `Échec lors de la création du pokemon ${nom}`
            });
        });
};

const ModifierPokemon = (req, res) => {
    const id = req.params.id; // Récupération de l'ID depuis l'URL

    if (isNaN(id)) {  // Vérifie si l'ID est un nombre valide
        res.status(400).json({ message: "L'ID du Pokémon doit être un nombre" });
        return;
    }

    // Récupération des données envoyées dans le corps de la requête
    const { nom, type_primaire, type_secondaire, pv, attaque, defense } = req.body;

    if (!nom || !type_primaire || !pv || !attaque || !defense) {
        res.status(400).json({ message: "Tous les champs doivent être remplis" });
        return;
    }

    modelModifierPokemon(id, nom, type_primaire, type_secondaire, pv, attaque, defense)
        .then(() => {
            res.status(200).json({
                message: `Le Pokémon avec l'ID ${id} a été modifié avec succès`,
                pokemon: { id, nom, type_primaire, type_secondaire, pv, attaque, defense }
            });
        })
        .catch((error) => {
            console.error(`Erreur SQL ${error.sqlState} : ${error.sqlMessage}`);
            res.status(500).json({
                erreur: `Échec lors de la modification du Pokémon ${nom}`
            });
        });
};


const SupprimerPokemon = (req, res) => {
    const id = req.params.id; // Récupération de l'ID depuis l'URL

    if (isNaN(id)) {  // Vérifie si l'ID est un nombre valide
        res.status(400).json({ message: "L'ID du Pokémon doit être un nombre" });
        return;
    }

    modelSupprimerPokemon(id)
    .then((result) => {
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Aucun Pokémon trouvé avec l'ID ${id}` });
        }
        res.status(200).json({
            message: `Le Pokémon avec l'ID ${id} a été supprimé avec succès.`,
            id: id
        });
    })
        .catch((error) => {
            res.status(500).json({ message: "Erreur serveur", erreur: error.message });
        });
};




export { AfficherPokemonSelonId, AfficherPokemonParListe, AjouterPokemon, ModifierPokemon, SupprimerPokemon };
