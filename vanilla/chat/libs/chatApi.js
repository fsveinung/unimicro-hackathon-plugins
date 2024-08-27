export class ChatApi {

    api;
    categories = {
        accounting: [
            "incomestatement", "accountstatement","balancesheet", "accountspayable", "accountsreceivable"
        ],
        sales: [
            "order", "invoice", "quote", "product",
        ],
        timetracking: [
            "workitem","worker","worktimeoff"
        ]
    };

    subactions = ["create", "fetch", "update"];

    constructor(api) {
        this.api = api;
    }

    mapRoute(subRoute) {
        const baseRoute = this.endpoint;
        return baseRoute + (baseRoute[baseRoute.length - 1] === "/" ? "" : "/") + subRoute;
    }

    normalizeResult(result) {
        // map from: { choices[ { message: { content: x } }] to " { Text: x }"
        // {"id":null,"choices":null}
        //debugger;
        let res = { Text: `{ "action": "unknown" }`};
        if (result?.choices?.length > 0) {
            var microsoftJson = result.choices[0].message?.content ?? "";
            if (microsoftJson && microsoftJson.indexOf("```json\n") >= 0) {
                const start = microsoftJson.indexOf("```json\n");
                const end = microsoftJson.indexOf("\n```", start + 8);
                if (start >= 0 && end > start) {
                    const res = { Text: microsoftJson.substring(start + 8, end) };
                    return res;
                }
            }
            res = { Text: microsoftJson }
            return res;
        }
        if (result.choices === null && result.id === null) {
            return { Text: JSON.stringify({ action: "error", message: "OpenAI er litt opptatt. Prøv igjen."})}
        }
        //throw "asfd"
        return res;
    }

    async chat(msg) {
        const jsonSpec = this.categories;
        const message = `Kan du oversette spørsmålet "${msg}" til en kommando i json.`
            + ` Eksempelvis:`
            + `"Hva er resultatet?" gir følgende kommando { "action": "incomestatement", "input": { "sum" } }`
            + `"Hvor mye skylder jeg?" gir { "action": "accountspayable", "input": { "subaction": "profit" } }`
            + `"Ny ordre til Ole Olsen?" gir { "action": "order", "input": { "subaction": "create", "Customer": "Ole Olsen" } }`
            + `"Hent ordrene mine" gir { "action": "order", "input": { "subaction": "fetch" } }`
            + `"Working 9 to 5" gir { "action": "timetracking", "input": { "subaction": "create", "from": 9, "to": 5 } }`
            + ` basert på følgende kategorier ` + JSON.stringify(jsonSpec) + ' ?'
            + ` Legg også alltid med en subaction fra følgende liste` + JSON.stringify(this.subactions) + '.'
            + ` Merk at tilbud, ordre og faktura trenger en kunde, og timeføring trenger tidspunkt (fra/til).`
            + ` Responder kun i gyldig json format.` //, men inkluder en veldig kort og hyggelig bekreftende kommentar på engelsk i message feltet.
            + ` Dersom du ikke kan svare gir du bare en json hvor du inkluder en kort kommentar med forklaring i feltet message.`;
        return this.normalizeResult(await this.api.http.post("/api/biz/ai-generate?action=generate-text", {
            "Temperature": 0,
            "Prompt": message,
            "TopPercentage": 50
        }));
    }

    async chatNatural(msg) {
        const jsonSpec = this.cateGories;
        const message = `Du er en regnskapsfører og skal svare på følgende spørsmål: "${msg}"`
        return this.normalizeResult(await this.api.http.post("/api/biz/ai-generate?action=generate-text", {
            "Temperature": 0,
            "Prompt": message,
            "TopPercentage": 50
        }));
    }

    async chatx(message) {
        var data = {
            action: "timetracking", input: { subaction: "create", from: "07:30", to: "15:45", lunch: "20 minutes" } 
        };
        data = { id:null, choices:null };
        return new Promise((resolve, reject)=> {
            setTimeout(() => {
                resolve({
                    Text: JSON.stringify(data)
                });
            }, 250);
        });
    }

}
