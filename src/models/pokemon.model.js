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

function modelListePokemon(page, type) {
    return new Promise((resolve, reject) => {
        const limite = 25;
        const offset = (page - 1) * limite;

        let requete = 'SELECT id, nom, type_primaire, type_secondaire, pv, attaque, defense FROM pokemon';
        let params = [];

        if (type) {
            requete += ' WHERE type_primaire = $1';
            params.push(type);
        }

        requete += ' LIMIT $2 OFFSET $3';
        params.push(limite, offset);

        sql.query(requete, params, (erreur, resultat) => {
            if (erreur) {
                console.log('Erreur SQL :', erreur);
                reject(erreur);
                return;
            }

            let requeteTotal = 'SELECT COUNT(*) AS total FROM pokemon';
            let paramsTotal = [];

            if (type) {
                requeteTotal += ' WHERE type_primaire = $1';
                paramsTotal.push(type);
            }

            sql.query(requeteTotal, paramsTotal, (err, totalResult) => {
                if (err) {
                    console.log('Erreur SQL :', err);
                    reject(err);
                    return;
                }

                const nombrePokemonTotal = totalResult.rows[0].total;
                const totalPage = Math.max(1, Math.ceil(nombrePokemonTotal / limite));

                resolve({
                    nombrePokemonTotal,
                    page,
                    totalPage,
                    pokemons: resultat.rows
                });
            });
        });
    });
}

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