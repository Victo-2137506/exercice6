import sql from '../config/dp_pg.js';

function trouverUnPokemon(id) {
    return new Promise((resolve, reject) => {
        const requete = 'SELECT id, nom, type_primaire, type_secondaire, pv, attaque, defense FROM pokemon WHERE id = $1';
        const parametres = [id];

        sql.query(requete, parametres, (erreur, resultat) => {
            if (erreur) {
                console.log('Erreur sqlState : ' + erreur);
                console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                reject(erreur);
            }

            resolve(resultat.rows);
        });
    });
}

import sql from '../config/dp_pg.js';

const modelListePokemon = (page, type) => {
    return new Promise((resolve, reject) => {
        const limite = 25; // Nombre de Pokémon affichés par page
        const offset = (page - 1) * limite; // Calcul de l'offset pour la pagination

        // Construction de la requête SQL de base pour récupérer les Pokémon
        let requete = 'SELECT nom, type_primaire, type_secondaire, pv, attaque, defense FROM pokemon';
        let params = [];

        // Ajout d'un filtre si un type est spécifié
        if (type) {
            requete += ' WHERE type_primaire = $1';
            params.push(type);
        }

        // Ajout de la pagination à la requête
        requete += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limite, offset);

        // Exécution de la première requête SQL pour récupérer les Pokémon filtrés et paginés
        sql.query(requete, params)
            .then(resultat => {
                // Construction de la requête pour compter le nombre total de Pokémon
                let requeteTotal = 'SELECT COUNT(*) AS total FROM pokemon';
                let paramsTotal = [];

                // Ajout du filtre sur le type si nécessaire
                if (type) {
                    requeteTotal += ' WHERE type_primaire = $1';
                    paramsTotal.push(type);
                }

                // Exécution de la requête pour obtenir le nombre total de Pokémon
                sql.query(requeteTotal, paramsTotal)
                    .then(totalResult => {
                        const nombrePokemonTotal = totalResult.rows[0].total;
                        const totalPage = Math.max(1, Math.ceil(nombrePokemonTotal / limite));

                        resolve({
                            nombrePokemonTotal, // Nombre total de Pokémon correspondant à la requête
                            page, // Page actuelle
                            totalPage, // Nombre total de pages
                            pokemons: resultat.rows // Liste des Pokémon retournés
                        });
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
};

const modelAjouterPokemon = (nom, type_primaire, type_secondaire, pv, attaque, defense) => {
    return new Promise((resolve, reject) => {
        const requete = 'INSERT INTO pokemon (nom, type_primaire, type_secondaire, pv, attaque, defense) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        const params = [nom, type_primaire, type_secondaire, pv, attaque, defense];

        sql.query(requete, params)
            .then(resultat => {
                resolve({ id: resultat.rows[0].id, nom, type_primaire, type_secondaire, pv, attaque, defense });
            })
            .catch(err => reject(err));
    });
};

const modelModifierPokemon = (id, nom, type_primaire, type_secondaire, pv, attaque, defense) => {
    return new Promise((resolve, reject) => {
        const requete = "UPDATE pokemon SET nom = $1, type_primaire = $2, type_secondaire = $3, pv = $4, attaque = $5, defense = $6 WHERE id = $7 RETURNING *";
        const params = [nom, type_primaire, type_secondaire, pv, attaque, defense, id];

        sql.query(requete, params)
            .then(resultat => {
                if (resultat.rowCount === 0) {
                    reject(new Error("Aucun Pokémon trouvé avec cet ID"));
                    return;
                }
                resolve(resultat.rows[0]);
            })
            .catch(err => reject(err));
    });
};

const modelSupprimerPokemon = (id) => {
    return new Promise((resolve, reject) => {
        const requete = 'DELETE FROM pokemon WHERE id = $1 RETURNING *';
        const params = [id];

        sql.query(requete, params)
            .then(resultat => {
                if (resultat.rowCount === 0) {
                    reject(new Error("Aucun Pokémon trouvé avec cet ID"));
                    return;
                }
                resolve(resultat.rows[0]);
            })
            .catch(err => reject(err));
    });
};

export { modelListePokemon, modelAjouterPokemon, modelModifierPokemon, modelSupprimerPokemon, trouverUnPokemon };
