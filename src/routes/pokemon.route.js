import express from 'express';
const router = express.Router();

import {AfficherPokemonParListe, AfficherPokemonSelonId, AjouterPokemon, ModifierPokemon, SupprimerPokemon} from '../controllers/pokemon.controller.js'

router.get('/liste', AfficherPokemonParListe);
router.get('/:id', AfficherPokemonSelonId);
router.post('/', AjouterPokemon);
router.put('/:id', ModifierPokemon);
router.delete('/:id', SupprimerPokemon);


export default router;