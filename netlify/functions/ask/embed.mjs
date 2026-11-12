/*
 * Embeddings Cohere (embed-v5.0-fast, multilingue) pour la recherche sémantique.
 * - Au build : les passages sont encodés en int8 (512 dimensions) et embarqués dans knowledge.mjs.
 * - À l'exécution : seule la question est encodée (un appel, environ 300 ms).
 * Sans clé COHERE_API_KEY, ou si Cohere ne répond pas, l'assistant se replie sur BM25 et le routeur.
 */
export const EMBED_MODEL = "embed-v5.0-fast";
export const EMBED_DIMS = 512;

export async function embed(texts, { type, key, int8 = false, timeout = 4000 }) {
    const response = await fetch("https://api.cohere.com/v2/embed", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
            model: EMBED_MODEL,
            texts,
            input_type: type === "query" ? "search_query" : "search_document",
            embedding_types: [int8 ? "int8" : "float"],
            output_dimension: EMBED_DIMS,
            truncate: "END"
        }),
        signal: AbortSignal.timeout(timeout)
    });
    if (!response.ok) throw new Error(`cohere ${response.status}`);
    const data = await response.json();
    return int8 ? data.embeddings.int8 : data.embeddings.float;
}

/* Vecteur int8 <-> base64 (stockage compact dans knowledge.mjs). */
export const packInt8 = (vector) => Buffer.from(Int8Array.from(vector).buffer).toString("base64");
export function unpackInt8(b64) {
    const bytes = Buffer.from(b64, "base64");
    return new Int8Array(bytes.buffer, bytes.byteOffset, bytes.length);
}
