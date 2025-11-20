const url = "https://691c858f3aaeed735c91300d.mockapi.io/users"; 

export async function listarUsuarios() {
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("Error API");
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function crearUsuario(usuario) {
    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });
        return await respuesta.json();
    } catch (error) {
        console.error(error);
    }
}

export async function borrarUsuario(id) {
    try {
        await fetch(`${url}/${id}`, { method: 'DELETE' });
    } catch (error) {
        console.error(error);
    }
}

export async function editarUsuario(id, datos) {
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

export async function obtenerUsuario(id) {
    try {
        const respuesta = await fetch(`${url}/${id}`);
        if (!respuesta.ok) throw new Error("Error al buscar usuario");
        return await respuesta.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}