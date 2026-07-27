const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "nzen" || window.location.hostname === "dxreport.web");

const optigoAiChat = async (body) => {
    try {
        const APIURL = isLocal
            ? "http://apioptigoai.web/api/chat"
            : "https://apioptigoai.optigoapps.com/api/chat";

        const response = await fetch(APIURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error in optigoAiChat:", error);
        throw error;
    }
};

export default optigoAiChat;