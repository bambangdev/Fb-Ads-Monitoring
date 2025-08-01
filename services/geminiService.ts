
import { GoogleGenAI, Type } from "@google/genai";
import { RejectedAd, AdAnalysisResult } from "../types";

export const analyzeAdRejection = async (ad: RejectedAd): Promise<AdAnalysisResult | string> => {
    // API key is handled by environment variables.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        Anda adalah seorang ahli kebijakan iklan Facebook. Analisis iklan berikut dan berikan respons terstruktur dalam format JSON.

        **Detail Iklan untuk Dianalisis:**
        - Teks Iklan (Ad Copy): "${ad.adCopy}"
        - Deskripsi Gambar Iklan (Ad Creative Description): "${ad.adCreativeDescription}"
        - Alasan Penolakan Resmi: "${ad.reason}"

        **Tugas:**
        Berdasarkan detail di atas, berikan analisis komprehensif. Untuk setiap potensi pelanggaran, lakukan hal berikut:
        1.  **Identifikasi Kebijakan**: Sebutkan nama kebijakan Facebook yang dilanggar.
        2.  **Kutip Bagian Bermasalah**: Kutip frasa atau deskripsi spesifik dari iklan yang menyebabkan pelanggaran.
        3.  **Jelaskan Mengapa**: Berikan penjelasan yang jelas mengapa bagian tersebut melanggar kebijakan.
        4.  **Berikan Saran Perbaikan (Best Practice)**: Tawarkan saran perbaikan yang spesifik dan praktis. Contoh: "Fokus pada manfaat umum produk tanpa menyiratkan hasil yang mustahil".
        5.  **Berikan Contoh Perbaikan (Contoh Konkret)**: Sediakan contoh kalimat atau deskripsi gambar yang sudah diperbaiki dan bisa langsung digunakan oleh pengguna. Contoh: "Ganti dengan kalimat: 'Tingkatkan stamina dan vitalitas Anda untuk aktivitas sehari-hari.'".

        Selain itu, berikan juga ringkasan masalah secara umum dan rekomendasi perbaikan tingkat tinggi (untuk Teks Iklan dan Visual Iklan secara keseluruhan).
        
        Pastikan output Anda HANYA berupa objek JSON yang valid, sesuai dengan skema yang telah ditentukan.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            analisisJudul: {
                type: Type.STRING,
                description: "Judul singkat yang merangkum temuan utama analisis. Contoh: 'Pelanggaran Atribut Pribadi & Klaim Menyesatkan'."
            },
            ringkasanMasalah: {
                type: Type.STRING,
                description: "Ringkasan satu atau dua kalimat yang menjelaskan masalah inti pada iklan."
            },
            detailPelanggaran: {
                type: Type.ARRAY,
                description: "Daftar detail pelanggaran kebijakan yang ditemukan.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        kebijakan: {
                            type: Type.STRING,
                            description: "Nama kebijakan Facebook yang dilanggar (misalnya, 'Atribut Pribadi', 'Klaim Menyesatkan')."
                        },
                        kutipanBermasalah: {
                            type: Type.STRING,
                            description: "Kutipan teks atau deskripsi gambar yang melanggar kebijakan."
                        },
                        penjelasan: {
                            type: Type.STRING,
                            description: "Penjelasan ringkas mengapa kutipan tersebut melanggar kebijakan yang disebutkan."
                        },
                        saranPerbaikan: {
                            type: Type.STRING,
                            description: "Saran perbaikan (best practice) yang konkret dan dapat ditindaklanjuti untuk pelanggaran spesifik ini."
                        },
                        contohPerbaikan: {
                            type: Type.STRING,
                            description: "Contoh konkret kalimat atau deskripsi gambar yang sudah diperbaiki dan dapat langsung digunakan atau diadaptasi."
                        }
                    },
                    required: ["kebijakan", "kutipanBermasalah", "penjelasan", "saranPerbaikan", "contohPerbaikan"]
                }
            },
            rekomendasi: {
                type: Type.ARRAY,
                description: "Daftar rekomendasi perbaikan yang konkret dan dapat ditindaklanjuti.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        area: {
                            type: Type.STRING,
                            description: "Area yang perlu diperbaiki (misalnya, 'Teks Iklan', 'Visual Iklan', 'Penargetan')."
                        },
                        saran: {
                            type: Type.STRING,
                            description: "Saran spesifik tentang cara memperbaiki area tersebut agar sesuai dengan kebijakan."
                        }
                    },
                    required: ["area", "saran"]
                }
            }
        },
        required: ["analisisJudul", "ringkasanMasalah", "detailPelanggaran", "rekomendasi"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        
        const text = response.text;
        
        try {
            const parsedJson = JSON.parse(text);
            return parsedJson as AdAnalysisResult;
        } catch(e) {
            console.error("Failed to parse JSON response from Gemini:", text);
            return "Gagal mem-parsing hasil analisis dari AI. Respons yang diterima bukan format JSON yang valid.";
        }

    } catch (error) {
        console.error("Error analyzing ad with Gemini:", error);
        return "Terjadi kesalahan saat menganalisis iklan dengan AI. Ini mungkin karena masalah konfigurasi atau koneksi. Silakan coba lagi nanti.";
    }
};