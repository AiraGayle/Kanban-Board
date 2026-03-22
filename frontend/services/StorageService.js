//StorageService.js

// Storage Service — wraps localStorage for task persistence

export class StorageService {

    async load() {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:3000/board", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            return data.board || [];

        } catch (error) {
            throw new Error(`Failed to load tasks: ${error.message}`);
        }
    }

    async save(tasks) {
        try {
            const token = localStorage.getItem("token");

            const res= await fetch("http://localhost:3000/board", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ board: tasks })
            });
            const data = await res.json();
            console.log("SAVE RESPONSE:", data);


        } catch (error) {
            throw new Error(`Failed to save tasks: ${error.message}`);
        }
    }
}