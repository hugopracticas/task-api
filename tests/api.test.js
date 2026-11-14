const test = require('node:test');
const assert = require('node:assert/strict');

const API_URL = 'http://localhost:3001';

test('Task API - CRUD completo', async () => {

    // 1. Comprobar que la API responde
    const health = await fetch(`${API_URL}/health`);

    assert.equal(health.status, 200);

    // 2. Crear una tarea
    const createResponse = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Prueba automatizada'
        })
    });

    assert.equal(createResponse.status, 201);

    const createdTask = await createResponse.json();
    const id = createdTask.id;

    assert.equal(createdTask.title, 'Prueba automatizada');

    // 3. Consultar la tarea creada
    const getResponse = await fetch(`${API_URL}/tasks/${id}`);

    assert.equal(getResponse.status, 200);

    const task = await getResponse.json();
    assert.equal(task.id, id);

    // 4. Actualizar la tarea
    const updateResponse = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Tarea actualizada',
            completed: true
        })
    });

    assert.equal(updateResponse.status, 200);

    const updatedTask = await updateResponse.json();

    assert.equal(updatedTask.completed, true);
    assert.equal(updatedTask.title, 'Tarea actualizada');

    // 5. Eliminar la tarea
    const deleteResponse = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
    });

    assert.equal(deleteResponse.status, 200);

    // 6. Verificar que ya no existe
    const finalResponse = await fetch(`${API_URL}/tasks/${id}`);

    assert.equal(finalResponse.status, 404);
});
