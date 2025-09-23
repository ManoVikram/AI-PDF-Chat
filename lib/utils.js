"use server"

export async function uploadFileToRAG(file) {
    try {
        const formData = new FormData()
        formData.append("pdf", file)

        const response = await fetch("http://localhost:8080/upload", {
            method: "POST",
            body:formData
        })

        const data = await response.json()

        return data
    } catch (error) {
        console.error("Error uploading file:", error)
        throw error
    }
}