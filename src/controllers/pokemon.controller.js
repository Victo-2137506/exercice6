import { modelListePokemon, modelAjouterPokemon, modelModifierPokemon, modelSupprimerPokemon, trouverUnPokemon } from '../models/pokemon.model.js';

// Permet d'afficher un Pokémon selon son ID
const AfficherPokemonSelonId = (req, res) => {
    const id = parseInt(req.params.id); // Conversion en nombre

    if (isNaN(id)) {
        return res.status(400).json({ message: "L'ID du Pokémon doit être un nombre" });
    }

    trouverUnPokemon(id)
        .then((pokemon) => {
            if (!pokemon) {
                return res.status(404).json({ message: "Pokémon non trouvé" });
            }
            res.json(pokemon);
        })
        .catch((error) => {
            res.status(500).json({ message: "Erreur serveur", erreur: error.message });
        });
};

const AfficherPokemonParListe = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const type = req.query.type || null;

    if (page < 1) {
        return res.status(400).json({ message: "Le numéro de page doit être supérieur ou égal à 1" });
    }

    modelListePokemon(page, type)
        .then((resultat) => res.json(resultat))
        .catch((error) => res.status(500).json({ message: "Erreur serveur", erreur: error.message }));
};

const AjouterPokemon = (req, res) => {
    const { nom, type_primaire, type_secondaire, pv, attaque, defense } = req.body;

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
                message: `Le Pokémon ${nouveauPokemon.nom} a été ajouté avec succès`,
                pokemon: nouveauPokemon
            });
        })
        .catch((error) => {
            res.status(500).json({ erreur: `Échec lors de la création du Pokémon ${nom}`, message: error.message });
        });
};

const ModifierPokemon = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: "L'ID du Pokémon doit être un nombre" });
    }

    const { nom, type_primaire, type_secondaire, pv, attaque, defense } = req.body;

    if (!nom || !type_primaire || !pv || !attaque || !defense) {
        return res.status(400).json({ message: "Tous les champs doivent être remplis" });
    }

    modelModifierPokemon(id, nom, type_primaire, type_secondaire, pv, attaque, defense)
        .then((pokemon) => {
            res.status(200).json({
                message: `Le Pokémon avec l'ID ${id} a été modifié avec succès`,
                pokemon
            });
        })
        .catch((error) => {
            res.status(500).json({ erreur: `Échec lors de la modification du Pokémon ${nom}`, message: error.message });
        });
};

const SupprimerPokemon = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: "L'ID du Pokémon doit être un nombre" });
    }

    modelSupprimerPokemon(id)
        .then((resultat) => {
            if (resultat.rowCount === 0) {
                return res.status(404).json({ message: `Aucun Pokémon trouvé avec l'ID ${id}` });
            }
            res.status(200).json({
                message: `Le Pokémon avec l'ID ${id} a été supprimé avec succès.`,
                id
            });
        })
        .catch((error) => {
            res.status(500).json({ message: "Erreur serveur", erreur: error.message });
        });
};

export { AfficherPokemonSelonId, AfficherPokemonParListe, AjouterPokemon, ModifierPokemon, SupprimerPokemon };
