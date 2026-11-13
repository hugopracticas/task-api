//Importamos Express, que nos ayuda a crear el servidor web.
const express = require('express');
const app = express();
const pool = require('./db');

app.use(express.json());

const PORT = 3001;

let tasks = [
    {
        id: 1,
        title: "Estudiar Linux",
        completed: true
    },
    {
        id: 2,
        title: "Aprender Docker",
        completed: false
    },
    {
        id: 3,
        title: "Practicar Kubernetes",
        completed: false
    }
];

app.get('/db-health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS server_time');

        res.status(200).json({
            status: 'OK',
            database: 'connected',
            serverTime: result.rows[0].server_time
        });

    } catch (error) {
        console.error('Error al conectar con PostgreSQL, favor de revisar:', error.message);

        res.status(503).json({
            status: 'ERROR',
            database: 'disconnected'
        });
    }
});

//Aquí definimos una ruta HTTP que responde cuando alguien hace una petición GET a /health.
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Task API funcionando al 100'
    });
});

// app.get('/tasks', (req, res) => {
//     res.json(tasks);
// });

app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, completed FROM tasks ORDER BY id'
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error al consultar tareas:', error.message);

        res.status(500).json({
            message: 'Error al consultar las tareas'
        });
    }
});

app.get('/tasks/:id', (req, res) => {
    const idTask = Number(req.params.id);
    const getTask = tasks.find((task) => task.id === idTask);

    if(!getTask){
        return res.status(404).json({
            message: 'Tarea no encontrada'
        })
    }
    res.json(getTask);
});

// app.post('/tasks', (req, res) => {

//     const { title } = req.body;

//     if(!title) {
//         return res.status(400).json({
//             message: "El titulo es obligatorio"
//         })
//     }

//     const newTask = {
//         id: 4,
//         title: title,
//         completed: false
//     };

//     tasks.push(newTask);
//     res.status(201).json(newTask);

// });
app.post('/tasks', async (req, res) => {
    try {
        const { title } = req.body;

        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                message: 'El título es obligatorio y debe ser válido'
            });
        }

        const result = await pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
            [title.trim()]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error al crear tarea:', error.message);

        res.status(500).json({
            message: 'Error al crear la tarea'
        });
    }
});

// app.put('/tasks/:id', (req, res) => {

//     const idTask = Number(req.params.id);

//     const { title, completed } = req.body;

//     const task = tasks.find(task => task.id === idTask);

//     if (!task) {
//         return res.status(404).json({
//             message: "Tarea no encontrada"
//         });
//     }

//     if (
//         typeof title !== 'string' ||
//         !title.trim() ||
//         typeof completed !== 'boolean'
//     ) {
//         return res.status(400).json({
//             message: "Se requiere un título válido y completed debe ser booleano"
//         });
//     }

//     task.title = title.trim();
//     task.completed = completed;

//     res.status(200).json(task);

// });
app.put('/tasks/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, completed } = req.body;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: 'ID inválido'
            });
        }

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            title.trim().length > 255 ||
            typeof completed !== 'boolean'
        ) {
            return res.status(400).json({
                message: 'Título o estado inválido'
            });
        }

        const result = await pool.query(
            `UPDATE tasks
             SET title = $1, completed = $2
             WHERE id = $3
             RETURNING id, title, completed`,
            [title.trim(), completed, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Tarea no encontrada'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error al actualizar tarea:', error.message);

        res.status(500).json({
            message: 'Error al actualizar la tarea'
        });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: 'ID inválido'
            });
        }

        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Tarea no encontrada'
            });
        }

        res.status(200).json({
            message: 'Tarea eliminada correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar tarea:', error.message);

        res.status(500).json({
            message: 'Error al eliminar la tarea'
        });
    }
});
// app.delete('/tasks/:id', (req, res) => {

//     const idTask = Number(req.params.id);

//     const taskIndex = tasks.findIndex(task => task.id === idTask);

//     if (taskIndex === -1) {
//         return res.status(404).json({
//             message: "Tarea no encontrada"
//         });
//     }

//     tasks.splice(taskIndex, 1);

//     res.status(200).json({
//         message: "Tarea eliminada correctamente"
//     });

// });

//Indicamos que nuestra aplicación debe escuchar peticiones en el puerto 3000.
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
