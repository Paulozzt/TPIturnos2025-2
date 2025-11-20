
const url = "https://691cfb23d58e64bf0d349a8a.mockapi.io/turnos";

export async function listarTurnos() {
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("Error API");
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function crearTurno(turno) {
    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(turno)
        });
        return await respuesta.json();
    } catch (error) {
        console.error(error);
    }
}

export async function modificarTurno(id, datos) {
    try {
        await fetch(`${url}/${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error(error);
    }
}

export async function borrarTurno(id) {
    try {
        await fetch(`${url}/${id}`, { method: 'DELETE' });
    } catch (error) {
        console.error(error);
    }
    
}



export async function obtenerTurno(id) {
    try {
        const respuesta = await fetch(`${url}/${id}`);
        if (!respuesta.ok) throw new Error("Error al obtener el turno");
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}


