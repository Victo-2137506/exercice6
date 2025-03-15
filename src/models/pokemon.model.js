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

const modelListePokemon = (page, type) => {
    return new Promise((resolve, reject) => {
        const limite = 25; // Nombre de Pokémon affichés par page
        const offset = (page - 1) * limite; // Calcul de l'offset pour la pagination

        // Construction de la requête SQL de base pour récupérer les Pokémon
        let requete = 'SELECT nom, type_primaire, type_secondaire, pv, attaque, defense FROM pokemon';
        let params = [];

        // Ajout d'un filtre si un type est spécifié
        if (type) {
            requete += ' WHERE type_primaire = ?';
            params.push(type);
        }

        // Ajout de la pagination à la requête
        requete += ' LIMIT ? OFFSET ?';
        params.push(limite, offset);

        // Exécution de la première requête SQL pour récupérer les Pokémon filtrés et paginés
        db.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                console.log('Erreur sqlState ' + erreur.sqlState + ' : ' + erreur.sqlMessage);
                reject(erreur); // En cas d'erreur SQL, on rejette la promesse
                return;
            }

            // Construction de la requête pour compter le nombre total de Pokémon
            let requeteTotal = 'SELECT COUNT(*) AS total FROM pokemon';
            let paramsTotal = [];

            // Ajout du filtre sur le type si nécessaire
            if (type) {
                requeteTotal += ' WHERE type_primaire = ?';
                paramsTotal.push(type);
            }

            // Exécution de la requête pour obtenir le nombre total de Pokémon
            db.query(requeteTotal, paramsTotal, (err, totalResult) => {
                if (err) {
                    console.log('Erreur sqlState ' + err.sqlState + ' : ' + err.sqlMessage);
                    reject(err); // En cas d'erreur SQL, on rejette la promesse
                    return;
                }

                // Calcul du nombre total de pages
                const nombrePokemonTotal = totalResult[0].total;
                const totalPage = Math.max(1, Math.ceil(nombrePokemonTotal / limite));

                // Résolution de la promesse avec les résultats sous forme d'objet JSON
                resolve({
                    nombrePokemonTotal, // Nombre total de Pokémon correspondant à la requête
                    page, // Page actuelle
                    totalPage, // Nombre total de pages
                    pokemons: resultat // Liste des Pokémon retournés
                });
            });
        });
    });
};

const modelAjouterPokemon = (nom, type_primaire, type_secondaire, pv, attaque, defense) => {
    return new Promise((resolve, reject) => {
        const requete = 'INSERT INTO pokemon (nom, type_primaire, type_secondaire, pv, attaque, defense) VALUES (?,?,?,?,?,?)';
        const params = [nom, type_primaire, type_secondaire, pv, attaque, defense];

        db.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                reject(erreur);
                return;
            }
            resolve({ id: resultat.insertId, nom, type_primaire, type_secondaire, pv, attaque, defense });
        });
    });
};

const modelModifierPokemon = (id, nom, type_primaire, type_secondaire, pv, attaque, defense) => {
    return new Promise((resolve, reject) => {
        const requete = "UPDATE pokemon SET nom = ?, type_primaire = ?, type_secondaire = ?, pv = ?, attaque = ?, defense = ? WHERE id = ?";
        const params = [nom, type_primaire, type_secondaire, pv, attaque, defense, id];
        db.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                reject(erreur);
                return;
            }
            if (resultat.affectedRows === 0) {
                reject(new Error("Aucun Pokémon trouvé avec cet ID"));
                return;
            }
            resolve({ id, nom, type_primaire, type_secondaire, pv, attaque, defense });
        });
    });
};


const modelSupprimerPokemon = (id) => {
    return new Promise((resolve, reject) => {
        const requete = 'DELETE FROM pokemon WHERE id = ?';
        const params = [id];

        db.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                console.log(`Erreur sqlState ${erreur.sqlState} : ${erreur.sqlMessage}`);
                reject(erreur);
                return;
            }
            resolve(resultat);
        });
    });
};

export {modelListePokemon, modelAjouterPokemon, modelModifierPokemon, modelSupprimerPokemon, trouverUnPokemon};