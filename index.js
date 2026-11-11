//Importamos Express, que nos ayuda a crear el servidor web.
const express = require('express');
const app = express();

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

//Aquí definimos una ruta HTTP que responde cuando alguien hace una petición GET a /health.
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Task API funcionando'
    });
});

app.get('/tasks', (req, res) => {
    res.json(tasks);
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

app.post('/tasks', (req, res) => {

    const { title } = req.body;

    if(!title) {
        return res.status(400).json({
            message: "El titulo es obligatorio"
        })
    }

    const newTask = {
        id: 4,
        title: title,
        completed: false
    };

    tasks.push(newTask);
    res.status(201).json(newTask);

});

app.put('/tasks/:id', (req, res) => {

    const idTask = Number(req.params.id);

    const { title, completed } = req.body;

    const task = tasks.find(task => task.id === idTask);

    if (!task) {
        return res.status(404).json({
            message: "Tarea no encontrada"
        });
    }

    if (
        typeof title !== 'string' ||
        !title.trim() ||
        typeof completed !== 'boolean'
    ) {
        return res.status(400).json({
            message: "Se requiere un título válido y completed debe ser booleano"
        });
    }

    task.title = title.trim();
    task.completed = completed;

    res.status(200).json(task);

});

app.delete('/tasks/:id', (req, res) => {

    const idTask = Number(req.params.id);

    const taskIndex = tasks.findIndex(task => task.id === idTask);

    if (taskIndex === -1) {
        return res.status(404).json({
            message: "Tarea no encontrada"
        });
    }

    tasks.splice(taskIndex, 1);

    res.status(200).json({
        message: "Tarea eliminada correctamente"
    });

});

//Indicamos que nuestra aplicación debe escuchar peticiones en el puerto 3000.
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
