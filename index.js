import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import pokemonRoutes from './src/routes/pokemon.route.js';
import sql from './src/config/dp_pg.js';

// Créer une application express
const app = express();

// Importer les middlewares
app.use(express.json());


app.use('/api/pokemon', pokemonRoutes);


// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le serveur http://localhost:${PORT}`);
});
