const express = require("express");
const { scrapeTwitterTrends } = require("./scrapeTwitterTrends"); 

const app = express();
const PORT = 10000;

app.use(express.static("public"));

app.get("/run-script", async (req, res) => {
    req.setTimeout(300000);
    try {
        const result = await scrapeTwitterTrends();
        if (result) {
            res.json(result);
        } else {
            res.status(500).send("Error fetching trends.");
        }                                                                                                                                                                                                               
    } catch (error) {
        console.error("Error in /run-script endpoint:", error);
        res.status(500).send("Internal server error.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

