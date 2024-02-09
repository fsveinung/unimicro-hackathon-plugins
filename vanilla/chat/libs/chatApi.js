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

    async chat(msg) {
        const jsonSpec = this.cateGories;
        const message = `$Kan du oversette spørsmålet "${msg}" til en kommando i json.`
            + ` Eksempelvis:`
            + `"Hva er resultatet?" gir følgende kommando { "action": "incomestatement", "input": { "sum" } }`
            + `"Hvor mye skylder jeg?" gir { "action": "accountspayable", "input": { "subaction": "profit" } }`
            + `"Ny ordre til Ole Olsen?" gir { "action": "order", "input": { "subaction": "create", "Customer": "Ole Olsen" } }`
            + `"Working 9 to 5" gir { "action": "timetracking", "input": { "subaction": "create", "from": 9, "to": 5 } }`
            + ` basert på følgende kategorier ` + JSON.stringify(jsonSpec) + ' ?'
            + ` Legg også alltid med en subaction fra følgende liste` + JSON.stringify(this.subactions) + '.'
            + ` Merk at tilbud, ordre og faktura trenger en kunde, og timeføring trenger tidspunkt (fra/til).`
            + ` Responder kun i gyldig json format.` //, men inkluder en veldig kort og hyggelig bekreftende kommentar på engelsk i message feltet.
            + ` Dersom du ikke kan svare gir du bare en json hvor du inkluder en kort kommentar med forklaring i feltet message.`;
        return await this.api.http.post("/api/biz/comments?action=generate", {
            "Temperature": 0,
            "Prompt": message,
            "TopPercentage": 50
        });
    }

    async chatNatural(msg) {
        const jsonSpec = this.cateGories;
        const message = `$Du er en regnskapsfører og skal svare på følgende spørsmål: "${msg}"`
        return await this.api.http.post("/api/biz/comments?action=generate", {
            "Temperature": 0,
            "Prompt": message,
            "TopPercentage": 50
        });
    }

    async chatx(message) {
        return new Promise((resolve, reject)=> {
            setTimeout(() => {
                resolve({
                    Text: ` { "action": "timetracking", "input": { "subaction": "create", "from": 8, "to": 4, "lunchbreak": 0.5, "meeting": { "person": "Knut Olsen", "from": 10, "to": 12 } } }`
                        //{ text: `{ "action": "order", "subaction": "create", "input": { "Customer": "Sjøfartsdirektoratet", "Duration": 2, "Items": [ { "Name": "PCP-11", "Quantity": 3 }, { "Name": "PCP-200", "Quantity": 5 } ] }, "message": "Order successfully created!" }` }
                });
            }, 250);
        });
    }

}
