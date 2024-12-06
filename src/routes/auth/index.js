import { Router } from 'express';
import { pool } from '../../../server.js';
import db from '../../functions/db.js';
import tables from '../../utils/tables.js';

const router = Router();

//GET 

router.get('/auth', async (req, res) => {
    try {
        const { authorization } = req.headers;

        const usersSelect = 'SELECT * FROM public.cad_users';
        const usersSResult = await pool.query(usersSelect);

        return res.status(200).json(usersSResult.rows);

    } catch (error) {
        console.error('Erro detectado: ', error, 'Rota: ', req.url);
        return res.status(400).json({ error: 'Erro ao processar a solicitação' });
    }
});


router.get('/auth', async (req, res) => {
    try {
        const { authorization } = req.headers;
        const { user_id } = req.params;

        const userResult = await db.SELECT(tables.cad_users.schema,
            {
                [tables.cad_users.columns.id]: user_id,
            })
            // .then(result => console.log(result))
            .catch(error => console.error(error));

        return res.status(200).json(userResult);

    } catch (error) {
        console.error('Erro detectado: ', error, 'Rota: ', req.url);
        return res.status(400).json({ error: 'Erro ao processar a solicitação' });
    }
});

//POST

router.post('/auth', async (req, res) => {
    try {
        const { authorization } = req.headers;
        const { name, role } = req.body;

        await db.INSERT(tables.cad_users.schema,
            {
                [tables.cad_users.columns.name]: name,
                [tables.cad_users.columns.role]: role,
            })
            // .then(result => console.log(result))
            .catch(error => console.error(error));

        return res.status(200).json("Criado Usuario");

    } catch (error) {
        console.error('Erro detectado: ', error, 'Rota: ', req.url);
        return res.status(400).json({ error: 'Erro ao processar a solicitação' });
    }
});

//PUT

router.put('/auth', async (req, res) => {
    try {
        const { authorization } = req.headers;
        const { id, name, role } = req.body;

        await db.UPDATE(tables.cad_users.schema,
            {
                // [tables.news.columns.title]: title,
                [tables.cad_users.columns.name]: name,
                // [tables.news.columns.description]: description,
                [tables.cad_users.columns.role]: role,
            },
            {
                [tables.cad_users.columns.id]: id,
            })
            // .then(result => console.log(result))
            .catch(error => console.error(error));

        return res.status(200).json("Editado Usuario");

    } catch (error) {
        console.error('Erro detectado: ', error, 'Rota: ', req.url);
        return res.status(400).json({ error: 'Erro ao processar a solicitação' });
    }
});

//DELETE

router.delete('/auth', async (req, res) => {
    try {
        const { authorization } = req.headers;
        const { id } = req.body;

        await db.DELETE(tables.cad_users.schema,
            {
                [tables.cad_users.columns.id]: id,
            })
            // .then(result => console.log(result))
            .catch(error => console.error(error));

        return res.status(200).json("Removido Usuario");

    } catch (error) {
        console.error('Erro detectado: ', error, 'Rota: ', req.url);
        return res.status(400).json({ error: 'Erro ao processar a solicitação' });
    }
});


export default router;